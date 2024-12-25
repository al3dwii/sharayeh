// src/components/CreatePresentation.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { useCredits } from "@/contexts/CreditContext"; // Using CreditContext
import Modal from "@/components/custom/ocrModal";
import Loading from "@/components/global/loading";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import TemplateModal from "./TemplateModal";
import Notifications from "@/components/Notifications"; // Import the Notifications component
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi"; // Icons from react-icons
import PresentationForm from "./PresentationForm"; // Import the new extracted form component
import { useProModal } from "@/hooks/useProModal"; // Import the Zustand store

interface Template {
  id: string;
  name: string;
  preview: string;
  category: string;
}

const CreatePresentation: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const { getToken } = useAuth();
  const { credits, refreshCredits } = useCredits();

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [topicValue, setTopicValue] = useState<string>("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // New state for user subscription tier
  const [userTier, setUserTier] = useState<string>("free"); // Default to 'free'

  const pollingIntervalIdRef = useRef<number | null>(null);
  const pollingTimeoutIdRef = useRef<number | null>(null); // Ref for the timeout

  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = 3; // Maximum number of retries

  // Import the ProModal control
  const onOpenProModal = useProModal((state) => state.onOpen);

  // Constants for validation
  const MAX_TOPIC_LENGTH = 100; // Maximum allowed length for the topic input
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum file size in bytes (5 MB)
  const ALLOWED_FILE_TYPES = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx MIME type
  ];

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!user) return;

      try {
        const token = await getToken();
        const response = await axios.get("/api/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserTier(response.data.userTier);
        console.log("📊 User Tier:", response.data.userTier);
      } catch (error) {
        console.error("Error fetching user status:", error);
        setUserTier("free"); // Default to free if there's an error
      }
    };

    fetchUserStatus();
  }, [user, getToken]);

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Check if the topic exceeds the maximum length
    if (value.length > MAX_TOPIC_LENGTH) {
      setSubmissionStatus("topic-too-long");
      return;
    }

    if (submissionStatus) {
      setSubmissionStatus("");
    }

    setTopicValue(value);

    // If the topic is not empty, clear the document file
    if (value !== "") {
      setDocumentFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setSubmissionStatus("file-too-large");
        return;
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setSubmissionStatus("invalid-file-type");
        return;
      }

      // **New: Check if the user is uploading a file and is not premium**
      if (userTier !== "premium") {
        // Open the ProModal to prompt user to upgrade
        onOpenProModal();

        // Set submission status to "upgrade-required" to handle in Notifications
        setSubmissionStatus("upgrade-required");

        // Prevent setting the file
        return;
      }

      if (submissionStatus) {
        setSubmissionStatus("");
      }

      setDocumentFile(file);
      setTopicValue("");
    } else {
      setDocumentFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      router.push("/sign-in");
      return;
    }

    // Ensure at least one field is filled
    if (!topicValue && !documentFile) {
      setSubmissionStatus("empty");
      return;
    }

    // Ensure a template is selected
    if (!selectedTemplate) {
      setSubmissionStatus("templateRequired");
      return;
    }

    // **New: Check if the user is uploading a file and is not premium**
    if (documentFile && userTier !== "premium") {
      // Open the ProModal to prompt user to upgrade
      onOpenProModal();

      // Set submission status to "upgrade-required" to handle in Notifications
      setSubmissionStatus("upgrade-required");
      return;
    }

    // Ensure sufficient credits
    if (credits === null || credits < 1) {
      setShowInsufficientCreditsModal(true);
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus("");
    setRetryCount(0);

    try {
      const token = await getToken();
      if (!token) {
        setSubmissionStatus("unauthorized");
        return;
      }

      // Create a new File record
      const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
      const response = await axios.post(
        "/api/files",
        {
          fileName,
          type: "PRESENTATION",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newRequestId = response.data.id;
      setRequestId(newRequestId);

      // **1. Set Webhook URL to the centralized makeWebhook API**
      const webhookUrl = "/api/makeWebhook";

      if (topicValue) {
        // **2. For topic submissions, send JSON payload to makeWebhook**
        const payload = {
          topic: topicValue,
          templateId: selectedTemplate.id,
          categoryId: selectedTemplate.category,
          userId: user.id,
          requestId: newRequestId,
        };

        console.log("📡 Sending data to centralized webhook API (topic).");
        await axios.post(webhookUrl, payload, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
      } else if (documentFile) {
        // **3. For file submissions, send FormData to makeWebhook**
        const formData = new FormData();
        formData.append("document", documentFile);
        formData.append("templateId", selectedTemplate.id);
        formData.append("categoryId", selectedTemplate.category);
        formData.append("userId", user.id);
        formData.append("requestId", newRequestId);

        console.log("📡 Sending data to centralized webhook API (file).");
        await axios.post(webhookUrl, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
      }

      setSubmissionStatus("success");

      // Reset fields
      setTopicValue("");
      setDocumentFile(null);
      setSelectedTemplate(null);

      // Start polling
      startPolling(newRequestId);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setSubmissionStatus("network-error");
        } else if (
          error.response.status === 400 &&
          error.response.data.error === "Insufficient credits"
        ) {
          setSubmissionStatus("insufficient-credits");
        } else if (error.response.status === 401) {
          setSubmissionStatus("unauthorized");
        } else if (error.response.status >= 500) {
          setSubmissionStatus("server-error");
        } else if (error.response.status >= 400) {
          setSubmissionStatus("client-error");
        } else {
          setSubmissionStatus("unexpected-error");
        }
      } else {
        setSubmissionStatus("unexpected-error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startPolling = (requestId: string) => {
    // Clear any existing intervals and timeouts
    if (pollingIntervalIdRef.current) {
      clearInterval(pollingIntervalIdRef.current);
      pollingIntervalIdRef.current = null;
    }

    if (pollingTimeoutIdRef.current) {
      clearTimeout(pollingTimeoutIdRef.current);
      pollingTimeoutIdRef.current = null;
    }

    setIsLoading(true);

    const intervalId = window.setInterval(async () => {
      try {
        const token = await getToken();
        if (!token) {
          setSubmissionStatus("unauthorized");
          stopPolling();
          return;
        }

        const res = await axios.get("/api/getfilemake", {
          params: { requestId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && res.data.status === "COMPLETED") {
          setIsLoading(false);
          setDownloadUrl(res.data.downloadUrl);
          stopPolling();

          // Deduct credits
          try {
            const token = await getToken();
            if (!token) {
              setSubmissionStatus("unauthorized");
              return;
            }

            await axios.patch(
              "/api/update-credits",
              { pointsUsed: 100 },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            await refreshCredits();
            router.refresh();
          } catch (creditError) {
            console.error("Error updating credits after completion:", creditError);
          }
        } else if (res.data.status === "FAILED") {
          setIsLoading(false);
          setSubmissionStatus("error");
          stopPolling();
        }
      } catch (error) {
        // Handle polling errors if needed
        console.error("Error during polling:", error);
      }
    }, 5000);

    pollingIntervalIdRef.current = intervalId;

    const timeoutId = window.setTimeout(() => {
      // Timeout after 1 minute
      if (pollingIntervalIdRef.current) {
        clearInterval(pollingIntervalIdRef.current);
        pollingIntervalIdRef.current = null;
      }

      setRetryCount((prev) => {
        const newCount = prev + 1;
        if (newCount < maxRetries) {
          // Retry polling
          startPolling(requestId);
        } else {
          setSubmissionStatus("timeout-error");
          setIsLoading(false);
        }
        return newCount;
      });

      pollingTimeoutIdRef.current = null;
    }, 60000); // 1 minute

    pollingTimeoutIdRef.current = timeoutId;
  };

  const stopPolling = () => {
    if (pollingIntervalIdRef.current) {
      clearInterval(pollingIntervalIdRef.current);
      pollingIntervalIdRef.current = null;
    }

    if (pollingTimeoutIdRef.current) {
      clearTimeout(pollingTimeoutIdRef.current);
      pollingTimeoutIdRef.current = null;
    }

    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalIdRef.current) {
        clearInterval(pollingIntervalIdRef.current);
      }
      if (pollingTimeoutIdRef.current) {
        clearTimeout(pollingTimeoutIdRef.current);
      }
    };
  }, []);

  const handleDownload = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    router.refresh();
  };

  return (
    <>
      {/* Render Notifications based on submissionStatus */}
      <Notifications status={submissionStatus} />

      {/* Existing Insufficient Credits Modal */}
      <Modal
        isOpen={showInsufficientCreditsModal}
        onClose={() => setShowInsufficientCreditsModal(false)}
        title="رصيدك غير كافٍ"
        message="ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى ترقية خطتك."
        actionText="ترقية الخطة"
        actionLink="/pricing"
      />

      {/* Render the global ProModal */}
      {/* Since ProModal is already rendered globally in layout.tsx, this is optional.
          Uncomment the line below if you prefer to render it here as well. */}
      {/* <ProModal /> */}

      <div className="max-w-6xl mx-auto bg-gray-100 mt-4 rounded-lg shadow-lg p-4">
        <div className="flex flex-col items-center text-xl justify-center text-slate-900 pb-4 gap-4">
          <h1>بوربوينت بالذكاء الصناعي</h1>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-600 pb-4 gap-4">
          <p>اكتب الموضوع أو حمل ملف وورد ثم اختر القالب لإنشاء بوربوينت بالذكاء الصناعي قابل للتعديل</p>
        </div>
        <div className="bg-white rounded-lg shadow p-2">
          <Card>
            <CardHeader></CardHeader>
            {(submissionStatus || isLoading || downloadUrl) && (
              <div className="rounded-lg pb-4 mb-4 p-4">
                {isLoading && (
                  <div className="w-full flex flex-col items-center mt-4">
                    <div className="flex items-center justify-center">
                      <Loading />
                    </div>
                    <div className="w-full flex justify-center p-4 mt-4 text-gray-400 text-center">
                      .....يتم تجهيز ملف العرض الرجاء الانتظار قليلاً
                    </div>
                    <div className="w-1/2 border-t border-gray-300 mt-2"></div>
                  </div>
                )}
                {downloadUrl ? (
                  <div className="w-full flex justify-center mt-4">
                    <button
                      onClick={handleDownload}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      تحميل الملف
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500 mt-4 text-center"></div>
                )}
              </div>
            )}

            <CardContent>
              <PresentationForm
                topicValue={topicValue}
                documentFile={documentFile}
                selectedTemplate={selectedTemplate}
                isSubmitting={isSubmitting}
                isLoading={isLoading}
                handleTopicChange={handleTopicChange}
                handleFileChange={handleFileChange}
                handleSubmit={handleSubmit}
                setIsModalOpen={setIsModalOpen}
              />
            </CardContent>
          </Card>
        </div>

        {isModalOpen && (
          <TemplateModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelect={(template) => setSelectedTemplate(template)}
          />
        )}
      </div>
    </>
  );
};

export default CreatePresentation;

// // src/components/CreatePresentation.tsx

// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { useUser, useAuth } from "@clerk/nextjs";
// import { useCredits } from "@/contexts/CreditContext"; // Using CreditContext
// import Modal from "@/components/custom/ocrModal";
// import Loading from "@/components/global/loading";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import TemplateModal from "./TemplateModal";
// import Notifications from "@/components/Notifications"; // Import the Notifications component
// import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi"; // Icons from react-icons
// import PresentationForm from "./PresentationForm"; // Import the new extracted form component
// import { useProModal } from "@/hooks/useProModal"; // Import the Zustand store

// import ProModal from '@/components/ProModal'; // Ensure correct casing and path


// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   category: string;
// }

// const CreatePresentation: React.FC = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const { getToken } = useAuth();
//   const { credits, refreshCredits } = useCredits();

//   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
//   const [submissionStatus, setSubmissionStatus] = useState<string>("");
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState<boolean>(false);
//   const [requestId, setRequestId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [topicValue, setTopicValue] = useState<string>("");
//   const [documentFile, setDocumentFile] = useState<File | null>(null);

//   // New state for user subscription tier
//   const [userTier, setUserTier] = useState<string>("free"); // Default to 'free'

//   const pollingIntervalIdRef = useRef<number | null>(null);
//   const pollingTimeoutIdRef = useRef<number | null>(null); // Ref for the timeout

//   const [retryCount, setRetryCount] = useState<number>(0);
//   const maxRetries = 3; // Maximum number of retries

//   // Import the ProModal control
//   const onOpenProModal = useProModal((state) => state.onOpen);

//   // Constants for validation
//   const MAX_TOPIC_LENGTH = 100; // Maximum allowed length for the topic input
//   const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum file size in bytes (5 MB)
//   const ALLOWED_FILE_TYPES = [
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx MIME type
//   ];

//   useEffect(() => {
//     const fetchUserStatus = async () => {
//       if (!user) return;

//       try {
//         const token = await getToken();
//         const response = await axios.get("/api/status", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setUserTier(response.data.userTier);
//         console.log("📊 User Tier:", response.data.userTier);
//       } catch (error) {
//         console.error("Error fetching user status:", error);
//         setUserTier("free"); // Default to free if there's an error
//       }
//     };

//     fetchUserStatus();
//   }, [user, getToken]);

//   const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     // Check if the topic exceeds the maximum length
//     if (value.length > MAX_TOPIC_LENGTH) {
//       setSubmissionStatus("topic-too-long");
//       return;
//     }

//     if (submissionStatus) {
//       setSubmissionStatus("");
//     }

//     setTopicValue(value);

//     // If the topic is not empty, clear the document file
//     if (value !== "") {
//       setDocumentFile(null);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];

//       // Validate file size
//       if (file.size > MAX_FILE_SIZE) {
//         setSubmissionStatus("file-too-large");
//         return;
//       }

//       // Validate file type
//       if (!ALLOWED_FILE_TYPES.includes(file.type)) {
//         setSubmissionStatus("invalid-file-type");
//         return;
//       }

//       // **New: Check if the user is uploading a file and is not premium**
//       if (userTier !== "premium") {
//         // Open the ProModal to prompt user to upgrade
//         onOpenProModal();

//         // Optionally, set an error message or toast
//         setSubmissionStatus("upgrade-required");
//         // Prevent setting the file
//         return;
//       }

//       if (submissionStatus) {
//         setSubmissionStatus("");
//       }

//       setDocumentFile(file);
//       setTopicValue("");
//     } else {
//       setDocumentFile(null);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!user) {
//       router.push("/sign-in");
//       return;
//     }

//     // Ensure at least one field is filled
//     if (!topicValue && !documentFile) {
//       setSubmissionStatus("empty");
//       return;
//     }

//     // Ensure a template is selected
//     if (!selectedTemplate) {
//       setSubmissionStatus("templateRequired");
//       return;
//     }

//     // **New: Check if the user is uploading a file and is not premium**
//     if (documentFile && userTier !== "premium") {
//       // Open the ProModal to prompt user to upgrade
//       onOpenProModal();

//       // Optionally, set an error message or toast
//       setSubmissionStatus("upgrade-required");
//       return;
//     }

//     // Ensure sufficient credits
//     if (credits === null || credits < 1) {
//       setShowInsufficientCreditsModal(true);
//       return;
//     }

//     setIsSubmitting(true);
//     setSubmissionStatus("");
//     setRetryCount(0);

//     try {
//       const token = await getToken();
//       if (!token) {
//         setSubmissionStatus("unauthorized");
//         return;
//       }

//       // Create a new File record
//       const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
//       const response = await axios.post(
//         "/api/files",
//         {
//           fileName,
//           type: "PRESENTATION",
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const newRequestId = response.data.id;
//       setRequestId(newRequestId);

//       // **1. Set Webhook URL to the centralized makeWebhook API**
//       const webhookUrl = "/api/makeWebhook";

//       if (topicValue) {
//         // **2. For topic submissions, send JSON payload to makeWebhook**
//         const payload = {
//           topic: topicValue,
//           templateId: selectedTemplate.id,
//           categoryId: selectedTemplate.category,
//           userId: user.id,
//           requestId: newRequestId,
//         };

//         console.log("📡 Sending data to centralized webhook API (topic).");
//         await axios.post(webhookUrl, payload, {
//           headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         });
//       } else if (documentFile) {
//         // **3. For file submissions, send FormData to makeWebhook**
//         const formData = new FormData();
//         formData.append("document", documentFile);
//         formData.append("templateId", selectedTemplate.id);
//         formData.append("categoryId", selectedTemplate.category);
//         formData.append("userId", user.id);
//         formData.append("requestId", newRequestId);

//         console.log("📡 Sending data to centralized webhook API (file).");
//         await axios.post(webhookUrl, formData, {
//           headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
//         });
//       }

//       setSubmissionStatus("success");

//       // Reset fields
//       setTopicValue("");
//       setDocumentFile(null);
//       setSelectedTemplate(null);

//       // Start polling
//       startPolling(newRequestId);
//     } catch (error: any) {
//       if (axios.isAxiosError(error)) {
//         if (!error.response) {
//           setSubmissionStatus("network-error");
//         } else if (
//           error.response.status === 400 &&
//           error.response.data.error === "Insufficient credits"
//         ) {
//           setSubmissionStatus("insufficient-credits");
//         } else if (error.response.status === 401) {
//           setSubmissionStatus("unauthorized");
//         } else if (error.response.status >= 500) {
//           setSubmissionStatus("server-error");
//         } else if (error.response.status >= 400) {
//           setSubmissionStatus("client-error");
//         } else {
//           setSubmissionStatus("unexpected-error");
//         }
//       } else {
//         setSubmissionStatus("unexpected-error");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const startPolling = (requestId: string) => {
//     // Clear any existing intervals and timeouts
//     if (pollingIntervalIdRef.current) {
//       clearInterval(pollingIntervalIdRef.current);
//       pollingIntervalIdRef.current = null;
//     }

//     if (pollingTimeoutIdRef.current) {
//       clearTimeout(pollingTimeoutIdRef.current);
//       pollingTimeoutIdRef.current = null;
//     }

//     setIsLoading(true);

//     const intervalId = window.setInterval(async () => {
//       try {
//         const token = await getToken();
//         if (!token) {
//           setSubmissionStatus("unauthorized");
//           stopPolling();
//           return;
//         }

//         const res = await axios.get("/api/getfilemake", {
//           params: { requestId },
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (res.data && res.data.status === "COMPLETED") {
//           setIsLoading(false);
//           setDownloadUrl(res.data.downloadUrl);
//           stopPolling();

//           // Deduct credits
//           try {
//             const token = await getToken();
//             if (!token) {
//               setSubmissionStatus("unauthorized");
//               return;
//             }

//             await axios.patch(
//               "/api/update-credits",
//               { pointsUsed: 100 },
//               {
//                 headers: { Authorization: `Bearer ${token}` },
//               }
//             );

//             await refreshCredits();
//             router.refresh();
//           } catch (creditError) {
//             console.error("Error updating credits after completion:", creditError);
//           }
//         } else if (res.data.status === "FAILED") {
//           setIsLoading(false);
//           setSubmissionStatus("error");
//           stopPolling();
//         }
//       } catch (error) {
//         // Handle polling errors if needed
//         console.error("Error during polling:", error);
//       }
//     }, 5000);

//     pollingIntervalIdRef.current = intervalId;

//     const timeoutId = window.setTimeout(() => {
//       // Timeout after 1 minute
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//         pollingIntervalIdRef.current = null;
//       }

//       setRetryCount((prev) => {
//         const newCount = prev + 1;
//         if (newCount < maxRetries) {
//           // Retry polling
//           startPolling(requestId);
//         } else {
//           setSubmissionStatus("timeout-error");
//           setIsLoading(false);
//         }
//         return newCount;
//       });

//       pollingTimeoutIdRef.current = null;
//     }, 60000); // 1 minute

//     pollingTimeoutIdRef.current = timeoutId;
//   };

//   const stopPolling = () => {
//     if (pollingIntervalIdRef.current) {
//       clearInterval(pollingIntervalIdRef.current);
//       pollingIntervalIdRef.current = null;
//     }

//     if (pollingTimeoutIdRef.current) {
//       clearTimeout(pollingTimeoutIdRef.current);
//       pollingTimeoutIdRef.current = null;
//     }

//     setIsLoading(false);
//   };

//   useEffect(() => {
//     return () => {
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//       }
//       if (pollingTimeoutIdRef.current) {
//         clearTimeout(pollingTimeoutIdRef.current);
//       }
//     };
//   }, []);

//   const handleDownload = () => {
//     if (!downloadUrl) return;

//     const link = document.createElement("a");
//     link.href = downloadUrl;
//     link.download = "";
//     link.rel = "noopener noreferrer";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     router.refresh();
//   };

//   return (
//     <>
//       {/* Render Notifications based on submissionStatus */}
//       <Notifications status={submissionStatus} />

//       {/* Existing Insufficient Credits Modal */}
//       <Modal
//         isOpen={showInsufficientCreditsModal}
//         onClose={() => setShowInsufficientCreditsModal(false)}
//         title="رصيدك غير كافٍ"
//         message="ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى ترقية خطتك."
//         actionText="ترقية الخطة"
//         actionLink="/pricing"
//       />

//       {/* Render the global ProModal */}
//       <ProModal />

//       <div className="max-w-6xl mx-auto bg-gray-100 mt-4 rounded-lg shadow-lg p-4">
//         <div className="flex flex-col items-center text-xl justify-center text-slate-900 pb-4 gap-4">
//           <h1>بوربوينت بالذكاء الصناعي</h1>
//         </div>
//         <div className="flex flex-col items-center justify-center text-slate-600 pb-4 gap-4">
//           <p>اكتب الموضوع أو حمل ملف وورد ثم اختر القالب لإنشاء بوربوينت بالذكاء الصناعي قابل للتعديل</p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-2">
//           <Card>
//             <CardHeader></CardHeader>
//             {(submissionStatus || isLoading || downloadUrl) && (
//               <div className="rounded-lg pb-4 mb-4 p-4">
//                 {isLoading && (
//                   <div className="w-full flex flex-col items-center mt-4">
//                     <div className="flex items-center justify-center">
//                       <Loading />
//                     </div>
//                     <div className="w-full flex justify-center p-4 mt-4 text-gray-400 text-center">
//                       .....يتم تجهيز ملف العرض الرجاء الانتظار قليلاً
//                     </div>
//                     <div className="w-1/2 border-t border-gray-300 mt-2"></div>
//                   </div>
//                 )}
//                 {downloadUrl ? (
//                   <div className="w-full flex justify-center mt-4">
//                     <button
//                       onClick={handleDownload}
//                       className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//                     >
//                       تحميل الملف
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-gray-500 mt-4 text-center"></div>
//                 )}
//               </div>
//             )}

//             <CardContent>
//               <PresentationForm
//                 topicValue={topicValue}
//                 documentFile={documentFile}
//                 selectedTemplate={selectedTemplate}
//                 isSubmitting={isSubmitting}
//                 isLoading={isLoading}
//                 handleTopicChange={handleTopicChange}
//                 handleFileChange={handleFileChange}
//                 handleSubmit={handleSubmit}
//                 setIsModalOpen={setIsModalOpen}
//               />
//             </CardContent>
//           </Card>
//         </div>

//         {isModalOpen && (
//           <TemplateModal
//             isOpen={isModalOpen}
//             onClose={() => setIsModalOpen(false)}
//             onSelect={(template) => setSelectedTemplate(template)}
//           />
//         )}
//       </div>
//     </>
//   );
// };

// export default CreatePresentation;


// // src/components/CreatePresentation.tsx

// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { useCredits } from '@/contexts/CreditContext'; // Using CreditContext
// import Modal from '@/components/custom/ocrModal';
// import Loading from '@/components/global/loading';
// import { Card, CardHeader, CardContent } from '@/components/ui/card';
// import TemplateModal from './TemplateModal';
// import Notifications from '@/components/Notifications'; // Import the Notifications component
// import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'; // Icons from react-icons
// import PresentationForm from './PresentationForm'; // Import the new extracted form component

// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   category: string;
// }

// const CreatePresentation: React.FC = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const { getToken } = useAuth();
//   const { credits, refreshCredits } = useCredits();

//   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
//   const [submissionStatus, setSubmissionStatus] = useState<string>('');
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState<boolean>(false);
//   const [requestId, setRequestId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [topicValue, setTopicValue] = useState<string>('');
//   const [documentFile, setDocumentFile] = useState<File | null>(null);

//   // New state for user subscription tier
//   const [userTier, setUserTier] = useState<string>('free'); // Default to 'free'

//   const pollingIntervalIdRef = useRef<number | null>(null);
//   const pollingTimeoutIdRef = useRef<number | null>(null); // Ref for the timeout

//   const [retryCount, setRetryCount] = useState<number>(0);
//   const maxRetries = 3; // Maximum number of retries

//   // Constants for validation
//   const MAX_TOPIC_LENGTH = 100; // Maximum allowed length for the topic input
//   const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum file size in bytes (5 MB)
//   const ALLOWED_FILE_TYPES = [
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx MIME type
//   ];

//   useEffect(() => {
//     const fetchUserStatus = async () => {
//       if (!user) return;

//       try {
//         const token = await getToken();
//         const response = await axios.get('/api/status', { // Updated API endpoint
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setUserTier(response.data.userTier);
//         console.log('📊 User Tier:', response.data.userTier);
//       } catch (error) {
//         console.error('Error fetching user status:', error);
//         setUserTier('free'); // Default to free if there's an error
//       }
//     };

//     fetchUserStatus();
//   }, [user, getToken]);

//   const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     // Check if the topic exceeds the maximum length
//     if (value.length > MAX_TOPIC_LENGTH) {
//       setSubmissionStatus('topic-too-long');
//       return;
//     }

//     if (submissionStatus) {
//       setSubmissionStatus('');
//     }

//     setTopicValue(value);

//     // If the topic is not empty, clear the document file
//     if (value !== '') {
//       setDocumentFile(null);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];

//       // Validate file size
//       if (file.size > MAX_FILE_SIZE) {
//         setSubmissionStatus('file-too-large');
//         return;
//       }

//       // Validate file type
//       if (!ALLOWED_FILE_TYPES.includes(file.type)) {
//         setSubmissionStatus('invalid-file-type');
//         return;
//       }

//       if (submissionStatus) {
//         setSubmissionStatus('');
//       }

//       setDocumentFile(file);
//       setTopicValue('');
//     } else {
//       setDocumentFile(null);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!user) {
//       router.push('/sign-in');
//       return;
//     }

//     // Ensure at least one field is filled
//     if (!topicValue && !documentFile) {
//       setSubmissionStatus('empty');
//       return;
//     }

//     // Ensure a template is selected
//     if (!selectedTemplate) {
//       setSubmissionStatus('templateRequired');
//       return;
//     }

//     if (credits === null || credits < 1) {
//       setShowInsufficientCreditsModal(true);
//       return;
//     }

//     setIsSubmitting(true);
//     setSubmissionStatus('');
//     setRetryCount(0);

//     try {
//       const token = await getToken();
//       if (!token) {
//         setSubmissionStatus('unauthorized');
//         return;
//       }

//       // Create a new File record
//       const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
//       const response = await axios.post(
//         '/api/files',
//         {
//           fileName,
//           type: 'PRESENTATION',
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const newRequestId = response.data.id;
//       setRequestId(newRequestId);

//       // **1. Set Webhook URL to the centralized makeWebhook API**
//       const webhookUrl = '/api/makeWebhook';

//       if (topicValue) {
//         // **2. For topic submissions, send JSON payload to makeWebhook**
//         const payload = {
//           topic: topicValue,
//           templateId: selectedTemplate.id,
//           categoryId: selectedTemplate.category,
//           userId: user.id,
//           requestId: newRequestId,
//         };

//         console.log('📡 Sending data to centralized webhook API (topic).');
//         await axios.post(webhookUrl, payload, {
//           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         });
//       } else if (documentFile) {
//         // **3. For file submissions, send FormData to makeWebhook**
//         const formData = new FormData();
//         formData.append('document', documentFile);
//         formData.append('templateId', selectedTemplate.id);
//         formData.append('categoryId', selectedTemplate.category);
//         formData.append('userId', user.id);
//         formData.append('requestId', newRequestId);

//         console.log('📡 Sending data to centralized webhook API (file).');
//         await axios.post(webhookUrl, formData, {
//           headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
//         });
//       }

//       setSubmissionStatus('success');

//       // Reset fields
//       setTopicValue('');
//       setDocumentFile(null);
//       setSelectedTemplate(null);

//       // Start polling
//       startPolling(newRequestId);
//     } catch (error: any) {
//       if (axios.isAxiosError(error)) {
//         if (!error.response) {
//           setSubmissionStatus('network-error');
//         } else if (error.response.status === 400 && error.response.data.error === 'Insufficient credits') {
//           setSubmissionStatus('insufficient-credits');
//         } else if (error.response.status === 401) {
//           setSubmissionStatus('unauthorized');
//         } else if (error.response.status >= 500) {
//           setSubmissionStatus('server-error');
//         } else if (error.response.status >= 400) {
//           setSubmissionStatus('client-error');
//         } else {
//           setSubmissionStatus('unexpected-error');
//         }
//       } else {
//         setSubmissionStatus('unexpected-error');
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const startPolling = (requestId: string) => {
//     // Clear any existing intervals and timeouts
//     if (pollingIntervalIdRef.current) {
//       clearInterval(pollingIntervalIdRef.current);
//       pollingIntervalIdRef.current = null;
//     }

//     if (pollingTimeoutIdRef.current) {
//       clearTimeout(pollingTimeoutIdRef.current);
//       pollingTimeoutIdRef.current = null;
//     }

//     setIsLoading(true);

//     const intervalId = window.setInterval(async () => {
//       try {
//         const token = await getToken();
//         if (!token) {
//           setSubmissionStatus('unauthorized');
//           stopPolling();
//           return;
//         }

//         const res = await axios.get('/api/getfilemake', {
//           params: { requestId },
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (res.data && res.data.status === 'COMPLETED') {
//           setIsLoading(false);
//           setDownloadUrl(res.data.downloadUrl);
//           stopPolling();

//           // Deduct credits
//           try {
//             const token = await getToken();
//             if (!token) {
//               setSubmissionStatus('unauthorized');
//               return;
//             }

//             await axios.patch(
//               '/api/update-credits',
//               { pointsUsed: 100 },
//               {
//                 headers: { Authorization: `Bearer ${token}` },
//               }
//             );

//             await refreshCredits();
//             router.refresh();
//           } catch (creditError) {
//             console.error('Error updating credits after completion:', creditError);
//           }
//         } else if (res.data.status === 'FAILED') {
//           setIsLoading(false);
//           setSubmissionStatus('error');
//           stopPolling();
//         }
//       } catch (error) {
//         // Handle polling errors if needed
//         console.error('Error during polling:', error);
//       }
//     }, 5000);

//     pollingIntervalIdRef.current = intervalId;

//     const timeoutId = window.setTimeout(() => {
//       // Timeout after 1 minute
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//         pollingIntervalIdRef.current = null;
//       }

//       setRetryCount((prev) => {
//         const newCount = prev + 1;
//         if (newCount < maxRetries) {
//           // Retry polling
//           startPolling(requestId);
//         } else {
//           setSubmissionStatus('timeout-error');
//           setIsLoading(false);
//         }
//         return newCount;
//       });

//       pollingTimeoutIdRef.current = null;
//     }, 60000); // 1 minute

//     pollingTimeoutIdRef.current = timeoutId;
//   };

//   const stopPolling = () => {
//     if (pollingIntervalIdRef.current) {
//       clearInterval(pollingIntervalIdRef.current);
//       pollingIntervalIdRef.current = null;
//     }

//     if (pollingTimeoutIdRef.current) {
//       clearTimeout(pollingTimeoutIdRef.current);
//       pollingTimeoutIdRef.current = null;
//     }

//     setIsLoading(false);
//   };

//   useEffect(() => {
//     return () => {
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//       }
//       if (pollingTimeoutIdRef.current) {
//         clearTimeout(pollingTimeoutIdRef.current);
//       }
//     };
//   }, []);

//   const handleDownload = () => {
//     const link = document.createElement("a");
//     link.href = downloadUrl!;
//     link.download = "";
//     link.rel = "noopener noreferrer";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     router.refresh();
//   };

//   return (
//     <>
//       <Notifications status={submissionStatus} />

//       <Modal
//         isOpen={showInsufficientCreditsModal}
//         onClose={() => setShowInsufficientCreditsModal(false)}
//         title="رصيدك غير كافٍ"
//         message="ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى ترقية خطتك."
//         actionText="ترقية الخطة"
//         actionLink="/pricing"
//       />

//       <div className="max-w-6xl mx-auto bg-gray-100 mt-4 rounded-lg shadow-lg p-4">
//         <div className="flex flex-col items-center text-xl justify-center text-slate-900 pb-4 gap-4">
//           <h1>بوربوينت بالذكاء الصناعي</h1>
//         </div>
//         <div className="flex flex-col items-center justify-center text-slate-600 pb-4 gap-4">
//           <p>اكتب الموضوع أو حمل ملف وورد ثم اختر القالب لإنشاء بوربوينت بالذكاء الصناعي قابل للتعديل</p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-2">
//           <Card>
//             <CardHeader></CardHeader>
//             {(submissionStatus || isLoading || downloadUrl) && (
//               <div className="rounded-lg pb-4 mb-4 p-4">
//                 {isLoading && (
//                   <div className="w-full flex flex-col items-center mt-4">
//                     <div className="flex items-center justify-center">
//                       <Loading />
//                     </div>
//                     <div className="w-full flex justify-center p-4 mt-4 text-gray-400 text-center">
//                       .....يتم تجهيز ملف العرض الرجاء الانتظار قليلاً
//                     </div>
//                     <div className="w-1/2 border-t border-gray-300 mt-2"></div>
//                   </div>
//                 )}
//                 {downloadUrl ? (
//                   <div className="w-full flex justify-center mt-4">
//                     <button
//                       onClick={handleDownload}
//                       className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//                     >
//                       تحميل الملف
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-gray-500 mt-4 text-center"></div>
//                 )}
//               </div>
//             )}

//             <CardContent>
//               <PresentationForm
//                 topicValue={topicValue}
//                 documentFile={documentFile}
//                 selectedTemplate={selectedTemplate}
//                 isSubmitting={isSubmitting}
//                 isLoading={isLoading}
//                 handleTopicChange={handleTopicChange}
//                 handleFileChange={handleFileChange}
//                 handleSubmit={handleSubmit}
//                 setIsModalOpen={setIsModalOpen}
//               />
//             </CardContent>
//           </Card>
//         </div>

//         {isModalOpen && (
//           <TemplateModal
//             isOpen={isModalOpen}
//             onClose={() => setIsModalOpen(false)}
//             onSelect={(template) => setSelectedTemplate(template)}
//           />
//         )}
//       </div>
//     </>
//   );
// };

// export default CreatePresentation;



// // src/components/CreatePresentation.tsx

// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { useCredits } from '@/contexts/CreditContext'; // Using CreditContext
// import Modal from '@/components/custom/ocrModal';
// import Loading from '@/components/global/loading';
// import { Card, CardHeader, CardContent } from '@/components/ui/card';
// import TemplateModal from './TemplateModal';
// import Notifications from '@/components/Notifications'; // Import the Notifications component
// import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'; // Icons from react-icons
// import PresentationForm from './PresentationForm'; // Import the new extracted form component

// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   category: string;
// }

// const CreatePresentation: React.FC = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const { getToken } = useAuth();
//   const { credits, refreshCredits } = useCredits();

//   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
//   const [submissionStatus, setSubmissionStatus] = useState<string>('');
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState<boolean>(false);
//   const [requestId, setRequestId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [topicValue, setTopicValue] = useState<string>('');
//   const [documentFile, setDocumentFile] = useState<File | null>(null);

//   // New state for user subscription tier
//   const [userTier, setUserTier] = useState<string>('free'); // Default to 'free'

//   const pollingIntervalIdRef = useRef<number | null>(null);
//   const pollingTimeoutIdRef = useRef<number | null>(null); // Ref for the timeout

//   const [retryCount, setRetryCount] = useState<number>(0);
//   const maxRetries = 3; // Maximum number of retries

//   // Constants for validation
//   const MAX_TOPIC_LENGTH = 100; // Maximum allowed length for the topic input
//   const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum file size in bytes (5 MB)
//   const ALLOWED_FILE_TYPES = [
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx MIME type
//   ];

//   useEffect(() => {
//     const fetchUserStatus = async () => {
//       if (!user) return;

//       try {
//         const token = await getToken();
//         const response = await axios.get('/api/user/status', { // Updated API endpoint
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setUserTier(response.data.userTier);
//         console.log('📊 User Tier:', response.data.userTier);
//       } catch (error) {
//         console.error('Error fetching user status:', error);
//         setUserTier('free'); // Default to free if there's an error
//       }
//     };

//     fetchUserStatus();
//   }, [user, getToken]);

//   const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     // Check if the topic exceeds the maximum length
//     if (value.length > MAX_TOPIC_LENGTH) {
//       setSubmissionStatus('topic-too-long');
//       return;
//     }

//     if (submissionStatus) {
//       setSubmissionStatus('');
//     }

//     setTopicValue(value);

//     // If the topic is not empty, clear the document file
//     if (value !== '') {
//       setDocumentFile(null);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];

//       // Validate file size
//       if (file.size > MAX_FILE_SIZE) {
//         setSubmissionStatus('file-too-large');
//         return;
//       }

//       // Validate file type
//       if (!ALLOWED_FILE_TYPES.includes(file.type)) {
//         setSubmissionStatus('invalid-file-type');
//         return;
//       }

//       if (submissionStatus) {
//         setSubmissionStatus('');
//       }

//       setDocumentFile(file);
//       setTopicValue('');
//     } else {
//       setDocumentFile(null);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!user) {
//       router.push('/sign-in');
//       return;
//     }

//     // Ensure at least one field is filled
//     if (!topicValue && !documentFile) {
//       setSubmissionStatus('empty');
//       return;
//     }

//     // Ensure a template is selected
//     if (!selectedTemplate) {
//       setSubmissionStatus('templateRequired');
//       return;
//     }

//     if (credits === null || credits < 1) {
//       setShowInsufficientCreditsModal(true);
//       return;
//     }

//     setIsSubmitting(true);
//     setSubmissionStatus('');
//     setRetryCount(0);

//     try {
//       const token = await getToken();
//       if (!token) {
//         setSubmissionStatus('unauthorized');
//         return;
//       }

//       // Create a new File record
//       const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
//       const response = await axios.post(
//         '/api/files',
//         {
//           fileName,
//           type: 'PRESENTATION',
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const newRequestId = response.data.id;
//       setRequestId(newRequestId);

//       // Determine the webhook URL based on userTier
//       let webhookUrl = '';
//       switch (userTier) {
//         case 'standard':
//           webhookUrl = '/api/webhook/standard'; // Replace with your standard webhook URL
//           break;
//         case 'premium':
//           webhookUrl = '/api/webhook/premium'; // Replace with your premium webhook URL
//           break;
//         default:
//           webhookUrl = '/api/webhook/free'; // Replace with your free webhook URL
//           break;
//       }

//       if (topicValue) {
//         // For topic submissions, send JSON payload to server-side webhook API
//         const payload = {
//           topic: topicValue,
//           templateId: selectedTemplate.id,
//           categoryId: selectedTemplate.category,
//           userId: user.id,
//           requestId: newRequestId,
//         };

//         console.log('📡 Sending data to server-side webhook API (topic).');
//         await axios.post(webhookUrl, payload, {
//           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         });
//       } else if (documentFile) {
//         // For file submissions, send FormData to server-side webhook API
//         const formData = new FormData();
//         formData.append('document', documentFile);
//         formData.append('templateId', selectedTemplate.id);
//         formData.append('categoryId', selectedTemplate.category);
//         formData.append('userId', user.id);
//         formData.append('requestId', newRequestId);

//         console.log('📡 Sending data to server-side webhook API (file).');
//         await axios.post(webhookUrl, formData, {
//           headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
//         });
//       }

//       setSubmissionStatus('success');

//       // Reset fields
//       setTopicValue('');
//       setDocumentFile(null);
//       setSelectedTemplate(null);

//       // Start polling
//       startPolling(newRequestId);
//     } catch (error: any) {
//       if (axios.isAxiosError(error)) {
//         if (!error.response) {
//           setSubmissionStatus('network-error');
//         } else if (error.response.status === 400 && error.response.data.error === 'Insufficient credits') {
//           setSubmissionStatus('insufficient-credits');
//         } else if (error.response.status === 401) {
//           setSubmissionStatus('unauthorized');
//         } else if (error.response.status >= 500) {
//           setSubmissionStatus('server-error');
//         } else if (error.response.status >= 400) {
//           setSubmissionStatus('client-error');
//         } else {
//           setSubmissionStatus('unexpected-error');
//         }
//       } else {
//         setSubmissionStatus('unexpected-error');
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const startPolling = (requestId: string) => {
//     // Clear any existing intervals and timeouts
//     if (pollingIntervalIdRef.current) {
//       clearInterval(pollingIntervalIdRef.current);
//       pollingIntervalIdRef.current = null;
//     }

//     if (pollingTimeoutIdRef.current) {
//       clearTimeout(pollingTimeoutIdRef.current);
//       pollingTimeoutIdRef.current = null;
//     }

//     setIsLoading(true);

//     const intervalId = window.setInterval(async () => {
//       try {
//         const token = await getToken();
//         if (!token) {
//           setSubmissionStatus('unauthorized');
//           stopPolling();
//           return;
//         }

//         const res = await axios.get('/api/getfilemake', {
//           params: { requestId },
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (res.data && res.data.status === 'COMPLETED') {
//           setIsLoading(false);
//           setDownloadUrl(res.data.downloadUrl);
//           stopPolling();

//           // Deduct credits
//           try {
//             const token = await getToken();
//             if (!token) {
//               setSubmissionStatus('unauthorized');
//               return;
//             }

//             await axios.patch(
//               '/api/update-credits',
//               { pointsUsed: 100 },
//               {
//                 headers: { Authorization: `Bearer ${token}` },
//               }
//             );

//             await refreshCredits();
//             router.refresh();
//           } catch (creditError) {
//             console.error('Error updating credits after completion:', creditError);
//           }
//         } else if (res.data.status === 'FAILED') {
//           setIsLoading(false);
//           setSubmissionStatus('error');
//           stopPolling();
//         }
//       } catch (error) {
//         // Handle polling errors if needed
//       }
//     }, 5000);

//     pollingIntervalIdRef.current = intervalId;

//     const timeoutId = window.setTimeout(() => {
//       // Timeout after 1 minute
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//         pollingIntervalIdRef.current = null;
//       }

//       setRetryCount((prev) => {
//         const newCount = prev + 1;
//         if (newCount < maxRetries) {
//           // Retry polling
//           startPolling(requestId);
//         } else {
//           setSubmissionStatus('timeout-error');
//           setIsLoading(false);
//         }
//         return newCount;
//       });

//       pollingTimeoutIdRef.current = null;
//     }, 60000); // 1 minute

//     pollingTimeoutIdRef.current = timeoutId;
//   };

//   const stopPolling = () => {
//     if (pollingIntervalIdRef.current) {
//       clearInterval(pollingIntervalIdRef.current);
//       pollingIntervalIdRef.current = null;
//     }

//     if (pollingTimeoutIdRef.current) {
//       clearTimeout(pollingTimeoutIdRef.current);
//       pollingTimeoutIdRef.current = null;
//     }

//     setIsLoading(false);
//   };

//   useEffect(() => {
//     return () => {
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//       }
//       if (pollingTimeoutIdRef.current) {
//         clearTimeout(pollingTimeoutIdRef.current);
//       }
//     };
//   }, []);

//   const handleDownload = () => {
//     const link = document.createElement("a");
//     link.href = downloadUrl!;
//     link.download = "";
//     link.rel = "noopener noreferrer";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     router.refresh();
//   };

//   return (
//     <>
//       <Notifications status={submissionStatus} />

//       <Modal
//         isOpen={showInsufficientCreditsModal}
//         onClose={() => setShowInsufficientCreditsModal(false)}
//         title="رصيدك غير كافٍ"
//         message="ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى ترقية خطتك."
//         actionText="ترقية الخطة"
//         actionLink="/pricing"
//       />

//       <div className="max-w-6xl mx-auto bg-gray-100 mt-4 rounded-lg shadow-lg p-4">
//         <div className="flex flex-col items-center text-xl justify-center text-slate-900 pb-4 gap-4">
//           <h1>بوربوينت بالذكاء الصناعي</h1>
//         </div>
//         <div className="flex flex-col items-center justify-center text-slate-600 pb-4 gap-4">
//           <p>اكتب الموضوع أو حمل ملف وورد ثم اختر القالب لإنشاء بوربوينت بالذكاء الصناعي قابل للتعديل</p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-2">
//           <Card>
//             <CardHeader></CardHeader>
//             {(submissionStatus || isLoading || downloadUrl) && (
//               <div className="rounded-lg pb-4 mb-4 p-4">
//                 {isLoading && (
//                   <div className="w-full flex flex-col items-center mt-4">
//                     <div className="flex items-center justify-center">
//                       <Loading />
//                     </div>
//                     <div className="w-full flex justify-center p-4 mt-4 text-gray-400 text-center">
//                       .....يتم تجهيز ملف العرض الرجاء الانتظار قليلاً
//                     </div>
//                     <div className="w-1/2 border-t border-gray-300 mt-2"></div>
//                   </div>
//                 )}
//                 {downloadUrl ? (
//                   <div className="w-full flex justify-center mt-4">
//                     <button
//                       onClick={handleDownload}
//                       className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//                     >
//                       تحميل الملف
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-gray-500 mt-4 text-center"></div>
//                 )}
//               </div>
//             )}

//             <CardContent>
//               <PresentationForm
//                 topicValue={topicValue}
//                 documentFile={documentFile}
//                 selectedTemplate={selectedTemplate}
//                 isSubmitting={isSubmitting}
//                 isLoading={isLoading}
//                 handleTopicChange={handleTopicChange}
//                 handleFileChange={handleFileChange}
//                 handleSubmit={handleSubmit}
//                 setIsModalOpen={setIsModalOpen}
//               />
//             </CardContent>
//           </Card>
//         </div>

//         {isModalOpen && (
//           <TemplateModal
//             isOpen={isModalOpen}
//             onClose={() => setIsModalOpen(false)}
//             onSelect={(template) => setSelectedTemplate(template)}
//           />
//         )}
//       </div>
//     </>
//   );
// };

// export default CreatePresentation;


// // src/components/CreatePresentation.tsx

// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { useCredits } from '@/contexts/CreditContext'; // Using CreditContext
// import Modal from '@/components/custom/ocrModal';
// import Loading from '@/components/global/loading';
// import { Card, CardHeader, CardContent } from '@/components/ui/card';
// import TemplateModal from './TemplateModal';
// import Notifications from '@/components/Notifications'; // Import the Notifications component
// import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'; // Icons from react-icons
// import PresentationForm from './PresentationForm'; // Import the new extracted form component

// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   category: string;
// }

// const CreatePresentation: React.FC = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const { getToken } = useAuth();
//   const { credits, refreshCredits } = useCredits();

//   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
//   const [submissionStatus, setSubmissionStatus] = useState<string>('');
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState<boolean>(false);
//   const [requestId, setRequestId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [topicValue, setTopicValue] = useState<string>('');
//   const [documentFile, setDocumentFile] = useState<File | null>(null);

//   // New state for user subscription status
//   const [isPro, setIsPro] = useState<boolean>(false);

//   const pollingIntervalIdRef = useRef<number | null>(null);
//   const pollingTimeoutIdRef = useRef<number | null>(null); // Ref for the timeout

//   const [retryCount, setRetryCount] = useState<number>(0);
//   const maxRetries = 3; // Maximum number of retries

//   // Constants for validation
//   const MAX_TOPIC_LENGTH = 100; // Maximum allowed length for the topic input
//   const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum file size in bytes (5 MB)
//   const ALLOWED_FILE_TYPES = [
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx MIME type
//   ];

//   useEffect(() => {
//     const fetchUserStatus = async () => {
//       if (!user) return;

//       try {
//         const token = await getToken();
//         const response = await axios.get('/api/status', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setIsPro(response.data.isPro);
//         console.log('📊 User isPro Status:', response.data.isPro);
//       } catch (error) {
//         console.error('Error fetching user status:', error);
//         setIsPro(false); // Default to free if there's an error
//       }
//     };

//     fetchUserStatus();
//   }, [user, getToken]);

//   const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     // Check if the topic exceeds the maximum length
//     if (value.length > MAX_TOPIC_LENGTH) {
//       setSubmissionStatus('topic-too-long');
//       return;
//     }

//     if (submissionStatus) {
//       setSubmissionStatus('');
//     }

//     setTopicValue(value);

//     // If the topic is not empty, clear the document file
//     if (value !== '') {
//       setDocumentFile(null);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];

//       // Validate file size
//       if (file.size > MAX_FILE_SIZE) {
//         setSubmissionStatus('file-too-large');
//         return;
//       }

//       // Validate file type
//       if (!ALLOWED_FILE_TYPES.includes(file.type)) {
//         setSubmissionStatus('invalid-file-type');
//         return;
//       }

//       if (submissionStatus) {
//         setSubmissionStatus('');
//       }

//       setDocumentFile(file);
//       setTopicValue('');
//     } else {
//       setDocumentFile(null);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!user) {
//       router.push('/sign-in');
//       return;
//     }

//     // Ensure at least one field is filled
//     if (!topicValue && !documentFile) {
//       setSubmissionStatus('empty');
//       return;
//     }

//     // Ensure a template is selected
//     if (!selectedTemplate) {
//       setSubmissionStatus('templateRequired');
//       return;
//     }

//     if (credits === null || credits < 1) {
//       setShowInsufficientCreditsModal(true);
//       return;
//     }

//     setIsSubmitting(true);
//     setSubmissionStatus('');
//     setRetryCount(0);

//     try {
//       const token = await getToken();
//       if (!token) {
//         setSubmissionStatus('unauthorized');
//         return;
//       }

//       // Create a new File record
//       const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
//       const response = await axios.post(
//         '/api/files',
//         {
//           fileName,
//           type: 'PRESENTATION',
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const newRequestId = response.data.id;
//       setRequestId(newRequestId);

//       if (topicValue) {
//         // For topic submissions, send JSON payload to server-side webhook API
//         const payload = {
//           topic: topicValue,
//           templateId: selectedTemplate.id,
//           categoryId: selectedTemplate.category,
//           userId: user.id,
//           requestId: newRequestId,
//         };

//         console.log('📡 Sending data to server-side webhook API (topic).');
//         await axios.post('/api/makeWebhook', payload, {
//           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         });
//       } else if (documentFile) {
//         // For file submissions, send FormData to server-side webhook API
//         const formData = new FormData();
//         formData.append('document', documentFile);
//         formData.append('templateId', selectedTemplate.id);
//         formData.append('categoryId', selectedTemplate.category);
//         formData.append('userId', user.id);
//         formData.append('requestId', newRequestId);

//         console.log('📡 Sending data to server-side webhook API (file).');
//         await axios.post('/api/webhook', formData, {
//           headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
//         });
//       }

//       setSubmissionStatus('success');

//       // Reset fields
//       setTopicValue('');
//       setDocumentFile(null);
//       setSelectedTemplate(null);

//       // Start polling
//       startPolling(newRequestId);
//     } catch (error: any) {
//       if (axios.isAxiosError(error)) {
//         if (!error.response) {
//           setSubmissionStatus('network-error');
//         } else if (error.response.status === 400 && error.response.data.error === 'Insufficient credits') {
//           setSubmissionStatus('insufficient-credits');
//         } else if (error.response.status === 401) {
//           setSubmissionStatus('unauthorized');
//         } else if (error.response.status >= 500) {
//           setSubmissionStatus('server-error');
//         } else if (error.response.status >= 400) {
//           setSubmissionStatus('client-error');
//         } else {
//           setSubmissionStatus('unexpected-error');
//         }
//       } else {
//         setSubmissionStatus('unexpected-error');
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const startPolling = (requestId: string) => {
//     // Clear any existing intervals and timeouts
//     if (pollingIntervalIdRef.current) {
//       clearInterval(pollingIntervalIdRef.current);
//       pollingIntervalIdRef.current = null;
//     }

//     if (pollingTimeoutIdRef.current) {
//       clearTimeout(pollingTimeoutIdRef.current);
//       pollingTimeoutIdRef.current = null;
//     }

//     setIsLoading(true);

//     const intervalId = window.setInterval(async () => {
//       try {
//         const token = await getToken();
//         if (!token) {
//           setSubmissionStatus('unauthorized');
//           stopPolling();
//           return;
//         }

//         const res = await axios.get('/api/getfilemake', {
//           params: { requestId },
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (res.data && res.data.status === 'COMPLETED') {
//           setIsLoading(false);
//           setDownloadUrl(res.data.downloadUrl);
//           stopPolling();

//           // Deduct credits
//           try {
//             const token = await getToken();
//             if (!token) {
//               setSubmissionStatus('unauthorized');
//               return;
//             }

//             await axios.patch(
//               '/api/update-credits',
//               { pointsUsed: 100 },
//               {
//                 headers: { Authorization: `Bearer ${token}` },
//               }
//             );

//             await refreshCredits();
//             router.refresh();
//           } catch (creditError) {
//             console.error('Error updating credits after completion:', creditError);
//           }
//         } else if (res.data.status === 'FAILED') {
//           setIsLoading(false);
//           setSubmissionStatus('error');
//           stopPolling();
//         }
//       } catch (error) {
//         // Handle polling errors if needed
//       }
//     }, 5000);

//     pollingIntervalIdRef.current = intervalId;

//     const timeoutId = window.setTimeout(() => {
//       // Timeout after 1 minute
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//         pollingIntervalIdRef.current = null;
//       }

//       setRetryCount((prev) => {
//         const newCount = prev + 1;
//         if (newCount < maxRetries) {
//           // Retry polling
//           startPolling(requestId);
//         } else {
//           setSubmissionStatus('timeout-error');
//           setIsLoading(false);
//         }
//         return newCount;
//       });

//       pollingTimeoutIdRef.current = null;
//     }, 60000); // 1 minute

//     pollingTimeoutIdRef.current = timeoutId;
//   };

//   const stopPolling = () => {
//     if (pollingIntervalIdRef.current) {
//       clearInterval(pollingIntervalIdRef.current);
//       pollingIntervalIdRef.current = null;
//     }

//     if (pollingTimeoutIdRef.current) {
//       clearTimeout(pollingTimeoutIdRef.current);
//       pollingTimeoutIdRef.current = null;
//     }

//     setIsLoading(false);
//   };

//   useEffect(() => {
//     return () => {
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//       }
//       if (pollingTimeoutIdRef.current) {
//         clearTimeout(pollingTimeoutIdRef.current);
//       }
//     };
//   }, []);

//   const handleDownload = () => {
//     const link = document.createElement("a");
//     link.href = downloadUrl!;
//     link.download = "";
//     link.rel = "noopener noreferrer";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     router.refresh();
//   };

//   return (
//     <>
//       <Notifications status={submissionStatus} />

//       <Modal
//         isOpen={showInsufficientCreditsModal}
//         onClose={() => setShowInsufficientCreditsModal(false)}
//         title="رصيدك غير كافٍ"
//         message="ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى ترقية خطتك."
//         actionText="ترقية الخطة"
//         actionLink="/pricing"
//       />

//       <div className="max-w-6xl mx-auto bg-gray-100 mt-4 rounded-lg shadow-lg p-4">
//         <div className="flex flex-col items-center text-xl justify-center text-slate-900 pb-4 gap-4">
//           <h1>بوربوينت بالذكاء الصناعي</h1>
//         </div>
//         <div className="flex flex-col items-center justify-center text-slate-600 pb-4 gap-4">
//           <p>اكتب الموضوع أو حمل ملف وورد ثم اختر القالب لإنشاء بوربوينت بالذكاء الصناعي قابل للتعديل</p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-2">
//           <Card>
//             <CardHeader></CardHeader>
//             {(submissionStatus || isLoading || downloadUrl) && (
//               <div className="rounded-lg pb-4 mb-4 p-4">
//                 {isLoading && (
//                   <div className="w-full flex flex-col items-center mt-4">
//                     <div className="flex items-center justify-center">
//                       <Loading />
//                     </div>
//                     <div className="w-full flex justify-center p-4 mt-4 text-gray-400 text-center">
//                       .....يتم تجهيز ملف العرض الرجاء الانتظار قليلاً
//                     </div>
//                     <div className="w-1/2 border-t border-gray-300 mt-2"></div>
//                   </div>
//                 )}
//                 {downloadUrl ? (
//                   <div className="w-full flex justify-center mt-4">
//                     <button
//                       onClick={handleDownload}
//                       className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//                     >
//                       تحميل الملف
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-gray-500 mt-4 text-center"></div>
//                 )}
//               </div>
//             )}

//             <CardContent>
//               <PresentationForm
//                 topicValue={topicValue}
//                 documentFile={documentFile}
//                 selectedTemplate={selectedTemplate}
//                 isSubmitting={isSubmitting}
//                 isLoading={isLoading}
//                 handleTopicChange={handleTopicChange}
//                 handleFileChange={handleFileChange}
//                 handleSubmit={handleSubmit}
//                 setIsModalOpen={setIsModalOpen}
//               />
//             </CardContent>
//           </Card>
//         </div>

//         {isModalOpen && (
//           <TemplateModal
//             isOpen={isModalOpen}
//             onClose={() => setIsModalOpen(false)}
//             onSelect={(template) => setSelectedTemplate(template)}
//           />
//         )}
//       </div>
//     </>
//   );
// };

// export default CreatePresentation;



// // src/components/CreatePresentation.tsx

// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { useCredits } from '@/contexts/CreditContext'; // Using CreditContext
// import Modal from '@/components/custom/ocrModal';
// import Loading from '@/components/global/loading';
// import { Card, CardHeader, CardContent } from '@/components/ui/card';
// import TemplateModal from './TemplateModal';


// import { toast } from 'sonner';
// import Notifications from '@/components/Notifications'; // Import the Notifications component

// import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'; // Icons from react-icons

// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   category: string;
// }

// const CreatePresentation: React.FC = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const { getToken } = useAuth();
//   const { credits, refreshCredits } = useCredits();

//   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
//   const [submissionStatus, setSubmissionStatus] = useState<string>('');
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState<boolean>(false);
//   const [requestId, setRequestId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [topicValue, setTopicValue] = useState<string>('');
//   const [documentFile, setDocumentFile] = useState<File | null>(null);

//   const pollingIntervalIdRef = useRef<number | null>(null);
//   const pollingTimeoutIdRef = useRef<number | null>(null); // Ref for the timeout

//   // **New State Variables for Retry Logic**
//   const [retryCount, setRetryCount] = useState<number>(0);
//   const maxRetries = 3; // Maximum number of retries

//   // Constants for validation
//   const MAX_TOPIC_LENGTH = 100; // Maximum allowed length for the topic input
//   const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum file size in bytes (5 MB)
//   const ALLOWED_FILE_TYPES = [
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx MIME type
//   ];

//   /**
//    * Handle changes in the topic input field with validation.
//    */
//   const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     console.log('📝 Topic input changed:', value);

//     // Check if the topic exceeds the maximum length
//     if (value.length > MAX_TOPIC_LENGTH) {
//       console.warn('⚠️ Topic length exceeded:', value.length);
//       setSubmissionStatus('topic-too-long');
//       return;
//     }

//     // Clear any previous submission status
//     if (submissionStatus) {
//       console.log('🔄 Clearing previous submission status:', submissionStatus);
//       setSubmissionStatus('');
//     }

//     setTopicValue(value);

//     // If the topic is not empty, clear the document file
//     if (value !== '') {
//       console.log('🗑️ Clearing document file due to topic input.');
//       setDocumentFile(null);
//     }
//   };

//   /**
//    * Handle changes in the file input field with validation.
//    */
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];
//       console.log('📄 File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

//       // Validate file size
//       if (file.size > MAX_FILE_SIZE) {
//         console.warn('⚠️ File size exceeded:', file.size);
//         setSubmissionStatus('file-too-large');
//         return;
//       }

//       // Validate file type
//       if (!ALLOWED_FILE_TYPES.includes(file.type)) {
//         console.warn('⚠️ Invalid file type:', file.type);
//         setSubmissionStatus('invalid-file-type');
//         return;
//       }

//       // Clear any previous submission status
//       if (submissionStatus) {
//         console.log('🔄 Clearing previous submission status:', submissionStatus);
//         setSubmissionStatus('');
//       }

//       setDocumentFile(file);
//       setTopicValue('');
//       console.log('✅ File validated and set:', file.name);
//     } else {
//       console.log('📄 No file selected or file cleared.');
//       setDocumentFile(null);
//     }
//   };

//   /**
//    * Handle form submission.
//    */
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     console.log('🚀 Form submission initiated.');

//     if (!user) {
//       console.warn('🔒 User not authenticated. Redirecting to sign-in.');
//       router.push('/sign-in');
//       return;
//     }

//     // Ensure at least one field is filled
//     if (!topicValue && !documentFile) {
//       console.warn('⚠️ Both topic and document file are empty.');
//       setSubmissionStatus('empty');
//       return;
//     }

//     // Ensure a template is selected
//     if (!selectedTemplate) {
//       console.warn('⚠️ No template selected.');
//       setSubmissionStatus('templateRequired');
//       return;
//     }

//     if (credits === null || credits < 1) {
//       console.warn('⚠️ Insufficient credits:', credits);
//       setShowInsufficientCreditsModal(true);
//       return;
//     }

//     setIsSubmitting(true);
//     setSubmissionStatus('');
//     setRetryCount(0); // **Reset Retry Count on New Submission**
//     console.log('✅ User authenticated. Proceeding with submission.');

//     try {
//       // **Obtain the JWT token from Clerk**
//       console.log('🔑 Obtaining JWT token from Clerk.');
//       const token = await getToken();
//       if (!token) {
//         console.error('❌ Failed to obtain JWT token.');
//         setSubmissionStatus('unauthorized');
//         return;
//       }
//       console.log('🔑 JWT token obtained.');

//       // **Create a new File record with Authorization header**
//       const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
//       console.log('📂 Creating new file record with name:', fileName);
//       const response = await axios.post(
//         '/api/files',
//         {
//           fileName,
//           type: 'PRESENTATION',
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const newRequestId = response.data.id;
//       setRequestId(newRequestId);
//       console.log('✅ File record created with Request ID:', newRequestId);

//       // Prepare data for the appropriate webhook
//       let data: any;
//       let headers: { [key: string]: string } = {};
//       let webhookUrl = '';

//       if (topicValue) {
//         // Topic-specific webhook
//         webhookUrl = 'https://hook.eu2.make.com/avlo6mztudjuwnv3bmmjucd8uqut2w59';

//         data = {
//           topic: topicValue,
//           templateId: selectedTemplate.id,
//           categoryId: selectedTemplate.category,
//           userId: user.id,
//           requestId: newRequestId,
//         };
//         console.log('📡 Preparing data for topic-specific webhook.');
//       } else if (documentFile) {
//         // File-specific webhook
//         webhookUrl = 'https://hook.eu2.make.com/8ckct7ngtgyhc4mqn95k6srh97yx2u8x';
//         data = new FormData();
//         data.append('document', documentFile);
//         data.append('templateId', selectedTemplate.id);
//         data.append('categoryId', selectedTemplate.category);
//         data.append('userId', user.id);
//         data.append('requestId', newRequestId);
//         headers['Content-Type'] = 'multipart/form-data';
//         console.log('📡 Preparing data for file-specific webhook.');
//       }

//       // **Send data to the appropriate webhook**
//       console.log('📡 Sending data to webhook:', webhookUrl);
//       await axios.post(webhookUrl, data, { headers });
//       console.log('✅ Data sent to webhook successfully.');

//       setSubmissionStatus('success');

//       // Reset form fields
//       setTopicValue('');
//       setDocumentFile(null);
//       setSelectedTemplate(null);
//       console.log('🧹 Form fields reset.');

//       // Start polling for status
//       console.log('⏳ Starting polling for request status.');
//       startPolling(newRequestId);
//     } catch (error: any) {
//       if (axios.isAxiosError(error)) {
//         console.error('⚠️ Axios error during form submission:', {
//           message: error.message,
//           response: error.response
//             ? {
//                 status: error.response.status,
//                 headers: error.response.headers,
//                 data: error.response.data,
//               }
//             : 'No response received',
//           config: error.config,
//         });
//       } else {
//         console.error('⚠️ Unexpected error during form submission:', error);
//       }

//       // **Set appropriate submission status based on error**
//       if (axios.isAxiosError(error)) {
//         if (!error.response) {
//           // Network error
//           setSubmissionStatus('network-error');
//         } else if (error.response.status === 400 && error.response.data.error === 'Insufficient credits') {
//           setSubmissionStatus('insufficient-credits');
//         } else if (error.response.status === 401) {
//           // Unauthorized
//           setSubmissionStatus('unauthorized');
//         } else if (error.response.status >= 500) {
//           // Server error
//           setSubmissionStatus('server-error');
//         } else if (error.response.status >= 400) {
//           // Other client errors
//           setSubmissionStatus('client-error');
//         } else {
//           // Other errors
//           setSubmissionStatus('unexpected-error');
//         }
//       } else {
//         // Non-Axios error
//         setSubmissionStatus('unexpected-error');
//       }
//     } finally {
//       setIsSubmitting(false);
//       console.log('🔄 Form submission process completed.');
//     }
//   };

//   /**
//    * Start polling for the request status with retry logic.
//    * @param requestId - The unique ID of the request to poll.
//    */
//   const startPolling = (requestId: string) => {
//     // Clear any existing interval and timeout before starting a new one
//     if (pollingIntervalIdRef.current) {
//       console.log('⏹️ Clearing existing polling interval.');
//       clearInterval(pollingIntervalIdRef.current);
//       pollingIntervalIdRef.current = null;
//     }

//     if (pollingTimeoutIdRef.current) {
//       console.log('⏹️ Clearing existing polling timeout.');
//       clearTimeout(pollingTimeoutIdRef.current);
//       pollingTimeoutIdRef.current = null;
//     }

//     setIsLoading(true);
//     console.log('⏳ Polling started for Request ID:', requestId);

//     // **Set up polling interval**
//     const intervalId = window.setInterval(async () => {
//       console.log('🔄 Polling for status update...');
//       try {
//         // **Obtain the JWT token from Clerk for polling**
//         console.log('🔑 Obtaining JWT token for polling.');
//         const token = await getToken();
//         if (!token) {
//           console.error('❌ Failed to obtain JWT token during polling.');
//           setSubmissionStatus('unauthorized');
//           stopPolling();
//           return;
//         }

//         // **Fetch the current status of the request**
//         console.log('📡 Fetching request status from /api/getfilemake.');
//         const res = await axios.get('/api/getfilemake', {
//           params: { requestId },
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log('📈 Current status:', res.data.status);

//         if (res.data && res.data.status === 'COMPLETED') {
//           setIsLoading(false);
//           setDownloadUrl(res.data.downloadUrl);
//           console.log('✅ Request completed. Download URL obtained:', res.data.downloadUrl);

//           // Clear the interval and timeout
//           stopPolling();

//           // Now that the file is ready, deduct credits here
//           try {
//             const token = await getToken();
//             if (!token) {
//               setSubmissionStatus('unauthorized');
//               return;
//             }

//             // Deduct credits now that the file is completed
//             await axios.patch(
//               '/api/update-credits',
//               { pointsUsed: 25 },
//               {
//                 headers: { Authorization: `Bearer ${token}` },
//               }
//             );
//             console.log('🔄 Credits deducted after completion.');

//             // Refresh credits
//             await refreshCredits();

//             // Trigger a router refresh to update UserInfo component
//             router.refresh();

//           } catch (creditError) {
//             console.error('Error updating credits after completion:', creditError);
//           }
//           console.log('🔄 Credits refreshed after completion.');
//         } else if (res.data.status === 'FAILED') {
//           setIsLoading(false);
//           setSubmissionStatus('error');
//           console.error('❌ Request failed.');

//           // Clear the interval and timeout
//           stopPolling();
//         } else {
//           console.log('🔄 Request still in progress.');
//         }
//       } catch (error: any) {
//         if (axios.isAxiosError(error)) {
//           if (error.response && error.response.status === 401) {
//             console.error('❌ Unauthorized access during polling.');
//             setSubmissionStatus('unauthorized');
//           } else {
//             console.error('⚠️ Error during polling:', error);
//             // Optionally, handle polling errors
//           }
//         } else {
//           console.error('⚠️ Non-Axios error during polling:', error);
//           // Optionally, handle polling errors
//         }
//       }
//     }, 5000); // Poll every 5 seconds

//     pollingIntervalIdRef.current = intervalId;
//     console.log('⏳ Polling interval ID set:', intervalId);

//     // **Set up a timeout to abort polling after 1 minute**
//     const timeoutId = window.setTimeout(() => {
//       console.warn('⏰ Polling timed out after 1 minute.');

//       // Clear the polling interval
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//         console.log('⏹️ Polling interval cleared due to timeout.');
//         pollingIntervalIdRef.current = null;
//       }

//       // Increment the retry count
//       setRetryCount((prev) => {
//         const newRetryCount = prev + 1;
//         console.log(`🔁 Retry attempt ${newRetryCount} of ${maxRetries}.`);

//         if (newRetryCount < maxRetries) {
//           console.log('🔄 Retrying polling...');
//           startPolling(requestId); // Retry polling
//         } else {
//           console.error('❌ Maximum retry attempts reached. Aborting.');
//           setSubmissionStatus('timeout-error'); // Set a new submission status
//           setIsLoading(false);
//         }

//         return newRetryCount;
//       });

//       // Clear the timeout ID
//       pollingTimeoutIdRef.current = null;
//     }, 60000); // 60,000 milliseconds = 60 seconds

//     pollingTimeoutIdRef.current = timeoutId;
//     console.log('⏳ Polling timeout ID set:', timeoutId);
//   };

//   /**
//    * Stop polling by clearing the interval and timeout.
//    */
//   const stopPolling = () => {
//     if (pollingIntervalIdRef.current) {
//       clearInterval(pollingIntervalIdRef.current);
//       console.log('⏹️ Polling interval cleared.');
//       pollingIntervalIdRef.current = null;
//     }

//     if (pollingTimeoutIdRef.current) {
//       clearTimeout(pollingTimeoutIdRef.current);
//       console.log('⏹️ Polling timeout cleared.');
//       pollingTimeoutIdRef.current = null;
//     }

//     setIsLoading(false);
//   };

//   /**
//    * Clean up polling on component unmount.
//    */
//   useEffect(() => {
//     return () => {
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//         console.log('🧹 Component unmounted. Polling interval cleared.');
//       }

//       if (pollingTimeoutIdRef.current) {
//         clearTimeout(pollingTimeoutIdRef.current);
//         console.log('🧹 Component unmounted. Polling timeout cleared.');
//       }
//     };
//   }, []);


//   const handleDownload = () => {
//     // Create a hidden anchor tag to trigger the download
//     const link = document.createElement("a");
//     link.href = downloadUrl!; // File URL
//     link.download = ""; // Use the default filename from the URL
//     link.rel = "noopener noreferrer"; // Security
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     // Trigger a refresh after initiating the download
//     router.refresh();
//   };

//   return (
//     <>
//       {/* Notifications Component */}
//       <Notifications status={submissionStatus} />

//       {/* Modals */}
//       <Modal
//         isOpen={showInsufficientCreditsModal}
//         onClose={() => setShowInsufficientCreditsModal(false)}
//         title="رصيدك غير كافٍ"
//         message="ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى ترقية خطتك."
//         actionText="ترقية الخطة"
//         actionLink="/pricing"
//       />

//       <div className="max-w-6xl mx-auto bg-gray-100 mt-4 rounded-lg shadow-lg p-4">
//         <div className="flex flex-col items-center text-xl justify-center text-slate-900 pb-4 gap-4">
//           <h1>بوربوينت بالذكاء الصناعي</h1>
//         </div>
//         <div className="flex flex-col items-center justify-center text-slate-600 pb-4 gap-4">
//           <p>
//             اكتب الموضوع أو حمل ملف وورد ثم اختر القالب لإنشاء بوربوينت بالذكاء الصناعي قابل للتعديل
//           </p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-2">
//           <Card>
//             <CardHeader></CardHeader>

//             {(submissionStatus || isLoading || downloadUrl) && (
//               <div className="rounded-lg pb-4 mb-4 p-4">
//                 {/* Loading and Download */}
//                 {isLoading && (
//                   <div className="w-full flex flex-col items-center mt-4">
//                     {/* Loading spinner */}
//                     <div className="flex items-center justify-center">
//                       <Loading />
//                     </div>

//                     {/* Text below the spinner */}
//                     <div className="w-full flex justify-center p-4 mt-4 text-gray-400 text-center">
//                       .....يتم تجهيز ملف العرض الرجاء الانتظار قليلاً
//                     </div>

//                     {/* Horizontal line */}
//                     <div className="w-1/2 border-t border-gray-300 mt-2"></div>
//                   </div>
//                 )}
//                 {downloadUrl ? (
//                   <div className="w-full flex justify-center mt-4">
//                     <button
//                       onClick={handleDownload}
//                       className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//                     >
//                       تحميل الملف
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-gray-500 mt-4 text-center"></div>
//                 )}
//               </div>
//             )}

//             <CardContent>
//               <form onSubmit={handleSubmit}>
//                 {/* Wrap form elements in a fieldset to disable them */}
//                 <fieldset disabled={isSubmitting || isLoading} className="w-full">
//                   <div className="flex m-auto w-5/6 flex-col lg:flex-row justify-between">
//                     {/* Topic Field */}
//                     <div className="mb-4 flex-1 lg:mr-2">
//                       <input
//                         type="text"
//                         name="topic"
//                         id="topic"
//                         placeholder="ادخل الموضوع"
//                         value={topicValue}
//                         onChange={handleTopicChange}
//                         disabled={documentFile !== null}
//                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                       />
//                     </div>
//                     <div className="flex justify-center px-4 text-xl py-2"> أو </div>

//                     {/* File Field */}
//                     <div className="mb-4 flex-1 lg:ml-2">
//                       <input
//                         type="file"
//                         name="document"
//                         id="document"
//                         accept=".docx"
//                         onChange={handleFileChange}
//                         disabled={topicValue !== ''}
//                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                       />
//                     </div>
//                   </div>

//                   {/* Template Selection */}
//                   <div className="mb-4 flex justify-center">
//                     <button
//                       type="button"
//                       onClick={() => {
//                         console.log('🖼️ Template selection modal opened.');
//                         setIsModalOpen(true);
//                       }}
//                       className="md:w-1/4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//                     >
//                       {selectedTemplate
//                         ? `تم اختيار القالب: ${selectedTemplate.name}`
//                         : 'اختر القالب'}
//                     </button>
//                   </div>

//                   {/* Submit Button */}
//                   <div className="flex justify-center">
//                     <button
//                       type="submit"
//                       className="md:w-1/4 center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
//                       disabled={isSubmitting || isLoading}
//                     >
//                       {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
//                     </button>
//                   </div>
//                 </fieldset>
//               </form>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Template Modal */}
//         {isModalOpen && (
//           <TemplateModal
//             isOpen={isModalOpen}
//             onClose={() => {
//               console.log('🖼️ Template selection modal closed.');
//               setIsModalOpen(false);
//             }}
//             onSelect={(template) => {
//               console.log('🖼️ Template selected:', template.name);
//               setSelectedTemplate(template);
//             }}
//           />
//         )}
//       </div>
//     </>
//   );
// };

// export default CreatePresentation;
