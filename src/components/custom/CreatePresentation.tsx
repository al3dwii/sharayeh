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

import { useGlobalStore } from '@/store/useGlobalStore';


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

     // Signal that UserInfo should re-fetch
  useGlobalStore.getState().setShouldRefreshUserInfo(true);
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

