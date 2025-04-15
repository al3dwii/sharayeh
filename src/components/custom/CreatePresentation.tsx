// src/components/CreatePresentation.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/custom/CustomModal";
import Loading from "@/components/global/loading";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import TemplateModal from "./TemplateModal";
import Notifications from "@/components/Notifications";
import PresentationForm from "./PresentationForm";
import { useProModal } from "@/hooks/useProModal";
import { useGlobalStore } from "@/store/useGlobalStore";
import { v4 as uuidv4 } from "uuid";
import { useUserData } from "@/context/UserContext";
import { useAuth } from "@clerk/nextjs";

export const dynamic = 'force-dynamic';

interface Template {
  id: string;
  name: string;
  preview: string;
  category: string;
}

const CreatePresentation: React.FC = () => {
  const userData = useUserData();
  const router = useRouter();
  const { getToken } = useAuth();

  // 1. Use the isSuperAdmin flag from userData
  const isSuperAdmin = userData?.isSuperAdmin || false;

  // 2. Set credits to 1000 for super admins, otherwise fetch from userData
  const credits = isSuperAdmin ? 1000 : (userData?.userCredits?.credits || 0);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Separate state variables for different modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    message: string;
    actionText?: string;
    actionLink?: string;
    iconType?: "success" | "error" | "info";
  } | null>(null); // State to manage CustomModal content

  const [topicValue, setTopicValue] = useState<string>("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [userTier, setUserTier] = useState<string>("free");

  console.log(userTier, credits);

  useEffect(() => {
    if (!userData) {
      setUserTier("free");
    } else {
      setUserTier(userData.userTier.toLowerCase() || "free");
    }
  }, [userData]);

  const pollingIntervalIdRef = useRef<number | null>(null);
  const pollingTimeoutIdRef = useRef<number | null>(null);

  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = 2;

  const onOpenProModal = useProModal((state) => state.onOpen);

  // Constants for validation
  const MAX_TOPIC_LENGTH = 50;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_FILE_TYPES = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const generateUniqueName = (): string => {
    const uniqueId = uuidv4();
    const timestamp = Date.now();
    return `${uniqueId}-${timestamp}`;
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > MAX_TOPIC_LENGTH) {
      setSubmissionStatus("topic-too-long");
      return;
    }

    if (submissionStatus) {
      setSubmissionStatus("");
    }

    setTopicValue(value);

    if (value !== "") {
      setDocumentFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.size > MAX_FILE_SIZE) {
        setSubmissionStatus("file-too-large");
        return;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setSubmissionStatus("invalid-file-type");
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

    if (!userData) {
      router.push("/sign-in");
      return;
    }

    if (!topicValue && !documentFile) {
      setSubmissionStatus("empty");
      return;
    }

    if (!selectedTemplate) {
      setSubmissionStatus("templateRequired");
      return;
    }


    if (credits < 1) {
      setModalContent({
        title: "رصيدك غير كافٍ",
        message: "ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى شراء باقة.",
        actionText: "شراء باقة",
        actionLink: "/pricing",
        iconType: "error",
      });
      setIsCustomModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus("");
    setRetryCount(0);

    try {
      const token = await getToken();
      if (!token) {
        setModalContent({
          title: "غير مصرح",
          message: "يرجى تسجيل الدخول لإكمال العملية.",
          actionText: "تسجيل الدخول",
          actionLink: "/sign-in",
          iconType: "error",
        });
        setIsCustomModalOpen(true);
        setSubmissionStatus("unauthorized");
        return;
      }

      const uniqueName = generateUniqueName();
      const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
      const response = await axios.post(
        "/api/files",
        {
          fileName,
          type: "PRESENTATION",
          uniqueName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newRequestId = response.data.id;
      setRequestId(newRequestId);

      const webhookUrl = "/api/makeWebhook";

      if (topicValue) {
        const payload = {
          topic: topicValue,
          templateId: selectedTemplate.id,
          categoryId: selectedTemplate.category,
          userId: userData.userCredits?.userId,
          requestId: newRequestId,
          uniqueName: uniqueName,
        };

        console.log("📡 Sending data to centralized webhook API (topic).");
        await axios.post(webhookUrl, payload, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
      } else if (documentFile) {
        const formData = new FormData();
        formData.append("document", documentFile);
        formData.append("templateId", selectedTemplate.id);
        formData.append("categoryId", selectedTemplate.category);
        formData.append("userId", userData.userCredits?.userId || "");
        formData.append("requestId", newRequestId);
        formData.append("uniqueName", uniqueName);

        console.log("📡 Sending data to centralized webhook API (file).");
        await axios.post(webhookUrl, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
      }

      setSubmissionStatus("success");
      setTopicValue("");
      setDocumentFile(null);
      setSelectedTemplate(null);

      startPolling(newRequestId);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setSubmissionStatus("network-error");
          setModalContent({
            title: "خطأ في الشبكة",
            message: "حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى.",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
        } else if (
          error.response.status === 400 &&
          error.response.data.error === "Insufficient credits"
        ) {
          setModalContent({
            title: "رصيدك غير كافٍ",
            message: "ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى شراء باقة.",
            actionText: "شراء باقة",
            actionLink: "/pricing",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
          setSubmissionStatus("insufficient-credits");
        } else if (error.response.status === 401) {
          setModalContent({
            title: "غير مصرح",
            message: "يرجى تسجيل الدخول لإكمال العملية.",
            actionText: "تسجيل الدخول",
            actionLink: "/sign-in",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
          setSubmissionStatus("unauthorized");
        } else if (error.response.status >= 500) {
          setModalContent({
            title: "خطأ في الخادم",
            message: "حدث خطأ في الخادم. يرجى المحاولة لاحقًا.",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
          setSubmissionStatus("server-error");
        } else if (error.response.status >= 400) {
          setModalContent({
            title: "خطأ",
            message: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
          setSubmissionStatus("client-error");
        } else {
          setModalContent({
            title: "خطأ غير متوقع",
            message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
          setSubmissionStatus("unexpected-error");
        }
      } else {
        setModalContent({
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
          iconType: "error",
        });
        setIsCustomModalOpen(true);
        setSubmissionStatus("unexpected-error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startPolling = (requestId: string) => {
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
          setModalContent({
            title: "غير مصرح",
            message: "يرجى تسجيل الدخول لإكمال العملية.",
            actionText: "تسجيل الدخول",
            actionLink: "/sign-in",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
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

         
            try {
              const token = await getToken();
              if (!token) {
                setModalContent({
                  title: "غير مصرح",
                  message: "يرجى تسجيل الدخول لإكمال العملية.",
                  actionText: "تسجيل الدخول",
                  actionLink: "/sign-in",
                  iconType: "error",
                });
                setIsCustomModalOpen(true);
                setSubmissionStatus("unauthorized");
                return;
              }

              await axios.patch(
                "/api/update-credits",
                { pointsUsed: 50 },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              router.refresh();
            } catch (creditError) {
              console.error("Error updating credits after completion:", creditError);
            }
          
        } else if (res.data.status === "FAILED") {
          setIsLoading(false);
          setModalContent({
            title: "فشل العملية",
            message: "فشلت عملية إنشاء العرض. يرجى المحاولة مرة أخرى.",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
          setSubmissionStatus("error");
          stopPolling();
        }
      } catch (error) {
        console.error("Error during polling:", error);
      }
    }, 5000);

    pollingIntervalIdRef.current = intervalId;

    const timeoutId = window.setTimeout(() => {
      if (pollingIntervalIdRef.current) {
        clearInterval(pollingIntervalIdRef.current);
        pollingIntervalIdRef.current = null;
      }

      setRetryCount((prev) => {
        const newCount = prev + 1;
        if (newCount < maxRetries) {
          startPolling(requestId);
        } else {
          setModalContent({
            title: "انتهاء المهلة",
            message: "استغرقت العملية وقتًا أطول من المتوقع. يرجى المحاولة لاحقًا.",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
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

    // Reset form states
    setTopicValue("");
    setDocumentFile(null);
    setSelectedTemplate(null);
    setDownloadUrl(null);
    setSubmissionStatus("");
    setRequestId(null); // If you want to clear the requestId too

    // Signal that UserInfo should re-fetch
    useGlobalStore.getState().setShouldRefreshUserInfo(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      useGlobalStore.getState().setShouldRefreshUserInfo(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Render Notifications based on submissionStatus */}
      <Notifications status={submissionStatus} />

      {/* Render the CustomModal based on modalContent */}
      {isCustomModalOpen && modalContent && (
        <CustomModal
          isOpen={isCustomModalOpen}
          onClose={() => {
            setIsCustomModalOpen(false);
            setModalContent(null);
          }}
          title={modalContent.title}
          message={modalContent.message}
          actionText={modalContent.actionText}
          actionLink={modalContent.actionLink}
          iconType={modalContent.iconType}
        />
      )}

      <div className="max-w-6xl mx-auto bg-gray-100 mt-4 rounded-lg shadow-lg p-4">
        <div className="flex flex-col items-center text-xl justify-center text-slate-900 pb-4 gap-4">
          <h1>بوربوينت بالذكاء الصناعي</h1>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-600 pb-4 gap-4">
          <p>   حمل ملف وورد ثم اختر القالب لإنشاء بوربوينت بالذكاء الصناعي قابل للتعديل</p>
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
                setIsTemplateModalOpen={setIsTemplateModalOpen} // Updated prop
              />
            </CardContent>
          </Card>
        </div>

        {/* Render TemplateModal separately */}
        {isTemplateModalOpen && (
          <TemplateModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
            onSelect={(template) => {
              setSelectedTemplate(template);
              setIsTemplateModalOpen(false); // Close the modal after selection
            }}
          />
        )}
      </div>
    </>
  );
};

export default CreatePresentation;
