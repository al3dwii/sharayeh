// src/components/CreatePresentation.tsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { useCredits } from '@/contexts/CreditContext'; // Using CreditContext
import Modal from '@/components/custom/ocrModal';
import Loading from '@/components/global/loading';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import TemplateModal from './TemplateModal';

import { toast } from 'sonner';

import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'; // Icons from react-icons

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
  const [submissionStatus, setSubmissionStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [topicValue, setTopicValue] = useState<string>('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const pollingIntervalIdRef = useRef<number | null>(null);
  const pollingTimeoutIdRef = useRef<number | null>(null); // Ref for the timeout

  // **New State Variables for Retry Logic**
  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = 3; // Maximum number of retries

  // Constants for validation
  const MAX_TOPIC_LENGTH = 100; // Maximum allowed length for the topic input
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum file size in bytes (5 MB)
  const ALLOWED_FILE_TYPES = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx MIME type
  ];

  /**
   * Handle changes in the topic input field with validation.
   */
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('📝 Topic input changed:', value);

    // Check if the topic exceeds the maximum length
    if (value.length > MAX_TOPIC_LENGTH) {
      console.warn('⚠️ Topic length exceeded:', value.length);
      setSubmissionStatus('topic-too-long');
      return;
    }

    // Clear any previous submission status
    if (submissionStatus) {
      console.log('🔄 Clearing previous submission status:', submissionStatus);
      setSubmissionStatus('');
    }

    setTopicValue(value);

    // If the topic is not empty, clear the document file
    if (value !== '') {
      console.log('🗑️ Clearing document file due to topic input.');
      setDocumentFile(null);
    }
  };

  /**
   * Handle changes in the file input field with validation.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log('📄 File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        console.warn('⚠️ File size exceeded:', file.size);
        setSubmissionStatus('file-too-large');
        return;
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        console.warn('⚠️ Invalid file type:', file.type);
        setSubmissionStatus('invalid-file-type');
        return;
      }

      // Clear any previous submission status
      if (submissionStatus) {
        console.log('🔄 Clearing previous submission status:', submissionStatus);
        setSubmissionStatus('');
      }

      setDocumentFile(file);
      setTopicValue('');
      console.log('✅ File validated and set:', file.name);
    } else {
      console.log('📄 No file selected or file cleared.');
      setDocumentFile(null);
    }
  };

  /**
   * Handle form submission.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('🚀 Form submission initiated.');

    if (!user) {
      console.warn('🔒 User not authenticated. Redirecting to sign-in.');
      router.push('/sign-in');
      return;
    }

    // Ensure at least one field is filled
    if (!topicValue && !documentFile) {
      console.warn('⚠️ Both topic and document file are empty.');
      setSubmissionStatus('empty');
      return;
    }

    // Ensure a template is selected
    if (!selectedTemplate) {
      console.warn('⚠️ No template selected.');
      setSubmissionStatus('templateRequired');
      return;
    }

    if (credits === null || credits < 1) {
      console.warn('⚠️ Insufficient credits:', credits);
      setShowInsufficientCreditsModal(true);
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('');
    setRetryCount(0); // **Reset Retry Count on New Submission**
    console.log('✅ User authenticated. Proceeding with submission.');

    try {
      // **Obtain the JWT token from Clerk**
      console.log('🔑 Obtaining JWT token from Clerk.');
      const token = await getToken();
      if (!token) {
        console.error('❌ Failed to obtain JWT token.');
        setSubmissionStatus('unauthorized');
        return;
      }
      console.log('🔑 JWT token obtained.');

      // **Deduct one credit on the server with Authorization header**
      console.log('🔄 Deducting one credit from user account.');
      await axios.patch(
        '/api/update-credits',
        {
          pointsUsed: 5,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('✅ Credit deducted successfully.');

      // Refresh credits after deduction
      console.log('🔄 Refreshing user credits.');
      await refreshCredits();
      console.log('✅ User credits refreshed.');

      // **Create a new File record with Authorization header**
      const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
      console.log('📂 Creating new file record with name:', fileName);
      const response = await axios.post(
        '/api/files',
        {
          fileName,
          type: 'PRESENTATION',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newRequestId = response.data.id;
      setRequestId(newRequestId);
      console.log('✅ File record created with Request ID:', newRequestId);

      // Prepare data for the appropriate webhook
      let data: any;
      let headers: { [key: string]: string } = {};
      let webhookUrl = '';

      if (topicValue) {
        // Topic-specific webhook
        webhookUrl = 'https://hook.eu2.make.com/k5i7ogeqgl7jbgbd72xkbinx3x0ma3vq';
        data = {
          topic: topicValue,
          templateId: selectedTemplate.id,
          categoryId: selectedTemplate.category,
          userId: user.id,
          requestId: newRequestId,
        };
        console.log('📡 Preparing data for topic-specific webhook.');
      } else if (documentFile) {
        // File-specific webhook
        webhookUrl = 'https://hook.eu2.make.com/8ckct7ngtgyhc4mqn95k6srh97yx2u8x';
        data = new FormData();
        data.append('document', documentFile);
        data.append('templateId', selectedTemplate.id);
        data.append('categoryId', selectedTemplate.category);
        data.append('userId', user.id);
        data.append('requestId', newRequestId);
        headers['Content-Type'] = 'multipart/form-data';
        console.log('📡 Preparing data for file-specific webhook.');
      }

      // **Send data to the appropriate webhook**
      console.log('📡 Sending data to webhook:', webhookUrl);
      await axios.post(webhookUrl, data, { headers });
      console.log('✅ Data sent to webhook successfully.');

      setSubmissionStatus('success');

      // Reset form fields
      setTopicValue('');
      setDocumentFile(null);
      setSelectedTemplate(null);
      console.log('🧹 Form fields reset.');

      // Start polling for status
      console.log('⏳ Starting polling for request status.');
      startPolling(newRequestId);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('⚠️ Axios error during form submission:', {
          message: error.message,
          response: error.response
            ? {
                status: error.response.status,
                headers: error.response.headers,
                data: error.response.data,
              }
            : 'No response received',
          config: error.config,
        });
      } else {
        console.error('⚠️ Unexpected error during form submission:', error);
      }

      // **Set appropriate submission status based on error**
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          // Network error
          setSubmissionStatus('network-error');
        } else if (error.response.status === 400 && error.response.data.error === 'Insufficient credits') {
          setSubmissionStatus('insufficient-credits');
        } else if (error.response.status === 401) {
          // Unauthorized
          setSubmissionStatus('unauthorized');
        } else if (error.response.status >= 500) {
          // Server error
          setSubmissionStatus('server-error');
        } else if (error.response.status >= 400) {
          // Other client errors
          setSubmissionStatus('client-error');
        } else {
          // Other errors
          setSubmissionStatus('unexpected-error');
        }
      } else {
        // Non-Axios error
        setSubmissionStatus('unexpected-error');
      }
    } finally {
      setIsSubmitting(false);
      console.log('🔄 Form submission process completed.');
    }
  };

  /**
   * Start polling for the request status with retry logic.
   * @param requestId - The unique ID of the request to poll.
   */
  const startPolling = (requestId: string) => {
    // Clear any existing interval and timeout before starting a new one
    if (pollingIntervalIdRef.current) {
      console.log('⏹️ Clearing existing polling interval.');
      clearInterval(pollingIntervalIdRef.current);
      pollingIntervalIdRef.current = null;
    }

    if (pollingTimeoutIdRef.current) {
      console.log('⏹️ Clearing existing polling timeout.');
      clearTimeout(pollingTimeoutIdRef.current);
      pollingTimeoutIdRef.current = null;
    }

    setIsLoading(true);
    console.log('⏳ Polling started for Request ID:', requestId);

    // **Set up polling interval**
    const intervalId = window.setInterval(async () => {
      console.log('🔄 Polling for status update...');
      try {
        // **Obtain the JWT token from Clerk for polling**
        console.log('🔑 Obtaining JWT token for polling.');
        const token = await getToken();
        if (!token) {
          console.error('❌ Failed to obtain JWT token during polling.');
          setSubmissionStatus('unauthorized');
          stopPolling();
          return;
        }

        // **Fetch the current status of the request**
        console.log('📡 Fetching request status from /api/getfilemake.');
        const res = await axios.get('/api/getfilemake', {
          params: { requestId },
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('📈 Current status:', res.data.status);

        if (res.data && res.data.status === 'COMPLETED') {
          setIsLoading(false);
          setDownloadUrl(res.data.downloadUrl);
          console.log('✅ Request completed. Download URL obtained:', res.data.downloadUrl);

          // Clear the interval and timeout
          stopPolling();

          // Refresh credits to reflect any additions
          await refreshCredits();
          console.log('🔄 Credits refreshed after completion.');
        } else if (res.data.status === 'FAILED') {
          setIsLoading(false);
          setSubmissionStatus('error');
          console.error('❌ Request failed.');

          // Clear the interval and timeout
          stopPolling();
        } else {
          console.log('🔄 Request still in progress.');
        }
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 401) {
            console.error('❌ Unauthorized access during polling.');
            setSubmissionStatus('unauthorized');
          } else {
            console.error('⚠️ Error during polling:', error);
            // Optionally, handle polling errors
          }
        } else {
          console.error('⚠️ Non-Axios error during polling:', error);
          // Optionally, handle polling errors
        }
      }
    }, 5000); // Poll every 5 seconds

    pollingIntervalIdRef.current = intervalId;
    console.log('⏳ Polling interval ID set:', intervalId);

    // **Set up a timeout to abort polling after 1 minute**
    const timeoutId = window.setTimeout(() => {
      console.warn('⏰ Polling timed out after 1 minute.');

      // Clear the polling interval
      if (pollingIntervalIdRef.current) {
        clearInterval(pollingIntervalIdRef.current);
        console.log('⏹️ Polling interval cleared due to timeout.');
        pollingIntervalIdRef.current = null;
      }

      // Increment the retry count
      setRetryCount((prev) => {
        const newRetryCount = prev + 1;
        console.log(`🔁 Retry attempt ${newRetryCount} of ${maxRetries}.`);

        if (newRetryCount < maxRetries) {
          console.log('🔄 Retrying polling...');
          startPolling(requestId); // Retry polling
        } else {
          console.error('❌ Maximum retry attempts reached. Aborting.');
          setSubmissionStatus('timeout-error'); // Set a new submission status
          setIsLoading(false);
        }

        return newRetryCount;
      });

      // Clear the timeout ID
      pollingTimeoutIdRef.current = null;
    }, 90000); // 1 minute timeout

    pollingTimeoutIdRef.current = timeoutId;
    console.log('⏳ Polling timeout ID set:', timeoutId);
  };

  /**
   * Stop polling by clearing the interval and timeout.
   */
  const stopPolling = () => {
    if (pollingIntervalIdRef.current) {
      clearInterval(pollingIntervalIdRef.current);
      console.log('⏹️ Polling interval cleared.');
      pollingIntervalIdRef.current = null;
    }

    if (pollingTimeoutIdRef.current) {
      clearTimeout(pollingTimeoutIdRef.current);
      console.log('⏹️ Polling timeout cleared.');
      pollingTimeoutIdRef.current = null;
    }

    setIsLoading(false);
  };

  /**
   * Clean up polling on component unmount.
   */
  useEffect(() => {
    return () => {
      if (pollingIntervalIdRef.current) {
        clearInterval(pollingIntervalIdRef.current);
        console.log('🧹 Component unmounted. Polling interval cleared.');
      }

      if (pollingTimeoutIdRef.current) {
        clearTimeout(pollingTimeoutIdRef.current);
        console.log('🧹 Component unmounted. Polling timeout cleared.');
      }
    };
  }, []);

  /**
   * Handle submission status changes and display appropriate toasts.
   */
  const handleSubmissionStatus = (status: string) => {
    console.log('🔔 Handling submission status:', status);
    switch (status) {
      case 'success':
        toast.success(
          <div className="flex text-xl justify-between items-center">
            <span>تم الإرسال بنجاح!</span>
            <button
              onClick={() => toast.dismiss()}
              className="mr-8 text-green-800 hover:text-green-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 20000,
            style: {
              backgroundColor: '#D4EDDA', // Success green background
              color: '#155724', // Success text color
              border: '1px solid #C3E6CB', // Success border color
            },
            icon: <FiCheckCircle color="#155724" size={24} />,
          }
        );
        console.log('✅ Success toast displayed.');
        break;

      case 'error':
        toast.error(
          <div className="flex justify-between items-center">
            <span>حدث خطأ أثناء الإرسال.</span>
            <button
              onClick={() => toast.dismiss()}
              className="ml-4 text-red-800 hover:text-red-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 20000,
            style: {
              backgroundColor: '#F8D7DA', // Error red background
              color: '#721C24', // Error text color
              border: '1px solid #F5C6CB', // Error border color
            },
            icon: <FiAlertCircle color="#721C24" size={24} />,
          }
        );
        console.log('❌ Error toast displayed.');
        break;

      case 'empty':
        toast.warning(
          <div className="flex text-[18px] justify-between items-center">
            <span>الرجاء إدخال الموضوع أو اختيار ملف.</span>
            <button
              onClick={() => toast.dismiss()}
              className="mr-20 text-yellow-800 hover:text-yellow-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 20000,
            style: {
              backgroundColor: '#FFF3CD', // Warning yellow background
              color: '#856404', // Warning text color
              border: '1px solid #FFEEBA', // Warning border color
            },
            icon: <FiInfo color="#856404" size={24} />,
          }
        );
        console.log('⚠️ Empty submission warning toast displayed.');
        break;

      case 'templateRequired':
        toast.warning(
          <div className="flex text-[18px] justify-between items-center">
            <span>يرجى اختيار قالب قبل الإرسال.</span>
            <button
              onClick={() => toast.dismiss()}
              className="mr-20 text-yellow-800 hover:text-yellow-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 20000,
            style: {
              backgroundColor: '#FFF3CD', // Warning yellow background
              color: '#856404', // Warning text color
              border: '1px solid #FFEEBA', // Warning border color
            },
            icon: <FiInfo color="#856404" size={24} />,
          }
        );
        console.log('⚠️ Template required warning toast displayed.');
        break;

      case 'network-error':
        toast.error(
          <div className="flex justify-between items-center">
            <span>حدث خطأ في الشبكة. يرجى التحقق من اتصالك.</span>
            <button
              onClick={() => toast.dismiss()}
              className="ml-4 text-red-800 hover:text-red-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 20000,
            style: {
              backgroundColor: '#F8D7DA', // Error red background
              color: '#721C24', // Error text color
              border: '1px solid #F5C6CB', // Error border color
            },
            icon: <FiAlertCircle color="#721C24" size={24} />,
          }
        );
        console.log('❌ Network error toast displayed.');
        break;

      case 'server-error':
        toast.error(
          <div className="flex justify-between items-center">
            <span>حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.</span>
            <button
              onClick={() => toast.dismiss()}
              className="ml-4 text-red-800 hover:text-red-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 20000,
            style: {
              backgroundColor: '#F8D7DA', // Error red background
              color: '#721C24', // Error text color
              border: '1px solid #F5C6CB', // Error border color
            },
            icon: <FiAlertCircle color="#721C24" size={24} />,
          }
        );
        console.log('❌ Server error toast displayed.');
        break;

      case 'client-error':
        toast.error(
          <div className="flex justify-between items-center">
            <span>فشل الإرسال بسبب إدخال غير صالح.</span>
            <button
              onClick={() => toast.dismiss()}
              className="ml-4 text-red-800 hover:text-red-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 20000,
            style: {
              backgroundColor: '#F8D7DA', // Error red background
              color: '#721C24', // Error text color
              border: '1px solid #F5C6CB', // Error border color
            },
            icon: <FiAlertCircle color="#721C24" size={24} />,
          }
        );
        console.log('❌ Client error toast displayed.');
        break;

      case 'unauthorized':
        toast.error(
          <div className="flex justify-between items-center">
            <span>غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.</span>
            <button
              onClick={() => toast.dismiss()}
              className="ml-4 text-red-800 hover:text-red-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 20000,
            style: {
              backgroundColor: '#F8D7DA', // Error red background
              color: '#721C24', // Error text color
              border: '1px solid #F5C6CB', // Error border color
            },
            icon: <FiAlertCircle color="#721C24" size={24} />,
          }
        );
        console.log('❌ Unauthorized access toast displayed.');
        break;

      case 'timeout-error': // **New Case for Timeout Error**
        toast.error(
          <div className="flex justify-between items-center">
            <span>لم يتم تجهيز الملف في الوقت المحدد. يرجى المحاولة مرة أخرى.</span>
            <button
              onClick={() => toast.dismiss()}
              className="ml-4 text-red-800 hover:text-red-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 20000,
            style: {
              backgroundColor: '#F8D7DA', // Error red background
              color: '#721C24', // Error text color
              border: '1px solid #F5C6CB', // Error border color
            },
            icon: <FiAlertCircle color="#721C24" size={24} />,
          }
        );
        console.log('❌ Timeout error toast displayed.');
        break;

      case 'topic-too-long':
        toast.warning(
          <div className="flex text-[18px] justify-between items-center">
            <span>الموضوع طويل جدًا. يرجى تحديده بـ 100 حرف.</span>
            <button
              onClick={() => toast.dismiss()}
              className="mr-20 text-yellow-800 hover:text-yellow-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 20000,
            style: {
              backgroundColor: '#FFF3CD', // Warning yellow background
              color: '#856404', // Warning text color
              border: '1px solid #FFEEBA', // Warning border color
            },
            icon: <FiInfo color="#856404" size={24} />,
          }
        );
        console.log('⚠️ Topic too long warning toast displayed.');
        break;

      case 'file-too-large':
        toast.warning(
          <div className="flex text-[18px] justify-between items-center">
            <span>الملف كبير جدًا. الحجم الأقصى هو 5 ميجابايت.</span>
            <button
              onClick={() => toast.dismiss()}
              className="mr-20 text-yellow-800 hover:text-yellow-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 20000,
            style: {
              backgroundColor: '#FFF3CD', // Warning yellow background
              color: '#856404', // Warning text color
              border: '1px solid #FFEEBA', // Warning border color
            },
            icon: <FiInfo color="#856404" size={24} />,
          }
        );
        console.log('⚠️ File too large warning toast displayed.');
        break;

      case 'invalid-file-type':
        toast.warning(
          <div className="flex text-[18px] justify-between items-center">
            <span>نوع الملف غير صالح. يرجى تحميل ملف .docx.</span>
            <button
              onClick={() => toast.dismiss()}
              className="mr-20 text-yellow-800 hover:text-yellow-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 20000,
            style: {
              backgroundColor: '#FFF3CD', // Warning yellow background
              color: '#856404', // Warning text color
              border: '1px solid #FFEEBA', // Warning border color
            },
            icon: <FiInfo color="#856404" size={24} />,
          }
        );
        console.log('⚠️ Invalid file type warning toast displayed.');
        break;

      case 'insufficient-credits':
        toast.error(
          <div className="flex justify-between items-center">
            <span>رصيدك غير كافٍ. يرجى ترقية خطتك.</span>
            <button
              onClick={() => toast.dismiss()}
              className="ml-4 text-red-800 hover:text-red-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 30000,
            style: {
              backgroundColor: '#F8D7DA', // Error red background
              color: '#721C24', // Error text color
              border: '1px solid #F5C6CB', // Error border color
            },
            icon: <FiAlertCircle color="#721C24" size={24} />,
          }
        );
        console.log('❌ Insufficient credits error toast displayed.');
        break;

      default:
        toast.error(
          <div className="flex justify-between items-center">
            <span>حدث خطأ غير معروف.</span>
            <button
              onClick={() => toast.dismiss()}
              className="ml-4 text-red-800 hover:text-red-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 30000,
            style: {
              backgroundColor: '#F8D7DA', // Error red background
              color: '#721C24', // Error text color
              border: '1px solid #F5C6CB', // Error border color
            },
            icon: <FiAlertCircle color="#721C24" size={24} />,
          }
        );
        console.log('❌ Default unexpected error toast displayed.');
        break;
    }
  };

  /**
   * Call this function when `submissionStatus` changes
   */
  useEffect(() => {
    if (submissionStatus) {
      console.log('🔄 Submission status changed to:', submissionStatus);
      handleSubmissionStatus(submissionStatus);
    }
  }, [submissionStatus]);


  const handleDownload = () => {
    // Create a hidden anchor tag to trigger the download
    const link = document.createElement("a");
    link.href = downloadUrl; // File URL
    link.download = ""; // Use the default filename from the URL
    link.rel = "noopener noreferrer"; // Security
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Trigger a refresh after initiating the download
    router.refresh();
  };


  return (
    <>
      {/* Modals */}
      <Modal
        isOpen={showInsufficientCreditsModal}
        onClose={() => setShowInsufficientCreditsModal(false)}
        title="رصيدك غير كافٍ"
        message="ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى ترقية خطتك."
        actionText="ترقية الخطة"
        actionLink="/pricing"
      />

      <div className="max-w-6xl mx-auto bg-gray-100 mt-4 rounded-lg shadow-lg p-4">
        <div className="flex flex-col items-center text-xl justify-center text-slate-900 pb-4 gap-4">
          <h1>بوربوينت بالذكاء الصناعي</h1>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-600 pb-4 gap-4">
          <p>
            اكتب الموضوع أو حمل ملف وورد ثم اختر القالب لإنشاء بوربوينت بالذكاء الصناعي قابل للتعديل
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-2">
          <Card>
            <CardHeader></CardHeader>

            {(submissionStatus || isLoading || downloadUrl) && (
              <div className="rounded-lg pb-4 mb-4 p-4">
                {/* Loading and Download */}
                {isLoading && (
                  <div className="w-full flex flex-col items-center mt-4">
                    {/* Loading spinner */}
                    <div className="flex items-center justify-center">
                      <Loading />
                    </div>

                    {/* Text below the spinner */}
                    <div className="w-full flex justify-center p-4 mt-4 text-gray-400 text-center">
                      .....يتم تجهيز ملف العرض الرجاء الانتظار قليلاً
                    </div>

                    {/* Horizontal line */}
                    <div className="w-1/2 border-t border-gray-300 mt-2"></div>
                  </div>
                )}
                {downloadUrl ? (

                  <button
                  onClick={handleDownload}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                  تحميل الملف
                  </button>

                  // <div className="w-full flex justify-center mt-4">
                  //   <a
                  //     href={downloadUrl}
                  //     className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  //     target="_blank"
                  //     rel="noopener noreferrer"
                  //   >
                  //     تحميل الملف
                  //   </a>
                  // </div>
                ) : (
                  <div className="text-gray-500 mt-4 text-center"></div>
                )}
              </div>
            )}

            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex m-auto w-5/6 flex-col lg:flex-row justify-between">
                  {/* Topic Field */}
                  <div className="mb-4 flex-1 lg:mr-2">
                    <input
                      type="text"
                      name="topic"
                      id="topic"
                      placeholder="ادخل الموضوع"
                      value={topicValue}
                      onChange={handleTopicChange}
                      disabled={documentFile !== null}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="flex justify-center px-4 text-xl py-2"> أو </div>

                  {/* File Field */}
                  <div className="mb-4 flex-1 lg:ml-2">
                    <input
                      type="file"
                      name="document"
                      id="document"
                      accept=".docx"
                      onChange={handleFileChange}
                      disabled={topicValue !== ''}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </div>

                {/* Template Selection */}
                <div className="mb-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🖼️ Template selection modal opened.');
                      setIsModalOpen(true);
                    }}
                    className="md:w-1/4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                  >
                    {selectedTemplate
                      ? `تم اختيار القالب: ${selectedTemplate.name}`
                      : 'اختر القالب'}
                  </button>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="md:w-1/4 center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Template Modal */}
        {isModalOpen && (
          <TemplateModal
            isOpen={isModalOpen}
            onClose={() => {
              console.log('🖼️ Template selection modal closed.');
              setIsModalOpen(false);
            }}
            onSelect={(template) => {
              console.log('🖼️ Template selected:', template.name);
              setSelectedTemplate(template);
            }}
          />
        )}
      </div>
    </>
  );
};

export default CreatePresentation;



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

//       // **Deduct one credit on the server with Authorization header**
//       console.log('🔄 Deducting one credit from user account.');
//       await axios.patch(
//         '/api/update-credits',
//         {
//           pointsUsed: 1,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       console.log('✅ Credit deducted successfully.');

//       // Refresh credits after deduction
//       console.log('🔄 Refreshing user credits.');
//       await refreshCredits();
//       console.log('✅ User credits refreshed.');

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
//         webhookUrl = 'https://hook.eu2.make.com/k5i7ogeqgl7jbgbd72xkbinx3x0ma3vq';
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
//    * Start polling for the request status.
//    * @param requestId - The unique ID of the request to poll.
//    */
//   const startPolling = (requestId: string) => {
//     // Clear any existing interval before starting a new one
//     if (pollingIntervalIdRef.current) {
//       console.log('⏹️ Clearing existing polling interval.');
//       clearInterval(pollingIntervalIdRef.current);
//     }

//     setIsLoading(true);
//     console.log('⏳ Polling started for Request ID:', requestId);

//     const intervalId = window.setInterval(async () => {
//       console.log('🔄 Polling for status update...');
//       try {
//         // **Obtain the JWT token from Clerk for polling**
//         console.log('🔑 Obtaining JWT token for polling.');
//         const token = await getToken();
//         if (!token) {
//           console.error('❌ Failed to obtain JWT token during polling.');
//           setSubmissionStatus('unauthorized');
//           if (pollingIntervalIdRef.current) {
//             clearInterval(pollingIntervalIdRef.current);
//             pollingIntervalIdRef.current = null;
//             console.log('⏹️ Polling stopped due to unauthorized access.');
//           }
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

//           // Clear the interval
//           if (pollingIntervalIdRef.current) {
//             clearInterval(pollingIntervalIdRef.current);
//             pollingIntervalIdRef.current = null;
//             console.log('⏹️ Polling stopped as request is completed.');
//           }

//           // Refresh credits to reflect any additions
//           await refreshCredits();
//           console.log('🔄 Credits refreshed after completion.');
//         } else if (res.data.status === 'FAILED') {
//           setIsLoading(false);
//           setSubmissionStatus('error');
//           console.error('❌ Request failed.');

//           // Clear the interval
//           if (pollingIntervalIdRef.current) {
//             clearInterval(pollingIntervalIdRef.current);
//             pollingIntervalIdRef.current = null;
//             console.log('⏹️ Polling stopped as request has failed.');
//           }
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
//     };
//   }, []);

//   /**
//    * Handle submission status changes and display appropriate toasts.
//    */
//   const handleSubmissionStatus = (status: string) => {
//     console.log('🔔 Handling submission status:', status);
//     switch (status) {
//       case 'success':
//         toast.success(
//           <div className="flex text-xl justify-between items-center">
//             <span>تم الإرسال بنجاح!</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-8 text-green-800 hover:text-green-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#D4EDDA', // Success green background
//               color: '#155724', // Success text color
//               border: '1px solid #C3E6CB', // Success border color
//             },
//             icon: <FiCheckCircle color="#155724" size={24} />,
//           }
//         );
//         console.log('✅ Success toast displayed.');
//         break;

//       case 'error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ أثناء الإرسال.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         console.log('❌ Error toast displayed.');
//         break;

//       case 'empty':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>الرجاء إدخال الموضوع أو اختيار ملف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         console.log('⚠️ Empty submission warning toast displayed.');
//         break;

//       case 'templateRequired':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>يرجى اختيار قالب قبل الإرسال.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         console.log('⚠️ Template required warning toast displayed.');
//         break;

//       case 'network-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ في الشبكة. يرجى التحقق من اتصالك.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         console.log('❌ Network error toast displayed.');
//         break;

//       case 'server-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         console.log('❌ Server error toast displayed.');
//         break;

//       case 'client-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>فشل الإرسال بسبب إدخال غير صالح.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         console.log('❌ Client error toast displayed.');
//         break;

//       case 'unauthorized':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         console.log('❌ Unauthorized access toast displayed.');
//         break;

//       case 'unexpected-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ غير معروف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         console.log('❌ Unexpected error toast displayed.');
//         break;

//       case 'topic-too-long':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>الموضوع طويل جدًا. يرجى تحديده بـ 100 حرف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         console.log('⚠️ Topic too long warning toast displayed.');
//         break;

//       case 'file-too-large':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>الملف كبير جدًا. الحجم الأقصى هو 5 ميجابايت.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         console.log('⚠️ File too large warning toast displayed.');
//         break;

//       case 'invalid-file-type':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>نوع الملف غير صالح. يرجى تحميل ملف .docx.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         console.log('⚠️ Invalid file type warning toast displayed.');
//         break;

//       case 'insufficient-credits':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>رصيدك غير كافٍ. يرجى ترقية خطتك.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         console.log('❌ Insufficient credits error toast displayed.');
//         break;

//       default:
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ غير معروف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         console.log('❌ Default unexpected error toast displayed.');
//         break;
//     }
//   };

//   /**
//    * Call this function when `submissionStatus` changes
//    */
//   useEffect(() => {
//     if (submissionStatus) {
//       console.log('🔄 Submission status changed to:', submissionStatus);
//       handleSubmissionStatus(submissionStatus);
//     }
//   }, [submissionStatus]);

//   return (
//     <>
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
//                     <a
//                       href={downloadUrl}
//                       className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       تحميل الملف
//                     </a>
//                   </div>
//                 ) : (
//                   <div className="text-gray-500 mt-4 text-center"></div>
//                 )}
//               </div>
//             )}

//             <CardContent>
//               <form onSubmit={handleSubmit}>
//                 <div className="flex m-auto w-5/6 flex-col lg:flex-row justify-between">
//                   {/* Topic Field */}
//                   <div className="mb-4 flex-1 lg:mr-2">
//                     <input
//                       type="text"
//                       name="topic"
//                       id="topic"
//                       placeholder="ادخل الموضوع"
//                       value={topicValue}
//                       onChange={handleTopicChange}
//                       disabled={documentFile !== null}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>
//                   <div className="flex justify-center px-4 text-xl py-2"> أو </div>

//                   {/* File Field */}
//                   <div className="mb-4 flex-1 lg:ml-2">
//                     <input
//                       type="file"
//                       name="document"
//                       id="document"
//                       accept=".docx"
//                       onChange={handleFileChange}
//                       disabled={topicValue !== ''}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>
//                 </div>

//                 {/* Template Selection */}
//                 <div className="mb-4 flex justify-center">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       console.log('🖼️ Template selection modal opened.');
//                       setIsModalOpen(true);
//                     }}
//                     className="md:w-1/4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//                   >
//                     {selectedTemplate
//                       ? `تم اختيار القالب: ${selectedTemplate.name}`
//                       : 'اختر القالب'}
//                   </button>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex justify-center">
//                   <button
//                     type="submit"
//                     className="md:w-1/4 center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
//                   </button>
//                 </div>
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

//   // Constants for validation
//   const MAX_TOPIC_LENGTH = 100; // Maximum allowed length for the topic input
//   const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum file size in bytes (5 MB)
//   const ALLOWED_FILE_TYPES = [
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx MIME type
//   ];

//   // Handle topic change with validation
//   const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;

//     // Check if the topic exceeds the maximum length
//     if (value.length > MAX_TOPIC_LENGTH) {
//       setSubmissionStatus('topic-too-long');
//       return;
//     }

//     // Clear any previous submission status
//     if (submissionStatus) {
//       setSubmissionStatus('');
//     }

//     setTopicValue(value);

//     // If the topic is not empty, clear the document file
//     if (value !== '') {
//       setDocumentFile(null);
//     }
//   };

//   // Handle file change with validation
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

//       // Clear any previous submission status
//       if (submissionStatus) {
//         setSubmissionStatus('');
//       }

//       setDocumentFile(file);
//       setTopicValue('');
//     } else {
//       setDocumentFile(null);
//     }
//   };

//   // Handle form submission
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

//     try {
//       // **Obtain the JWT token from Clerk**
//       const token = await getToken();
//       if (!token) {
//         setSubmissionStatus('unauthorized');
//         return;
//       }

//       // **Deduct one credit on the server with Authorization header**
//       await axios.patch(
//         '/api/update-credits',
//         {
//           pointsUsed: 1,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // Refresh credits after deduction
//       await refreshCredits();

//       // **Create a new File record with Authorization header**
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

//       // Prepare data for the appropriate webhook
//       let data: any;
//       let headers: { [key: string]: string } = {};
//       let webhookUrl = '';

//       if (topicValue) {
//         // Topic-specific webhook
//         webhookUrl = 'https://hook.eu2.make.com/k5i7ogeqgl7jbgbd72xkbinx3x0ma3vq';
//         data = {
//           topic: topicValue,
//           templateId: selectedTemplate.id,
//           categoryId: selectedTemplate.category,
//           userId: user.id,
//           requestId: newRequestId,
//         };
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
//       }

//       // **Send data to the appropriate webhook**
//       await axios.post(webhookUrl, data, { headers });

//       setSubmissionStatus('success');

//       // Reset form fields
//       setTopicValue('');
//       setDocumentFile(null);
//       setSelectedTemplate(null);

//       // Start polling for status
//       startPolling(newRequestId);
//     } catch (error: any) {
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
//     }
//   };

//   // Start polling for the request status
//   const startPolling = (requestId: string) => {
//     // Clear any existing interval before starting a new one
//     if (pollingIntervalIdRef.current) {
//       clearInterval(pollingIntervalIdRef.current);
//     }

//     setIsLoading(true);

//     const intervalId = window.setInterval(async () => {
//       try {
//         // **Obtain the JWT token from Clerk for polling**
//         const token = await getToken();
//         if (!token) {
//           setSubmissionStatus('unauthorized');
//           if (pollingIntervalIdRef.current) {
//             clearInterval(pollingIntervalIdRef.current);
//             pollingIntervalIdRef.current = null;
//           }
//           return;
//         }

//         const res = await axios.get('/api/getfilemake', {
//           params: { requestId },
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (res.data && res.data.status === 'COMPLETED') {
//           setIsLoading(false);
//           setDownloadUrl(res.data.downloadUrl);

//           // Clear the interval
//           if (pollingIntervalIdRef.current) {
//             clearInterval(pollingIntervalIdRef.current);
//             pollingIntervalIdRef.current = null;
//           }

//           // Refresh credits to reflect any additions
//           await refreshCredits();
//         } else if (res.data.status === 'FAILED') {
//           setIsLoading(false);
//           setSubmissionStatus('error');

//           // Clear the interval
//           if (pollingIntervalIdRef.current) {
//             clearInterval(pollingIntervalIdRef.current);
//             pollingIntervalIdRef.current = null;
//           }
//         }
//       } catch (error: any) {
//         if (axios.isAxiosError(error)) {
//           if (error.response && error.response.status === 401) {
//             setSubmissionStatus('unauthorized');
//           } else {
//             console.error('Error checking status:', error);
//             // Optionally, handle polling errors
//           }
//         } else {
//           console.error('Error checking status:', error);
//           // Optionally, handle polling errors
//         }
//       }
//     }, 5000); // Poll every 5 seconds

//     pollingIntervalIdRef.current = intervalId;
//   };

//   // Clean up polling on unmount
//   useEffect(() => {
//     return () => {
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//       }
//     };
//   }, []);

//   // Handle submission status changes and display appropriate toasts
//   const handleSubmissionStatus = (status: string) => {
//     switch (status) {
//       case 'success':
//         toast.success(
//           <div className="flex text-xl justify-between items-center">
//             <span>تم الإرسال بنجاح!</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-8 text-green-800 hover:text-green-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#D4EDDA', // Success green background
//               color: '#155724', // Success text color
//               border: '1px solid #C3E6CB', // Success border color
//             },
//             icon: <FiCheckCircle color="#155724" size={24} />,
//           }
//         );
//         break;

//       case 'error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ أثناء الإرسال.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       case 'empty':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>الرجاء إدخال الموضوع أو اختيار ملف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;

//       case 'templateRequired':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>يرجى اختيار قالب قبل الإرسال.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;

//       case 'network-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ في الشبكة. يرجى التحقق من اتصالك.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       case 'server-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       case 'client-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>فشل الإرسال بسبب إدخال غير صالح.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       case 'unauthorized':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       case 'unexpected-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ غير معروف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       case 'topic-too-long':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>الموضوع طويل جدًا. يرجى تحديده بـ 100 حرف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;

//       case 'file-too-large':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>الملف كبير جدًا. الحجم الأقصى هو 5 ميجابايت.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;

//       case 'invalid-file-type':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>نوع الملف غير صالح. يرجى تحميل ملف .docx.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;

//       case 'insufficient-credits':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>رصيدك غير كافٍ. يرجى ترقية خطتك.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       default:
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ غير معروف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;
//     }
//   };

//   // Call this function when `submissionStatus` changes
//   useEffect(() => {
//     if (submissionStatus) {
//       handleSubmissionStatus(submissionStatus);
//     }
//   }, [submissionStatus]);

//   return (
//     <>
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
//                     <a
//                       href={downloadUrl}
//                       className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       تحميل الملف
//                     </a>
//                   </div>
//                 ) : (
//                   <div className="text-gray-500 mt-4 text-center"></div>
//                 )}
//               </div>
//             )}

//             <CardContent>
//               <form onSubmit={handleSubmit}>
//                 <div className="flex m-auto w-5/6 flex-col lg:flex-row justify-between">
//                   {/* Topic Field */}
//                   <div className="mb-4 flex-1 lg:mr-2">
//                     <input
//                       type="text"
//                       name="topic"
//                       id="topic"
//                       placeholder="ادخل الموضوع"
//                       value={topicValue}
//                       onChange={handleTopicChange}
//                       disabled={documentFile !== null}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>
//                   <div className="flex justify-center px-4 text-xl py-2"> أو </div>

//                   {/* File Field */}
//                   <div className="mb-4 flex-1 lg:ml-2">
//                     <input
//                       type="file"
//                       name="document"
//                       id="document"
//                       accept=".docx"
//                       onChange={handleFileChange}
//                       disabled={topicValue !== ''}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>
//                 </div>

//                 {/* Template Selection */}
//                 <div className="mb-4 flex justify-center">
//                   <button
//                     type="button"
//                     onClick={() => setIsModalOpen(true)}
//                     className="md:w-1/4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//                   >
//                     {selectedTemplate
//                       ? `تم اختيار القالب: ${selectedTemplate.name}`
//                       : 'اختر القالب'}
//                   </button>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex justify-center">
//                   <button
//                     type="submit"
//                     className="md:w-1/4 center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
//                   </button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Template Modal */}
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

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { useCredits } from '@/contexts/CreditContext'; // Using CreditContext
// import Modal from '@/components/custom/ocrModal';
// import Loading from '@/components/global/loading';
// import { Card, CardHeader, CardContent } from '@/components/ui/card';
// import TemplateModal from './TemplateModal';

// import { toast } from 'sonner';

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

//   // Constants for validation
//   const MAX_TOPIC_LENGTH = 100; // Maximum allowed length for the topic input
//   const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum file size in bytes (5 MB)
//   const ALLOWED_FILE_TYPES = [
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx MIME type
//   ];

//   // Handle topic change with validation
//   const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;

//     // Check if the topic exceeds the maximum length
//     if (value.length > MAX_TOPIC_LENGTH) {
//       setSubmissionStatus('topic-too-long');
//       return;
//     }

//     // Clear any previous submission status
//     if (submissionStatus) {
//       setSubmissionStatus('');
//     }

//     setTopicValue(value);

//     // If the topic is not empty, clear the document file
//     if (value !== '') {
//       setDocumentFile(null);
//     }
//   };

//   // Handle file change with validation
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

//       // Clear any previous submission status
//       if (submissionStatus) {
//         setSubmissionStatus('');
//       }

//       setDocumentFile(file);
//       setTopicValue('');
//     } else {
//       setDocumentFile(null);
//     }
//   };

//   // Handle form submission
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

//     try {
//       // Deduct one credit on the server
//       await axios.patch('/api/update-credits', {
//         pointsUsed: 1,
//       });

//       // Refresh credits after deduction
//       await refreshCredits();

//       // Create a new File record
//       const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
//       const response = await axios.post('/api/files', {
//         fileName,
//         type: 'PRESENTATION',
//       });

//       const newRequestId = response.data.id;
//       setRequestId(newRequestId);

//       // Prepare data for the appropriate webhook
//       let data: any;
//       let headers: { [key: string]: string } = {};
//       let webhookUrl = '';

//       if (topicValue) {
//         // Topic-specific webhook
//         webhookUrl = 'https://hook.eu2.make.com/k5i7ogeqgl7jbgbd72xkbinx3x0ma3vq';
//         data = {
//           topic: topicValue,
//           templateId: selectedTemplate.id,
//           categoryId: selectedTemplate.category,
//           userId: user.id,
//           requestId: newRequestId,
//         };
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
//       }

//       // Send data to the appropriate webhook
//       await axios.post(webhookUrl, data, { headers });

//       setSubmissionStatus('success');

//       // Reset form fields
//       setTopicValue('');
//       setDocumentFile(null);
//       setSelectedTemplate(null);

//       // Start polling for status
//       startPolling(newRequestId);
//     } catch (error: any) {
//       if (axios.isAxiosError(error)) {
//         if (!error.response) {
//           // Network error
//           setSubmissionStatus('network-error');
//         } else if (error.response.status === 400 && error.response.data.error === 'Insufficient credits') {
//           setSubmissionStatus('insufficient-credits');
//         } else if (error.response.status >= 500) {
//           // Server error
//           setSubmissionStatus('server-error');
//         } else if (error.response.status >= 400) {
//           // Client error
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
//     }
//   };

//   // Start polling for the request status
//   const startPolling = (requestId: string) => {
//     // Clear any existing interval before starting a new one
//     if (pollingIntervalIdRef.current) {
//       clearInterval(pollingIntervalIdRef.current);
//     }

//     setIsLoading(true);

//     const intervalId = window.setInterval(async () => {
//       try {
//         const res = await axios.get('/api/getfilemake', {
//           params: { requestId },
//         });

//         if (res.data && res.data.status === 'COMPLETED') {
//           setIsLoading(false);
//           setDownloadUrl(res.data.downloadUrl);

//           // Clear the interval
//           if (pollingIntervalIdRef.current) {
//             clearInterval(pollingIntervalIdRef.current);
//             pollingIntervalIdRef.current = null;
//           }

//           // Refresh credits to reflect any additions
//           await refreshCredits();
//         } else if (res.data.status === 'FAILED') {
//           setIsLoading(false);
//           setSubmissionStatus('error');

//           // Clear the interval
//           if (pollingIntervalIdRef.current) {
//             clearInterval(pollingIntervalIdRef.current);
//             pollingIntervalIdRef.current = null;
//           }
//         }
//       } catch (error) {
//         console.error('Error checking status:', error);
//         // Optionally, handle polling errors
//       }
//     }, 5000); // Poll every 5 seconds

//     pollingIntervalIdRef.current = intervalId;
//   };

//   // Clean up polling on unmount
//   useEffect(() => {
//     return () => {
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//       }
//     };
//   }, []);

//   // Handle submission status changes and display appropriate toasts
//   const handleSubmissionStatus = (status: string) => {
//     switch (status) {
//       case 'success':
//         toast.success(
//           <div className="flex text-xl justify-between items-center">
//             <span>تم الإرسال بنجاح!</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-8 text-green-800 hover:text-green-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#D4EDDA', // Success green background
//               color: '#155724', // Success text color
//               border: '1px solid #C3E6CB', // Success border color
//             },
//             icon: <FiCheckCircle color="#155724" size={24} />,
//           }
//         );
//         break;

//       case 'error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ أثناء الإرسال.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       case 'empty':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>الرجاء إدخال الموضوع أو اختيار ملف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;

//       case 'templateRequired':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>يرجى اختيار قالب قبل الإرسال.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;

//       case 'network-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ في الشبكة. يرجى التحقق من اتصالك.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       case 'server-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       case 'client-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>فشل الإرسال بسبب إدخال غير صالح.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       case 'unexpected-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ غير معروف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       case 'topic-too-long':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>الموضوع طويل جدًا. يرجى تحديده بـ 100 حرف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;

//       case 'file-too-large':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>الملف كبير جدًا. الحجم الأقصى هو 5 ميجابايت.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;

//       case 'invalid-file-type':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>نوع الملف غير صالح. يرجى تحميل ملف .docx.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;

//       case 'insufficient-credits':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>رصيدك غير كافٍ. يرجى ترقية خطتك.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;

//       default:
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ غير معروف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;
//     }
//   };

//   // Call this function when `submissionStatus` changes
//   useEffect(() => {
//     if (submissionStatus) {
//       handleSubmissionStatus(submissionStatus);
//     }
//   }, [submissionStatus]);

//   return (
//     <>
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
//                     <a
//                       href={downloadUrl}
//                       className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       تحميل الملف
//                     </a>
//                   </div>
//                 ) : (
//                   <div className="text-gray-500 mt-4 text-center"></div>
//                 )}
//               </div>
//             )}

//             <CardContent>
//               <form onSubmit={handleSubmit}>
//                 <div className="flex m-auto w-5/6 flex-col lg:flex-row justify-between">
//                   {/* Topic Field */}
//                   <div className="mb-4 flex-1 lg:mr-2">
//                     <input
//                       type="text"
//                       name="topic"
//                       id="topic"
//                       placeholder="ادخل الموضوع"
//                       value={topicValue}
//                       onChange={handleTopicChange}
//                       disabled={documentFile !== null}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>
//                   <div className="flex justify-center px-4 text-xl py-2"> أو </div>

//                   {/* File Field */}
//                   <div className="mb-4 flex-1 lg:ml-2">
//                     <input
//                       type="file"
//                       name="document"
//                       id="document"
//                       accept=".docx"
//                       onChange={handleFileChange}
//                       disabled={topicValue !== ''}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>
//                 </div>

//                 {/* Template Selection */}
//                 <div className="mb-4 flex justify-center">
//                   <button
//                     type="button"
//                     onClick={() => setIsModalOpen(true)}
//                     className="md:w-1/4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//                   >
//                     {selectedTemplate
//                       ? `تم اختيار القالب: ${selectedTemplate.name}`
//                       : 'اختر القالب'}
//                   </button>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex justify-center">
//                   <button
//                     type="submit"
//                     className="md:w-1/4 center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
//                   </button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Template Modal */}
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








// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { useStore } from '@/store/useStore';
// import Modal from '@/components/custom/ocrModal';
// import Loading from '@/components/global/loading';
// import { Card, CardHeader, CardContent } from '@/components/ui/card';
// import TemplateModal from './TemplateModal';

// import { toast } from 'sonner';

// import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'; // Icons from react-icons

// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   category: string; // Add this line
// }


// const CreatePresentation: React.FC = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const { getToken } = useAuth();

//   const setCredits = useStore((state) => state.setCredits);
//   const setUsedCredits = useStore((state) => state.setUsedCredits);
//   const credits = useStore((state) => state.credits);
//   const usedCredits = useStore((state) => state.usedCredits);

//   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
//   const [submissionStatus, setSubmissionStatus] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
//   const [requestId, setRequestId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
//   const [pollingIntervalId, setPollingIntervalId] = useState<number | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [topicValue, setTopicValue] = useState('');
//   const [documentFile, setDocumentFile] = useState<File | null>(null);

//   // Fetch user data and update credits
//   useEffect(() => {
//     if (user) {
//       getToken().then((token) => {
//         axios
//           .get('/api/user-data', {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           })
//           .then(({ data }) => {
//             setCredits(data.credits);
//             setUsedCredits(data.usedCredits);
//           })
//           .catch((error) => console.error('Error fetching user data:', error));
//       });
//     }
//   }, [user, getToken, setCredits, setUsedCredits]);

//   // Update credits after usage
//   const handleUpdateCredits = useCallback(
//     async (pointsUsed: number) => {
//       if (user) {
//         try {
//           await axios.patch('/api/update-credits', {
//             userId: user.id,
//             pointsUsed,
//           });

//           // Update local state after confirming server update
//           const updatedUsedCredits = (usedCredits || 0) + pointsUsed;
//           const updatedCredits = (credits || 0) - pointsUsed;

//           setUsedCredits(updatedUsedCredits);
//           setCredits(updatedCredits);
//         } catch (error) {
//           console.error('Error updating credits:', error);
//         }
//       }
//     },
//     [user, credits, usedCredits, setCredits, setUsedCredits]
//   );

//   // Define constants for validation at the top of your component or in a separate constants file
// const MAX_TOPIC_LENGTH = 100; // Maximum allowed length for the topic input
// const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum file size in bytes (5 MB)
// const ALLOWED_FILE_TYPES = [
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx MIME type
// ];

// // Updated handleTopicChange with validation
// const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const value = e.target.value;

//   // Check if the topic exceeds the maximum length
//   if (value.length > MAX_TOPIC_LENGTH) {
//     setSubmissionStatus('topic-too-long');
//     return;
//   }

//   // Clear any previous submission status
//   if (submissionStatus) {
//     setSubmissionStatus('');
//   }

//   setTopicValue(value);

//   // If the topic is not empty, clear the document file
//   if (value !== '') {
//     setDocumentFile(null);
//   }
// };

// // Updated handleFileChange with validation
// const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   if (e.target.files && e.target.files.length > 0) {
//     const file = e.target.files[0];

//     // Validate file size
//     if (file.size > MAX_FILE_SIZE) {
//       setSubmissionStatus('file-too-large');
//       return;
//     }

//     // Validate file type
//     if (!ALLOWED_FILE_TYPES.includes(file.type)) {
//       setSubmissionStatus('invalid-file-type');
//       return;
//     }

//     // Clear any previous submission status
//     if (submissionStatus) {
//       setSubmissionStatus('');
//     }

//     setDocumentFile(file);
//     setTopicValue('');
//   } else {
//     setDocumentFile(null);
//   }
// };

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
//   if (!selectedTemplate) {
//     setSubmissionStatus('templateRequired');
//     return;
//   }
  
//     if (credits === null || credits < 1) {
//       setShowInsufficientCreditsModal(true);
//       return;
//     }
  
//     setIsSubmitting(true);
//     setSubmissionStatus('');
  
//     try {
//       // Deduct one point
  
//       // Create a new File record
//       const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
//       const response = await axios.post('/api/files', {
//         userId: user.id,
//         fileName,
//         type: 'PRESENTATION',
//       });
  
//       const requestId = response.data.id;
//       setRequestId(requestId);
  
//       // Prepare data for the appropriate webhook
//       let data: any;
//       let headers: { [key: string]: string } = {};
//       let webhookUrl = '';
  
//       if (topicValue) {
//         // Topic-specific webhook
//         webhookUrl = 'https://hook.eu2.make.com/k5i7ogeqgl7jbgbd72xkbinx3x0ma3vq';

//         // webhookUrl = 'https://hook.eu2.make.com/qel93ksh54cigpbzj6wwgu65zg4k7x1y';
//         data = {
//           topic: topicValue,
//           templateId: selectedTemplate ? selectedTemplate.id : '',
//           categoryId: selectedTemplate ? selectedTemplate.category : '',
//           userId: user.id,
//           requestId,
//         };
//       } else if (documentFile) {
//         // File-specific webhook
//         webhookUrl = 'https://hook.eu2.make.com/8ckct7ngtgyhc4mqn95k6srh97yx2u8x';
//         data = new FormData();
//         data.append('document', documentFile);
//         data.append('templateId', selectedTemplate ? selectedTemplate.id : '');
//         data.append('categoryId', selectedTemplate ? selectedTemplate.category : '');
//         data.append('userId', user.id);
//         data.append('requestId', requestId);
//         headers['Content-Type'] = 'multipart/form-data';
//       }
  
//       // Send data to the appropriate webhook
//       await axios.post(webhookUrl, data, { headers });
  
//       setSubmissionStatus('success');
  
//       // Reset form fields
//       setTopicValue('');
//       setDocumentFile(null);
//       setSelectedTemplate(null);


  
//       // Start polling
//       startPolling(requestId);
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         if (!error.response) {
//           // Network error
//           setSubmissionStatus('network-error');
//         } else if (error.response.status >= 500) {
//           // Server error
//           setSubmissionStatus('server-error');
//         } else if (error.response.status >= 400) {
//           // Client error
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
//     }
//   };
    
//   const pollingIntervalIdRef = useRef<number | null>(null);


//   const startPolling = (requestId: number) => {
//     // Clear any existing interval before starting a new one
//     if (pollingIntervalIdRef.current) {
//       clearInterval(pollingIntervalIdRef.current);
//     }

//     setIsLoading(true);
  
//     const intervalId = window.setInterval(async () => {
//       try {
//         const res = await axios.get('/api/getfilemake', {
//           params: { requestId },
//         });

//         if (res.data && res.data.status === 'COMPLETED') {
//           setIsLoading(false);

//           console.log('Download URL:', res.data.downloadUrl);

//           setDownloadUrl(res.data.downloadUrl);

//           await handleUpdateCredits(15);


//           // Clear the interval
//           if (pollingIntervalIdRef.current) {
//             clearInterval(pollingIntervalIdRef.current);
//             pollingIntervalIdRef.current = null;
//           }
//         } else if (res.data.status === 'FAILED') {
//           setIsLoading(false);
//           setSubmissionStatus('error');

//           // Clear the interval
//           if (pollingIntervalIdRef.current) {
//             clearInterval(pollingIntervalIdRef.current);
//             pollingIntervalIdRef.current = null;
//           }
//         }
//       } catch (error) {
//         console.error('Error checking status:', error);
//       }
//     }, 5000); // Poll every 5 seconds

//     pollingIntervalIdRef.current = intervalId;
//   };

//   // Clean up polling on unmount
//   useEffect(() => {
//     return () => {
//       if (pollingIntervalIdRef.current) {
//         clearInterval(pollingIntervalIdRef.current);
//       }
//     };
//   }, []);

//   const handleSubmissionStatus = (status: string) => {
//     switch (status) {
//       case 'success':
//         toast.success(
//           <div className="flex text-xl justify-between items-center">
//             <span>تم الإرسال بنجاح!</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-8 text-green-800 hover:text-green-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#D4EDDA', // Success green background
//               color: '#155724', // Success text color
//               border: '1px solid #C3E6CB', // Success border color
//             },
//             icon: <FiCheckCircle color="#155724" size={24} />,
//           }
//         );
//         break;
  
//       case 'error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ أثناء الإرسال.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;
  
//       case 'empty':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>الرجاء إدخال الموضوع أو اختيار ملف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;
  
//       case 'templateRequired':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>يرجى اختيار قالب قبل الإرسال.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;
  
//       case 'network-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ في الشبكة. يرجى التحقق من اتصالك.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;
  
//       case 'server-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;
  
//       case 'client-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>فشل الإرسال بسبب إدخال غير صالح.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;
  
//       case 'unexpected-error':
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ غير متوقع.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;
  
//       case 'topic-too-long':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>الموضوع طويل جدًا. يرجى تحديده بـ 100 حرف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;
  
//       case 'file-too-large':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>الملف كبير جدًا. الحجم الأقصى هو 5 ميجابايت.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;
  
//       case 'invalid-file-type':
//         toast.warning(
//           <div className="flex text-[18px] justify-between items-center">
//             <span>نوع الملف غير صالح. يرجى تحميل ملف .docx.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-20 text-yellow-800 hover:text-yellow-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#FFF3CD', // Warning yellow background
//               color: '#856404', // Warning text color
//               border: '1px solid #FFEEBA', // Warning border color
//             },
//             icon: <FiInfo color="#856404" size={24} />,
//           }
//         );
//         break;
  
//       default:
//         toast.error(
//           <div className="flex justify-between items-center">
//             <span>حدث خطأ غير معروف.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-red-800 hover:text-red-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 30000,
//             style: {
//               backgroundColor: '#F8D7DA', // Error red background
//               color: '#721C24', // Error text color
//               border: '1px solid #F5C6CB', // Error border color
//             },
//             icon: <FiAlertCircle color="#721C24" size={24} />,
//           }
//         );
//         break;
//     }
//   };
  
//   // Call this function when `submissionStatus` changes
//   useEffect(() => {
//     if (submissionStatus) {
//       handleSubmissionStatus(submissionStatus);
//     }
//   }, [submissionStatus]);

//   return (
//     <>
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

//             {submissionStatus || isLoading || downloadUrl ? (
//   <div className="rounded-lg pb-4 mb-4 p-4">
    
//     {/* Loading and Download */}
//     {isLoading && (
//       <div className="w-full flex flex-col items-center mt-4">
//       {/* Loading spinner */}
//       <div className="flex items-center justify-center">
//       <Loading />

//         {/* <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500 border-solid"></div> */}
//       </div>
      
//       {/* Text below the spinner */}
//       <div className="w-full flex justify-center p-4 mt-4 text-gray-400 text-center">
//         .....يتم تجهيز ملف العرض الرجاء الانتظار قليلاً
//       </div>
    
//       {/* Horizontal line */}
//       <div className="w-1/2 border-t border-gray-300 mt-2"></div>
//     </div>
    
     
     
//     )}
//     {downloadUrl ? (
//       <div className="w-full flex justify-center mt-4">
//         <a
//           href={downloadUrl}
//           className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           تحميل الملف
//         </a>
//       </div>
//     ) : (
//       <div className="text-gray-500 mt-4 text-center"></div>
//     )}
//   </div>
// ) : null}

//             <CardContent>
//               <form onSubmit={handleSubmit}>
//                 <div className="flex m-auto w-5/6 flex-col lg:flex-row justify-between">
//                   {/* Topic Field */}
//                   <div className="mb-4 flex-1 lg:mr-2">
//                     <input
//                       type="text"
//                       name="topic"
//                       id="topic"
//                       placeholder="ادخل الموضوع"
//                       value={topicValue}
//                       onChange={handleTopicChange}
//                       disabled={documentFile !== null}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>
//                   <div className="flex justify-center px-4 text-xl py-2"> أو </div>

//                   {/* File Field */}
//                   <div className="mb-4 flex-1 lg:ml-2">
//                     <input
//                       type="file"
//                       name="document"
//                       id="document"
//                       accept=".docx"
//                       onChange={handleFileChange}
//                       disabled={topicValue !== ''}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>
//                 </div>

//                 {/* Template Selection */}
//                 <div className="mb-4 flex justify-center">
//                   <button
//                     type="button"
//                     onClick={() => setIsModalOpen(true)}
//                     className="md:w-1/4 bg-gray-200 text-gray-800  py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//                   >
//                     {selectedTemplate
//                       ? `تم اختيار القالب: ${selectedTemplate.name}`
//                       : 'اختر القالب'}
//                   </button>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex justify-center">
//                   <button
//                     type="submit"
//                     className="md:w-1/4 center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
//                   </button>
//                 </div>
//               </form>

             
//             </CardContent>
//           </Card>
//         </div>

//         {/* Template Modal */}
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













 // <div className="w-full flex justify-center mt-4">
        // <Loading />
        
      //   <div className="w-full flex justify-center p-4 mt-4">
      //     يتم تجهيز ملف العرض الرجاء الانتظار قليلاً
      //   </div>
      // </div>

//   const handleSubmissionStatus = (status: string) => {

//     if (status === 'success') {
//       toast.success(
//         <div className="flex text-xl justify-between items-center">
//           <span>تم الإرسال بنجاح!</span>
//           <button
//             onClick={() => toast.dismiss()}
//             className="mr-8 text-green-800 hover:text-green-900"
//           >
//             X
//           </button>
//         </div>,
//         {
//           position: 'top-center',
//           duration: 30000,
//           style: {
//             backgroundColor: '#D4EDDA', // Success green background
//             color: '#155724', // Success text color
//             border: '1px solid #C3E6CB', // Success border color
//           },
//           icon: <FiCheckCircle color="#155724" size={24} />,
//         }
//       );
//     } else if (status === 'error') {
//       toast.error(
//         <div className="flex justify-between items-center">
//           <span>حدث خطأ أثناء الإرسال.</span>
//           <button
//             onClick={() => toast.dismiss()}
//             className="ml-4 text-red-800 hover:text-red-900"
//           >
//         X
//           </button>
//         </div>,
//         {
//           position: 'top-center',
//           duration: 30000,
//           style: {
//             backgroundColor: '#F8D7DA', // Error red background
//             color: '#721C24', // Error text color
//             border: '1px solid #F5C6CB', // Error border color
//           },
//           icon: <FiAlertCircle color="#721C24" size={24} />,
//         }
//       );
//     } else if (status === 'empty') {
//       toast.warning(
//         <div className="flex text-[18px] justify-between items-center">
//           <span>الرجاء إدخال الموضوع أو اختيار ملف.</span>
//           <button
//             onClick={() => toast.dismiss()}
//             className=" mr-20 text-yellow-800 hover:text-yellow-900"
//           >
//            X
//           </button>
//         </div>,
//         {
//           position: 'top-center',
//           duration: 30000,
//           style: {
//             backgroundColor: '#FFF3CD', // Warning yellow background
//             color: '#856404', // Warning text color
//             border: '1px solid #FFEEBA', // Warning border color
//           },
//           icon: <FiInfo color="#856404" size={24} />,
//         }
//       );
//     } else if (status === 'templateRequired') {
//     toast.warning(
//       <div className="flex text-[18px] justify-between items-center">
//         <span>يرجى اختيار قالب قبل الإرسال.</span>
//         <button
//           onClick={() => toast.dismiss()}
//           className=" mr-20 text-yellow-800 hover:text-yellow-900"
//         >
//           X
//         </button>
//       </div>,
//       {
//         position: 'top-center',
//         duration: 30000,
//         style: {
//           backgroundColor: '#FFF3CD', // Warning yellow background
//           color: '#856404', // Warning text color
//           border: '1px solid #FFEEBA', // Warning border color
//         },
//         icon: <FiInfo color="#856404" size={24} />,
//       }
//     );
//   }
// };

  // const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setTopicValue(e.target.value);
  //   if (e.target.value !== '') {
  //     setDocumentFile(null);
  //   }
  // };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     setDocumentFile(e.target.files[0]);
  //     setTopicValue('');
  //   } else {
  //     setDocumentFile(null);
  //   }
  // };


  //   if (status === 'success') {
  //     toast.success('تم الإرسال بنجاح!', {
  //       position: 'top-center',
  //       duration: Infinity,
  //       style: {
  //         backgroundColor: '#D4EDDA', // Success green background
  //         color: '#155724', // Success text color
  //         border: '1px solid #C3E6CB', // Success border color
  //       },
  //       icon: <FiCheckCircle color="#155724" size={24} />, // Success icon
  //       action: {
  //         text: 'إغلاق',
  //         onClick: () => toast.dismiss(),
  //       },
  //     });
  //   } else if (status === 'error') {
  //     toast.error('حدث خطأ أثناء الإرسال.', {
  //       position: 'top-center',
  //       duration: Infinity,
  //       style: {
  //         backgroundColor: '#F8D7DA', // Error red background
  //         color: '#721C24', // Error text color
  //         border: '1px solid #F5C6CB', // Error border color
  //       },
  //       icon: <FiAlertCircle color="#721C24" size={24} />, // Error icon
  //       action: {
  //         text: 'إغلاق',
  //         onClick: () => toast.dismiss(),
  //       },
  //     });
  //   } else if (status === 'empty') {
  //     toast.warning('الرجاء إدخال الموضوع أو اختيار ملف.', {
  //       position: 'top-center',
  //       duration: Infinity,
  //       style: {
  //         backgroundColor: '#FFF3CD', // Warning yellow background
  //         color: '#856404', // Warning text color
  //         border: '1px solid #FFEEBA', // Warning border color
  //       },
  //       icon: <FiInfo color="#856404" size={24} />, // Warning icon
  //       action: {
  //         text: 'إغلاق',
  //         onClick: () => toast.dismiss(),
  //       },
  //     });
  //   }
  // };
  //   if (status === 'success') {
  //     toast.success('تم الإرسال بنجاح!');
  //   } else if (status === 'error') {
  //     toast.error('حدث خطأ أثناء الإرسال.');
  //   } else if (status === 'empty') {
  //     toast.warning('الرجاء إدخال الموضوع أو اختيار ملف.');
  //   }
  // };


// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { useStore } from '@/store/useStore';
// import Modal from '@/components/custom/ocrModal';
// import Loading from '@/components/global/loading';
// import { Card, CardHeader, CardContent } from '@/components/ui/card';
// import TemplateModal from './TemplateModal';

// import { toast } from 'sonner';


// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   category: string; // Add this line
// }


// const CreatePresentation: React.FC = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const { getToken } = useAuth();

//   const setCredits = useStore((state) => state.setCredits);
//   const setUsedCredits = useStore((state) => state.setUsedCredits);
//   const credits = useStore((state) => state.credits);
//   const usedCredits = useStore((state) => state.usedCredits);

//   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
//   const [submissionStatus, setSubmissionStatus] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
//   const [requestId, setRequestId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
//   const [pollingIntervalId, setPollingIntervalId] = useState<number | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [topicValue, setTopicValue] = useState('');
//   const [documentFile, setDocumentFile] = useState<File | null>(null);





//   // Fetch user data and update credits
//   useEffect(() => {
//     if (user) {
//       getToken().then((token) => {
//         axios
//           .get('/api/user-data', {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           })
//           .then(({ data }) => {
//             setCredits(data.credits);
//             setUsedCredits(data.usedCredits);
//           })
//           .catch((error) => console.error('Error fetching user data:', error));
//       });
//     }
//   }, [user, getToken, setCredits, setUsedCredits]);

//   // Update credits after usage
//   const handleUpdateCredits = useCallback(
//     async (pointsUsed: number) => {
//       if (user) {
//         try {
//           await axios.patch('/api/update-credits', {
//             userId: user.id,
//             pointsUsed,
//           });

//           // Update local state after confirming server update
//           const updatedUsedCredits = (usedCredits || 0) + pointsUsed;
//           const updatedCredits = (credits || 0) - pointsUsed;

//           setUsedCredits(updatedUsedCredits);
//           setCredits(updatedCredits);
//         } catch (error) {
//           console.error('Error updating credits:', error);
//         }
//       }
//     },
//     [user, credits, usedCredits, setCredits, setUsedCredits]
//   );

//   const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setTopicValue(e.target.value);
//     if (e.target.value !== '') {
//       setDocumentFile(null);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setDocumentFile(e.target.files[0]);
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
  
//     if (credits === null || credits < 1) {
//       setShowInsufficientCreditsModal(true);
//       return;
//     }
  
//     setIsSubmitting(true);
//     setSubmissionStatus('');
  
//     try {
//       // Deduct one point
//       await handleUpdateCredits(1);
  
//       // Create a new File record
//       const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
//       const response = await axios.post('/api/files', {
//         userId: user.id,
//         fileName,
//         type: 'PRESENTATION',
//       });
  
//       const requestId = response.data.id;
//       setRequestId(requestId);
  
//       // Prepare data for the appropriate webhook
//       let data: any;
//       let headers: { [key: string]: string } = {};
//       let webhookUrl = '';
  
//       if (topicValue) {
//         // Topic-specific webhook
//         webhookUrl = 'https://hook.eu2.make.com/k5i7ogeqgl7jbgbd72xkbinx3x0ma3vq';
//         data = {
//           topic: topicValue,
//           templateId: selectedTemplate ? selectedTemplate.id : '',
//           categoryId: selectedTemplate ? selectedTemplate.category : '',
//           userId: user.id,
//           requestId,
//         };
//       } else if (documentFile) {
//         // File-specific webhook
//         webhookUrl = 'https://hook.eu2.make.com/8ckct7ngtgyhc4mqn95k6srh97yx2u8x';
//         data = new FormData();
//         data.append('document', documentFile);
//         data.append('templateId', selectedTemplate ? selectedTemplate.id : '');
//         data.append('categoryId', selectedTemplate ? selectedTemplate.category : '');
//         data.append('userId', user.id);
//         data.append('requestId', requestId);
//         headers['Content-Type'] = 'multipart/form-data';
//       }
  
//       // Send data to the appropriate webhook
//       await axios.post(webhookUrl, data, { headers });
  
//       setSubmissionStatus('success');
  
//       // Reset form fields
//       setTopicValue('');
//       setDocumentFile(null);
//       setSelectedTemplate(null);
  
//       // Start polling
//       startPolling(requestId);
//     } catch (error) {
//       console.error('Error submitting form:', error);
//       setSubmissionStatus('error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
  

//   // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//   //   e.preventDefault();
  
//   //   if (!user) {
//   //     router.push('/sign-in');
//   //     return;
//   //   }
  
//   //   // Ensure at least one field is filled
//   //   if (!topicValue && !documentFile) {
//   //     setSubmissionStatus('empty');
//   //     return;
//   //   }
  
//   //   if (credits === null || credits < 1) {
//   //     setShowInsufficientCreditsModal(true);
//   //     return;
//   //   }
  
//   //   setIsSubmitting(true);
//   //   setSubmissionStatus('');
  
//   //   try {
//   //     // Deduct one point
//   //     await handleUpdateCredits(1);
  
//   //     // Create a new File record
//   //     const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
//   //     const response = await axios.post('/api/files', {
//   //       userId: user.id,
//   //       fileName,
//   //       type: 'PRESENTATION',
//   //     });
  
//   //     const requestId = response.data.id;
//   //     setRequestId(requestId);
  
//   //     // Prepare data for the webhook
//   //     let data: any;
//   //     let headers: { [key: string]: string } = {};
  
//   //     if (topicValue) {
//   //       data = {
//   //         topic: topicValue,
//   //         templateId: selectedTemplate ? selectedTemplate.id : '',
//   //         categoryId: selectedTemplate ? selectedTemplate.category : '',
//   //         userId: user.id,
//   //         requestId,
//   //       };
//   //     } else if (documentFile) {
//   //       data = new FormData();
//   //       data.append('document', documentFile);
//   //       data.append('templateId', selectedTemplate ? selectedTemplate.id : '');
//   //       data.append('categoryId', selectedTemplate ? selectedTemplate.category : '');
//   //       data.append('userId', user.id);
//   //       data.append('requestId', requestId);
//   //       headers['Content-Type'] = 'multipart/form-data';
//   //     }
  
//   //     // Send data to the webhook
//   //     await axios.post(
//   //       'https://hook.eu2.make.com/8ckct7ngtgyhc4mqn95k6srh97yx2u8x',
//   // data,
//   //       { headers }
//   //     );
  
//   //     setSubmissionStatus('success');
  
//   //     // Reset form fields
//   //     setTopicValue('');
//   //     setDocumentFile(null);
//   //     setSelectedTemplate(null);
  
//   //     // Start polling
//   //     startPolling(requestId);
//   //   } catch (error) {
//   //     console.error('Error submitting form:', error);
//   //     setSubmissionStatus('error');
//   //   } finally {
//   //     setIsSubmitting(false);
//   //   }
//   // };



//   const startPolling = (requestId: number) => {
//     setIsLoading(true);
  
//     const intervalId = window.setInterval(async () => {
//       try {
//         const res = await axios.get('/api/getfilemake', {
//           params: { requestId },
//         });
  
//         if (res.data && res.data.status === 'COMPLETED') {
//           setIsLoading(false);
//           setDownloadUrl(res.data.downloadUrl);
//           if (pollingIntervalId) {
//             clearInterval(pollingIntervalId);
//             setPollingIntervalId(null);
//           }
//         } else if (res.data.status === 'FAILED') {
//           setIsLoading(false);
//           setSubmissionStatus('error');
//           if (pollingIntervalId) {
//             clearInterval(pollingIntervalId);
//             setPollingIntervalId(null);
//           }
//         }
//       } catch (error) {
//         console.error('Error checking status:', error);
//       }
//     }, 5000); // Poll every 5 seconds
  
//     setPollingIntervalId(intervalId);
//   };
  
//   // Clean up polling on unmount
//   useEffect(() => {
//     return () => {
//       if (pollingIntervalId) {
//         clearInterval(pollingIntervalId);
//       }
//     };
//   }, [pollingIntervalId]);

//   const handleSubmissionStatus = (status: string) => {
//     if (status === 'success') {
//       toast.success('تم الإرسال بنجاح!');
//     } else if (status === 'error') {
//       toast.error('حدث خطأ أثناء الإرسال.');
//     } else if (status === 'empty') {
//       toast.warning('الرجاء إدخال الموضوع أو اختيار ملف.');
//     }
//   };

//   // Call this function when `submissionStatus` changes
//   useEffect(() => {
//     if (submissionStatus) {
//       handleSubmissionStatus(submissionStatus);
//     }
//   }, [submissionStatus]);

//   return (
//     <>
//       {/* Modals */}
//       <Modal
//         isOpen={showInsufficientCreditsModal}
//         onClose={() => setShowInsufficientCreditsModal(false)}
//         title="رصيدك غير كافٍ"
//         message="ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى ترقية خطتك."
//         actionText="ترقية الخطة"
//         actionLink="/pricing"
//       />

//       <div className="max-w-6xl mx-auto bg-gray-100 rounded-lg shadow-lg p-6">
//         <div className="flex flex-col items-center text-xl justify-center text-slate-900 pb-6 gap-4">
//           <h1>بوربوينت بالذكاء الصناعي</h1>
//         </div>
//         <div className="flex flex-col items-center justify-center text-slate-600 pb-6 gap-4">
//           <p>
//             اكتب الموضوع أو حمل ملف وورد ثم اختر القالب لإنشاء بوربوينت بالذكاء الصناعي قابل للتعديل
//           </p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-2">
//           <Card>
//             <CardHeader></CardHeader>

//             {submissionStatus || isLoading || downloadUrl ? (
//   <div className="rounded-lg pb-8 mb-8 p-6">
    
//     {/* Loading and Download */}
//     {isLoading && (
//       <div className="w-full flex justify-center mt-4">
//         <Loading />
//       </div>
//     )}
//     {downloadUrl ? (
//       <div className="w-full flex justify-center mt-4">
//         <a
//           href={downloadUrl}
//           className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           تحميل الملف
//         </a>
//       </div>
//     ) : (
//       <div className="text-gray-500 mt-4 text-center"></div>
//     )}
//   </div>
// ) : null}

//             <CardContent>
//               <form onSubmit={handleSubmit}>
//                 <div className="flex flex-col lg:flex-row justify-between">
//                   {/* Topic Field */}
//                   <div className="mb-4 flex-1 lg:mr-2">
//                     <input
//                       type="text"
//                       name="topic"
//                       id="topic"
//                       placeholder="ادخل الموضوع"
//                       value={topicValue}
//                       onChange={handleTopicChange}
//                       disabled={documentFile !== null}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>

//                   {/* File Field */}
//                   <div className="mb-4 flex-1 lg:ml-2">
//                     <input
//                       type="file"
//                       name="document"
//                       id="document"
//                       accept=".docx"
//                       onChange={handleFileChange}
//                       disabled={topicValue !== ''}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>
//                 </div>

//                 {/* Template Selection */}
//                 <div className="mb-4">
//                   <button
//                     type="button"
//                     onClick={() => setIsModalOpen(true)}
//                     className="w-full bg-gray-200 text-gray-800  py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//                   >
//                     {selectedTemplate
//                       ? `تم اختيار القالب: ${selectedTemplate.name}`
//                       : 'اختر القالب'}
//                   </button>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex items-center justify-between">
//                   <button
//                     type="submit"
//                     className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
//                   </button>
//                 </div>
//               </form>

             
//             </CardContent>
//           </Card>
//         </div>

//         {/* Template Modal */}
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




// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { useStore } from '@/store/useStore';
// import Modal from '@/components/custom/ocrModal';
// import Loading from '@/components/global/loading';
// import { Card, CardHeader, CardContent } from '@/components/ui/card';
// import TemplateModal from './TemplateModal';



// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   category: string; // Add this line
// }


// const CreatePresentation: React.FC = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const { getToken } = useAuth();

//   const setCredits = useStore((state) => state.setCredits);
//   const setUsedCredits = useStore((state) => state.setUsedCredits);
//   const credits = useStore((state) => state.credits);
//   const usedCredits = useStore((state) => state.usedCredits);

//   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
//   const [submissionStatus, setSubmissionStatus] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
//   const [requestId, setRequestId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
//   const [pollingIntervalId, setPollingIntervalId] = useState<number | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [topicValue, setTopicValue] = useState('');
//   const [documentFile, setDocumentFile] = useState<File | null>(null);

//   useEffect(() => {
//     const fetchFile = async () => {
//       try {
//         const res = await axios.get('/api/getfilemake'); // Ensure this matches your server route
//         if (res.data && res.data.downloadUrl) {
//           setDownloadUrl(res.data.downloadUrl);
//         }
//       } catch (error) {
//         console.error('Error fetching file:', error);
//       }
//     };
  
//     fetchFile();
//   }, []);
  


//   // Fetch user data and update credits
//   useEffect(() => {
//     if (user) {
//       getToken().then((token) => {
//         axios
//           .get('/api/user-data', {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           })
//           .then(({ data }) => {
//             setCredits(data.credits);
//             setUsedCredits(data.usedCredits);
//           })
//           .catch((error) => console.error('Error fetching user data:', error));
//       });
//     }
//   }, [user, getToken, setCredits, setUsedCredits]);

//   // Update credits after usage
//   const handleUpdateCredits = useCallback(
//     async (pointsUsed: number) => {
//       if (user) {
//         try {
//           await axios.patch('/api/update-credits', {
//             userId: user.id,
//             pointsUsed,
//           });

//           // Update local state after confirming server update
//           const updatedUsedCredits = (usedCredits || 0) + pointsUsed;
//           const updatedCredits = (credits || 0) - pointsUsed;

//           setUsedCredits(updatedUsedCredits);
//           setCredits(updatedCredits);
//         } catch (error) {
//           console.error('Error updating credits:', error);
//         }
//       }
//     },
//     [user, credits, usedCredits, setCredits, setUsedCredits]
//   );

//   const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setTopicValue(e.target.value);
//     if (e.target.value !== '') {
//       setDocumentFile(null);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setDocumentFile(e.target.files[0]);
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
  
//     if (credits === null || credits < 1) {
//       setShowInsufficientCreditsModal(true);
//       return;
//     }
  
//     setIsSubmitting(true);
//     setSubmissionStatus('');
  
//     try {
//       // Deduct one point
//       await handleUpdateCredits(1);
  
//       // Create a new File record
//       const fileName = documentFile ? documentFile.name : `Topic - ${topicValue}`;
//       const response = await axios.post('/api/files', {
//         userId: user.id,
//         fileName,
//         type: 'PRESENTATION',
//       });
  
//       const requestId = response.data.id;
//       setRequestId(requestId);
  
//       // Prepare data for the webhook
//       let data: any;
//       let headers: { [key: string]: string } = {};
  
//       if (topicValue) {
//         data = {
//           topic: topicValue,
//           templateId: selectedTemplate ? selectedTemplate.id : '',
//           categoryId: selectedTemplate ? selectedTemplate.category : '',
//           userId: user.id,
//           requestId,
//         };
//       } else if (documentFile) {
//         data = new FormData();
//         data.append('document', documentFile);
//         data.append('templateId', selectedTemplate ? selectedTemplate.id : '');
//         data.append('categoryId', selectedTemplate ? selectedTemplate.category : '');
//         data.append('userId', user.id);
//         data.append('requestId', requestId);
//         headers['Content-Type'] = 'multipart/form-data';
//       }
  
//       // Send data to the webhook
//       await axios.post(
//         'https://hook.eu2.make.com/8ckct7ngtgyhc4mqn95k6srh97yx2u8x',
//   data,
//         { headers }
//       );
  
//       setSubmissionStatus('success');
  
//       // Reset form fields
//       setTopicValue('');
//       setDocumentFile(null);
//       setSelectedTemplate(null);
  
//       // Start polling
//       startPolling(requestId);
//     } catch (error) {
//       console.error('Error submitting form:', error);
//       setSubmissionStatus('error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
  


//   // // Handle form submission
//   // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//   //   e.preventDefault();

//   //   if (!user) {
//   //     router.push('/sign-in');
//   //     return;
//   //   }

//   //   // Ensure at least one field is filled
//   //   if (!topicValue && !documentFile) {
//   //     setSubmissionStatus('empty');
//   //     return;
//   //   }

//   //   if (credits === null || credits < 1) {
//   //     setShowInsufficientCreditsModal(true);
//   //     return;
//   //   }

//   //   setIsSubmitting(true);
//   //   setSubmissionStatus('');

//   //   try {
//   //     // Deduct one point
//   //     await handleUpdateCredits(1);

//   //     let data: any;
//   //     let headers: { [key: string]: string } = {};

//   //     if (topicValue) {
//   //       data = {
//   //         topic: topicValue,
//   //         templateId: selectedTemplate ? selectedTemplate.id : '',
//   //         categoryId: selectedTemplate ? selectedTemplate.category : '', // Add this line

//   //         userId: user.id,
//   //       };
//   //     } else if (documentFile) {
//   //       data = new FormData();
//   //       data.append('document', documentFile);
//   //       data.append('templateId', selectedTemplate ? selectedTemplate.id : '');
//   //       data.append('categoryId', selectedTemplate ? selectedTemplate.category : ''); // Added line
//   //       data.append('userId', user.id);
//   //       headers['Content-Type'] = 'multipart/form-data';
//   //     }

//   //     // Send data to the webhook
//   //     const res = await axios.post(
//   //       'https://hook.eu2.make.com/8ckct7ngtgyhc4mqn95k6srh97yx2u8x',
//   //       data,
//   //       { headers }
//   //     );


//   //     // https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o

//   //     const requestId = res.data.requestId; // Assuming the webhook returns requestId
//   //     setRequestId(requestId);

//   //     setSubmissionStatus('success');
//   //     // Reset form
//   //     setTopicValue('');
//   //     setDocumentFile(null);
//   //     setSelectedTemplate(null);

//   //     // Start polling to check if the file is ready
//   //     startPolling(requestId);
//   //   } catch (error) {
//   //     console.error('Error submitting form:', error);
//   //     setSubmissionStatus('error');
//   //   } finally {
//   //     setIsSubmitting(false);
//   //   }
//   // };


//   const startPolling = (requestId: number) => {
//     setIsLoading(true);
  
//     const intervalId = window.setInterval(async () => {
//       try {
//         const res = await axios.get('/api/getfilemake', {
//           params: { requestId },
//         });
  
//         if (res.data && res.data.status === 'COMPLETED') {
//           setIsLoading(false);
//           setDownloadUrl(res.data.downloadUrl);
//           if (pollingIntervalId) {
//             clearInterval(pollingIntervalId);
//             setPollingIntervalId(null);
//           }
//         } else if (res.data.status === 'FAILED') {
//           setIsLoading(false);
//           setSubmissionStatus('error');
//           if (pollingIntervalId) {
//             clearInterval(pollingIntervalId);
//             setPollingIntervalId(null);
//           }
//         }
//       } catch (error) {
//         console.error('Error checking status:', error);
//       }
//     }, 5000); // Poll every 5 seconds
  
//     setPollingIntervalId(intervalId);
//   };
  


//   // // Polling function
//   // const startPolling = (requestId: string) => {
//   //   setIsLoading(true);

//   //   const intervalId = window.setInterval(async () => {
//   //     try {
//   //       const res = await axios.get('/api/getfilemake');

//   //       if (res.data && res.data.status === 'COMPLETED') {
//   //         setIsLoading(false);
//   //         setDownloadUrl(res.data.downloadUrl);
//   //         if (pollingIntervalId) {
//   //           clearInterval(pollingIntervalId);
//   //           setPollingIntervalId(null);
//   //         }
//   //       }
//   //     } catch (error) {
//   //       console.error('Error checking status:', error);
//   //     }
//   //   }, 5000); // Poll every 5 seconds

//   //   setPollingIntervalId(intervalId);
//   // };

//   // Clean up polling on unmount
//   useEffect(() => {
//     return () => {
//       if (pollingIntervalId) {
//         clearInterval(pollingIntervalId);
//       }
//     };
//   }, [pollingIntervalId]);

//   return (
//     <>
//       {/* Modals */}
//       <Modal
//         isOpen={showInsufficientCreditsModal}
//         onClose={() => setShowInsufficientCreditsModal(false)}
//         title="رصيدك غير كافٍ"
//         message="ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى ترقية خطتك."
//         actionText="ترقية الخطة"
//         actionLink="/pricing"
//       />

//       <div className="max-w-6xl mx-auto bg-gray-100 rounded-lg shadow-lg p-6">
//         <div className="flex flex-col items-center text-xl justify-center text-slate-900 pb-6 gap-4">
//           <h1>بوربوينت بالذكاء الصناعي</h1>
//         </div>
//         <div className="flex flex-col items-center justify-center text-slate-600 pb-6 gap-4">
//           <p>
//             اكتب الموضوع أو حمل ملف وورد ثم اختر القالب لإنشاء بوربوينت بالذكاء الصناعي قابل للتعديل
//           </p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-2">
//           <Card>
//             <CardHeader></CardHeader>
//              {/* Submission Status Messages */}
//              <div className="bg-gray-50 rounded-lg shadow pb-8 mb-8 p-6">
//              {submissionStatus === 'success' && (
//                 <p className="text-green-500 mt-4">تم الإرسال بنجاح!</p>
//               )}
//               {submissionStatus === 'error' && (
//                 <p className="text-red-500 mt-4">حدث خطأ أثناء الإرسال.</p>
//               )}
//               {submissionStatus === 'empty' && (
//                 <p className="text-yellow-500 mt-4">الرجاء إدخال الموضوع أو اختيار ملف.</p>
//               )}
//              {/* Loading and Download */}
//         {isLoading && (
//           <div className="w-full flex justify-center mt-4">
//             <Loading />
//           </div>
//         )}

// {downloadUrl ? (
//   <div className="w-full flex justify-center mt-4">
//     <a
//       href={downloadUrl}
//       className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//       target="_blank"
//       rel="noopener noreferrer"
//     >
//       تحميل الملف
//     </a>
//   </div>
// ) : (
//   <div className="text-gray-500 mt-4 text-center">
//     لم يتم تجهيز الملف بعد. الرجاء الانتظار.
//   </div>
// )}
// </div>
//             <CardContent>
//               <form onSubmit={handleSubmit}>
//                 <div className="flex flex-col lg:flex-row justify-between">
//                   {/* Topic Field */}
//                   <div className="mb-4 flex-1 lg:mr-2">
//                     <input
//                       type="text"
//                       name="topic"
//                       id="topic"
//                       placeholder="ادخل الموضوع"
//                       value={topicValue}
//                       onChange={handleTopicChange}
//                       disabled={documentFile !== null}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>

//                   {/* File Field */}
//                   <div className="mb-4 flex-1 lg:ml-2">
//                     <input
//                       type="file"
//                       name="document"
//                       id="document"
//                       accept=".docx"
//                       onChange={handleFileChange}
//                       disabled={topicValue !== ''}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>
//                 </div>

//                 {/* Template Selection */}
//                 <div className="mb-4">
//                   <button
//                     type="button"
//                     onClick={() => setIsModalOpen(true)}
//                     className="w-1/4 bg-gray-200 text-gray-800  py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//                   >
//                     {selectedTemplate
//                       ? `تم اختيار القالب: ${selectedTemplate.name}`
//                       : 'اختر القالب'}
//                   </button>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex items-center justify-between">
//                   <button
//                     type="submit"
//                     className="w-1/4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
//                   </button>
//                 </div>
//               </form>

             
//             </CardContent>
//           </Card>
//         </div>

       

// {/* 
//         {downloadUrl && (
//           <div className="w-full flex justify-center mt-4">
//             <a
//               href={downloadUrl}
//               className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//             >
//               تحميل الملف
//             </a>
//           </div>
//         )} */}

//         {/* Template Modal */}
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








// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { useStore } from '@/store/useStore';
// import Modal from '@/components/custom/ocrModal';
// import Loading from '@/components/global/loading';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import TemplateModal from './TemplateModal';


// type Template = {
//   id: string;
//   name: string;
// };

// const CreatePresentation: React.FC = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const { getToken } = useAuth();

//   const setCredits = useStore((state) => state.setCredits);
//   const setUsedCredits = useStore((state) => state.setUsedCredits);
//   const credits = useStore((state) => state.credits);
//   const usedCredits = useStore((state) => state.usedCredits);

//   // const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

//   const [submissionStatus, setSubmissionStatus] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
//   const [requestId, setRequestId] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [downloadUrl, setDownloadUrl] = useState(null);
//   const [pollingIntervalId, setPollingIntervalId] = useState(null);

//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const [topicValue, setTopicValue] = useState('');
//   const [documentFile, setDocumentFile] = useState(null);

//   // جلب بيانات المستخدم وتحديث الرصيد
//   useEffect(() => {
//     if (user) {
//       getToken().then((token) => {
//         axios
//           .get('/api/user-data', {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           })
//           .then(({ data }) => {
//             setCredits(data.credits);
//             setUsedCredits(data.usedCredits);
//           })
//           .catch((error) => console.error('Error fetching user data:', error));
//       });
//     }
//   }, [user, getToken, setCredits, setUsedCredits]);

//   // تحديث الرصيد بعد الاستخدام
//   const handleUpdateCredits = useCallback(
//     async (pointsUsed: number) => {
//       if (user) {
//         try {
//           await axios.patch('/api/update-credits', {
//             userId: user.id,
//             pointsUsed,
//           });

//           // تحديث الحالة المحلية بعد تأكيد التحديث من الخادم
//           const updatedUsedCredits = (usedCredits || 0) + pointsUsed;
//           const updatedCredits = (credits || 0) - pointsUsed;

//           setUsedCredits(updatedUsedCredits);
//           setCredits(updatedCredits);
//         } catch (error) {
//           console.error('Error updating credits:', error);
//         }
//       }
//     },
//     [user, credits, usedCredits, setCredits, setUsedCredits]
//   );

//   const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setTopicValue(e.target.value);
//     if (e.target.value !== '') {
//       setDocumentFile(null);
//     }
//   };
  
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setDocumentFile(e.target.files[0]);
//       setTopicValue('');
//     } else {
//       setDocumentFile(null);
//     }
//   };
  

//   // إرسال النموذج
//   const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     e.preventDefault();

//     if (!user) {
//       router.push('/sign-in');
//       return;
//     }

//     // التحقق من أن أحد الحقول على الأقل تم ملؤه
//     if (!topicValue && !documentFile) {
//       setSubmissionStatus('empty');
//       return;
//     }

//     if (credits === null || credits < 1) {
//       setShowInsufficientCreditsModal(true);
//       return;
//     }

//     setIsSubmitting(true);
//     setSubmissionStatus('');

//     try {
//       // خصم نقطة واحدة
//       await handleUpdateCredits(1);

//       let data;
//       let headers: { [key: string]: string } = {};


//       if (topicValue) {
//         data = {
//           topic: topicValue,
//           templateId: selectedTemplate ? selectedTemplate.id : '',
//           userId: user.id,
//         };
//       } else if (documentFile) {
//         data = new FormData();
//         data.append('document', documentFile);
//         data.append('templateId', selectedTemplate ? selectedTemplate.id : '');
//         data.append('userId', user.id);
//         headers['Content-Type'] = 'multipart/form-data';
//       }

//       // إرسال البيانات إلى webhook الخاص بـ Make.com
//       const res = await axios.post(
//         'https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o',
//         data,
//         { headers }
//       );

//       const requestId = res.data.requestId; // نفترض أن webhook يعيد requestId
//       setRequestId(requestId);

//       setSubmissionStatus('success');
//       // إعادة تعيين النموذج
//       setTopicValue('');
//       setDocumentFile(null);
//       setSelectedTemplate(null);

//       // بدء الاستطلاع لمعرفة ما إذا كان الملف جاهزًا
//       startPolling(requestId);
//     } catch (error) {
//       console.error('Error submitting form:', error);
//       setSubmissionStatus('error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // وظيفة الاستطلاع
//   const startPolling = (requestId: string) => {
//     setIsLoading(true);

//     const intervalId = setInterval(async () => {
//       try {
//         const res = await axios.get(`/api/check-status?requestId=${requestId}`);

//         if (res.data && res.data.status === 'COMPLETED') {
//           setIsLoading(false);
//           setDownloadUrl(res.data.downloadUrl);
//           clearInterval(intervalId);
//           setPollingIntervalId(null);
//         }
//       } catch (error) {
//         console.error('Error checking status:', error);
//       }
//     }, 5000); // الاستطلاع كل 5 ثوانٍ

//     setPollingIntervalId(intervalId);
//   };

//   // تنظيف الاستطلاع عند إلغاء التثبيت
//   useEffect(() => {
//     return () => {
//       if (pollingIntervalId) {
//         clearInterval(pollingIntervalId);
//       }
//     };
//   }, [pollingIntervalId]);

//   return (
//     <>
//       {/* النوافذ المنبثقة */}
//       <Modal
//         isOpen={showInsufficientCreditsModal}
//         onClose={() => setShowInsufficientCreditsModal(false)}
//         title="رصيدك غير كافٍ"
//         message="ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى ترقية خطتك."
//         actionText="ترقية الخطة"
//         actionLink="/pricing"
//       />

//       <div className="max-w-6xl mx-auto bg-gray-100 rounded-lg shadow-lg p-6">
//         <div className="flex flex-col items-center text-xl justify-center text-slate-900 pb-6 gap-4">
//           <h1>بوربوينت بالذكاء الصناعي </h1>
//         </div>
//         <div className="flex flex-col items-center justify-center text-slate-600 pb-6 gap-4">
//         <p>اكتب الموضوع أو حمل ملف وورد ثم اختر القالب لانشاء بوربوينت بالذكاء الصناعي قابل للتعديل</p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-6">
//           <Card>
//             <CardHeader>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmit}>
//                 <div className="flex flex-col lg:flex-row justify-between">
//                   {/* حقل الموضوع */}
//                   <div className="mb-4 flex-1 lg:mr-2">
//                     <input
//                       type="text"
//                       name="topic"
//                       id="topic"
//                       placeholder="ادخل الموضوع"
//                       value={topicValue}
//                       onChange={handleTopicChange}
//                       disabled={documentFile !== null}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>

//                   {/* حقل الملف */}
//                   <div className="mb-4 flex-1 lg:ml-2">
//                     <input
//                       type="file"
//                       name="document"
//                       id="document"
//                       accept=".docx"
//                       onChange={handleFileChange}
//                       disabled={topicValue !== ''}
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>
//                 </div>

//                 {/* اختيار القالب */}
//                 <div className="mb-4">
//                   <button
//                     type="button"
//                     onClick={() => setIsModalOpen(true)}
//                     className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//                   >
//                     {selectedTemplate
//                       ? `تم اختيار القالب: ${selectedTemplate.name}`
//                       : 'اختر القالب'}
//                   </button>
//                 </div>

//                 {/* زر الإرسال */}
//                 <div className="flex items-center justify-between">
//                   <button
//                     type="submit"
//                     className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? 'جاري الإرسال...' : 'ارسال'}
//                   </button>
//                 </div>
//               </form>

//               {/* رسائل حالة الإرسال */}
//               {submissionStatus === 'success' && (
//                 <p className="text-green-500 mt-4">تم الإرسال بنجاح!</p>
//               )}
//               {submissionStatus === 'error' && (
//                 <p className="text-red-500 mt-4">حدث خطأ أثناء الإرسال.</p>
//               )}
//               {submissionStatus === 'empty' && (
//                 <p className="text-yellow-500 mt-4">
//                   الرجاء إدخال الموضوع أو اختيار ملف.
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* التحميل والتنزيل */}
//         {isLoading && (
//           <div className="w-full flex justify-center mt-4">
//             <Loading />
//           </div>
//         )}

//         {downloadUrl && (
//           <div className="w-full flex justify-center mt-4">
//             <a
//               href={downloadUrl}
//               className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//             >
//               تحميل الملف
//             </a>
//           </div>
//         )}

//         {/* نافذة اختيار القالب */}
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



// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { useStore } from '@/store/useStore';
// import Modal from '@/components/custom/ocrModal';
// import Loading from '@/components/global/loading';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import TemplateModal from './TemplateModal';


// const CreatePresentation: React.FC = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const { getToken } = useAuth();

//   const setCredits = useStore((state) => state.setCredits);
//   const setUsedCredits = useStore((state) => state.setUsedCredits);
//   const credits = useStore((state) => state.credits);
//   const usedCredits = useStore((state) => state.usedCredits);

//   const [selectedOption, setSelectedOption] = useState<'topic' | 'document'>('topic');
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [submissionStatus, setSubmissionStatus] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
//   const [requestId, setRequestId] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [downloadUrl, setDownloadUrl] = useState(null);
//   const [pollingIntervalId, setPollingIntervalId] = useState(null);

//   const [isModalOpen, setIsModalOpen] = useState(false);


//   useEffect(() => {
//     if (user) {
//       getToken().then((token) => {
//         axios
//           .get('/api/user-data', {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           })
//           .then(({ data }) => {
//             setCredits(data.credits);
//             setUsedCredits(data.usedCredits);
//           })
//           .catch((error) => console.error('Error fetching user data:', error));
//       });
//     }
//   }, [user, setCredits, setUsedCredits]);


//   // // Fetch user data
//   // useEffect(() => {
//   //   if (user) {
//   //     axios
//   //       .get(`/api/user-data?userId=${user.id}`)
//   //       .then(({ data }) => {
//   //         setCredits(data.credits);
//   //         setUsedCredits(data.usedCredits);
//   //       })
//   //       .catch((error) => console.error('Error fetching user data:', error));
//   //   }
//   // }, [user, setCredits, setUsedCredits]);


//   const handleUpdateCredits = useCallback(
//     async (pointsUsed: number) => {
//       if (user) {
//         try {
//           await axios.patch('/api/update-credits', {
//             userId: user.id,
//             pointsUsed,
//           });
  
//           // Update the local state after the server confirms the update
//           const updatedUsedCredits = (usedCredits || 0) + pointsUsed;
//           const updatedCredits = (credits || 0) - pointsUsed;
  
//           setUsedCredits(updatedUsedCredits);
//           setCredits(updatedCredits);
//         } catch (error) {
//           console.error('Error updating credits:', error);
//         }
//       }
//     },
//     [user, credits, usedCredits, setCredits, setUsedCredits]
//   );
  

//   const handleSubmitTopic = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const form = e.currentTarget; // Store currentTarget before any await
  
//     if (!user) {
//       router.push('/sign-in');
//       return;
//     }
  
//     const topic = form.topic.value;
//     if (!topic) {
//       setSubmissionStatus('empty');
//       return;
//     }
  
//     if (credits === null || credits < 1) {
//       setShowInsufficientCreditsModal(true);
//       return;
//     }
  
//     setIsSubmitting(true);
//     try {
//       // Deduct one credit
//       await handleUpdateCredits(1);
  
//       const data = {
//         topic: topic,
//         templateId: selectedTemplate ? selectedTemplate.id : '',
//         userId: user.id,
//       };
  
//       // Send data to Make.com webhook
//       const res = await axios.post('https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o', data);
  
//       const requestId = res.data.requestId; // Assuming the webhook returns a requestId
//       setRequestId(requestId);
  
//       setSubmissionStatus('success');
//       // Reset form
//       form.reset(); // Use the stored form reference
//       setSelectedTemplate(null);
  
//       // Start polling for the file to be ready
//       startPolling(requestId);
//     } catch (error) {
//       console.error('Error sending data:', error);
//       setSubmissionStatus('error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
  


//   // const handleSubmitTopic = async (e: React.FormEvent<HTMLFormElement>) => {
//   //   e.preventDefault();
//   //   if (!user) {
//   //     router.push('/sign-in');
//   //     return;
//   //   }

//   //   const topic = e.currentTarget.topic.value;
//   //   if (!topic) {
//   //     setSubmissionStatus('empty');
//   //     return;
//   //   }

//   //   if (credits === null || credits < 1) {
//   //     setShowInsufficientCreditsModal(true);
//   //     return;
//   //   }

//   //   setIsSubmitting(true);
//   //   try {
//   //     // Deduct one credit
//   //     await handleUpdateCredits(1);

//   //     const data = {
//   //       topic: topic,
//   //       templateId: selectedTemplate ? selectedTemplate.id : '',
//   //       userId: user.id,
//   //     };

//   //     // Send data to Make.com webhook
//   //     const res = await axios.post('https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o', data);

//   //     const requestId = res.data.requestId; // Assuming the webhook returns a requestId
//   //     setRequestId(requestId);

//   //     setSubmissionStatus('success');
//   //     // Reset form
//   //     e.currentTarget.reset();
//   //     setSelectedTemplate(null);

//   //     // Start polling for the file to be ready
//   //     startPolling(requestId);

//   //   } catch (error) {
//   //     console.error('Error sending data:', error);
//   //     setSubmissionStatus('error');
//   //   } finally {
//   //     setIsSubmitting(false);
//   //   }
//   // };

//   const handleSubmitDocument = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!user) {
//       router.push('/sign-in');
//       return;
//     }

//     const file = e.currentTarget.document.files[0];
//     if (!file) {
//       setSubmissionStatus('empty');
//       return;
//     }

//     // Check file size, type, etc., if needed

//     if (credits === null || credits < 1) {
//       setShowInsufficientCreditsModal(true);
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       // Deduct one credit
//       await handleUpdateCredits(1);

//       const data = new FormData();
//       data.append('document', file);
//       data.append('templateId', selectedTemplate ? selectedTemplate.id : '');
//       data.append('userId', user.id);

//       // Send data to Make.com webhook
//       const res = await axios.post('https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o', data, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       const requestId = res.data.requestId; // Assuming the webhook returns a requestId
//       setRequestId(requestId);

//       setSubmissionStatus('success');
//       // Reset form
//       e.currentTarget.reset();
//       setSelectedTemplate(null);

//       // Start polling for the file to be ready
//       startPolling(requestId);

//     } catch (error) {
//       console.error('Error sending data:', error);
//       setSubmissionStatus('error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const startPolling = (requestId) => {
//     setIsLoading(true);

//     const intervalId = setInterval(async () => {
//       try {
//         const res = await axios.get(`/api/check-status?requestId=${requestId}`);

//         if (res.data && res.data.status === 'COMPLETED') {
//           setIsLoading(false);
//           setDownloadUrl(res.data.downloadUrl);
//           clearInterval(intervalId);
//           setPollingIntervalId(null);
//         }
//       } catch (error) {
//         console.error('Error checking status:', error);
//       }
//     }, 5000); // Poll every 5 seconds

//     setPollingIntervalId(intervalId);
//   };

//   useEffect(() => {
//     return () => {
//       if (pollingIntervalId) {
//         clearInterval(pollingIntervalId);
//       }
//     };
//   }, [pollingIntervalId]);

//   return (
//     <>
//       {/* Modals */}
//       <Modal
//         isOpen={showInsufficientCreditsModal}
//         onClose={() => setShowInsufficientCreditsModal(false)}
//         title="رصيدك غير كافٍ"
//         message="ليس لديك رصيد كافٍ لإجراء هذه العملية. يرجى ترقية خطتك."
//         actionText="ترقية الخطة"
//         actionLink="/pricing"
//       />

//       <div className="max-w-6xl mx-auto bg-gray-100 rounded-lg shadow-lg p-6">
//       <div className="flex flex-col items-center justify-center text-slate-600 pb-6 gap-4">
//       <h3>اختر انشاء بوربوينت بالذكاء الصناعي او من خلال تحميل ملف وورد</h3>
//         </div>


// <div className="flex justify-center mb-4">
//           <button
//             className={`px-4 rounded-lg py-2 mx-2 ${selectedOption === 'topic' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//             onClick={() => setSelectedOption('topic')}
//           >
//             عرض بالذكاء الصناعي
//           </button>
//           <button
//             className={`px-4  rounded-lg py-2 mx-2 ${selectedOption === 'document' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//             onClick={() => setSelectedOption('document')}
//           >
//             عرض من ملف وورد
//           </button>
//         </div>

//         {selectedOption === 'topic' && (
//           <div className="bg-white rounded-lg shadow p-6">
//             <Card>
//               <CardHeader>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleSubmitTopic}>
//                   <div className="mb-4 flex  flex-col items-center judtify-center">
//                     <input
//                       type="text"
//                       name="topic"
//                       id="topic"
//                       placeholder="ادخل الموضوع"
//                       required
//                       className="shadow appearance-none border rounded lg:w-1/2 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>

//                   <div className="mb-4 flex  flex-col items-center judtify-center">
//                     <button
//                       type="button"
//                       onClick={() => setIsModalOpen(true)}
//                       className="lg:w-1/2 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//                     >
//                       {selectedTemplate
//                         ? `تم اختيار القالب: ${selectedTemplate.name}`
//                         : 'اختر القالب'}
//                     </button>
//                   </div>

//                   <div className="flex flex-col items-center justify-between">
//                     <button
//                       type="submit"
//                       className="w-1/4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
//                       disabled={isSubmitting}
//                     >
//                       {isSubmitting ? 'جاري الإرسال...' : 'ارسال'}
//                     </button>
//                   </div>
//                 </form>

//                 {/* Display submission status messages */}
//                 {submissionStatus === 'success' && (
//                   <p className="text-green-500 mt-4">تم الإرسال بنجاح!</p>
//                 )}
//                 {submissionStatus === 'error' && (
//                   <p className="text-red-500 mt-4">حدث خطأ أثناء الإرسال.</p>
//                 )}
//                 {submissionStatus === 'empty' && (
//                   <p className="text-yellow-500 mt-4">الرجاء إدخال الموضوع.</p>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         )}

//         {selectedOption === 'document' && (
//           <div className="bg-white rounded-lg shadow p-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>تحميل ملف وورد</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleSubmitDocument}>
//                   <div className="mb-4">
//                     <input
//                       type="file"
//                       name="document"
//                       id="document"
//                       accept=".docx"
//                       required
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>

//                   <div className="mb-4">
//                     <button
//                       type="button"
//                       onClick={() => setIsModalOpen(true)}
//                       className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//                     >
//                       {selectedTemplate
//                         ? `تم اختيار القالب: ${selectedTemplate.name}`
//                         : 'اختر القالب'}
//                     </button>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <button
//                       type="submit"
//                       className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
//                       disabled={isSubmitting}
//                     >
//                       {isSubmitting ? 'جاري الإرسال...' : 'ارسال'}
//                     </button>
//                   </div>
//                 </form>

//                 {/* Display submission status messages */}
//                 {submissionStatus === 'success' && (
//                   <p className="text-green-500 mt-4">تم الإرسال بنجاح!</p>
//                 )}
//                 {submissionStatus === 'error' && (
//                   <p className="text-red-500 mt-4">حدث خطأ أثناء الإرسال.</p>
//                 )}
//                 {submissionStatus === 'empty' && (
//                   <p className="text-yellow-500 mt-4">الرجاء اختيار ملف.</p>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         )} 

        
//         {/* Loading and Download */}
//         {isLoading && (
//           <div className="w-full flex justify-center mt-4">
//             <Loading />
//           </div>
//         )}

//         {downloadUrl && (
//           <div className="w-full flex justify-center mt-4">
//             <a href={downloadUrl} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
//               تحميل الملف
//             </a>
//           </div>
//         )}

//         {/* Template Selection Modal */}
//         <TemplateModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           onSelect={(template) => setSelectedTemplate(template)}
//         />
//       </div>
//     </>
//   );
// };

// export default CreatePresentation;



// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { PDFDocument } from 'pdf-lib';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { useStore } from '@/store/useStore';
// import CheckFileAndDownload from './CheckFileAndDownload';
// import Modal from '@/components/custom/ocrModal';
// import Loading from '@/components/global/loading';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// import TemplateModal from './TemplateModal';



// const ocr: React.FC = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const { getToken } = useAuth();

//   const setCredits = useStore((state) => state.setCredits);
//   const setUsedCredits = useStore((state) => state.setUsedCredits);
//   const credits = useStore((state) => state.credits);
//   const usedCredits = useStore((state) => state.usedCredits);

//   const [showSizeModal, setShowSizeModal] = useState(false);
//   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
//   const [showPageLimitModal, setShowPageLimitModal] = useState(false);
//   const [extracting, setExtracting] = useState(false);
//   const [processing, setProcessing] = useState(false);
//   const [progress, setProgress] = useState<number>(0);
//   const [isFakeProgress, setIsFakeProgress] = useState(true);
//   const [fileKey, setFileKey] = useState<string | null>(null);
//   const [uniqueId, setUniqueId] = useState<string | null>(null);
//   const [uploadSpeed, setUploadSpeed] = useState<number>(0);
//   const [timeRemaining, setTimeRemaining] = useState<number>(0);

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const maxPageLimit = 500;
//   const fakeProgressRef = useRef(0);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);

//   const [submissionStatus, setSubmissionStatus] = useState(''); // New state for submission status
//   const [isSubmitting, setIsSubmitting] = useState(false); // New state for submit button loading

//   const filePath = uniqueId ? `${uniqueId}/output/result.docx` : '';



// interface Template {
//   id: string;
//   name: string;
//   preview: string;
// }


//   // Fetch user data
//   useEffect(() => {
//     if (user) {
//       axios
//         .get(`/api/user-data?userId=${user.id}`)
//         .then(({ data }) => {
//           setCredits(data.credits);
//           setUsedCredits(data.usedCredits);
//         })
//         .catch((error) => console.error('Error fetching user data:', error));
//     }
//   }, [user, setCredits, setUsedCredits]);

//   const handleUpdateStatus = useCallback(
//     async (pagesUsed: number) => {
//       if (user) {
//         try {
//           await axios.patch('/api/update-status', {
//             userId: user.id,
//             pagesUsed,
//           });

//           // Update the local state after the server confirms the update
//           const updatedUsedCredits = (usedCredits || 0) + pagesUsed;
//           const updatedCredits = (credits || 0) - pagesUsed;

//           setUsedCredits(updatedUsedCredits);
//           setCredits(updatedCredits);
//         } catch (error) {
//           console.error('Error updating credits:', error);
//         }
//       }
//     },
//     [user, credits, usedCredits, setCredits, setUsedCredits]
//   );

//   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const fileSizeInMB = file.size / (1024 * 1024);
//     if (fileSizeInMB > 10) {
//       setShowSizeModal(true);
//       return;
//     }

//     setExtracting(true);
//     startFakeProgress();

//     if (file.type !== 'application/pdf') {
//       await handleUpdateStatus(1);
//       return continueFileProcessing(file, 1);
//     }
//     return fileReader(file, credits || 0);
//   };

//   const fileReader = (file: File, remainingPage: number) => {
//     const reader = new FileReader();
//     reader.onload = async (e) => {
//       const buffer = e.target?.result as ArrayBuffer;
//       const pdf = await PDFDocument.load(buffer);
//       const pageCount = pdf.getPageCount();

//       if (pageCount > maxPageLimit) {
//         setShowPageLimitModal(true);
//         setExtracting(false);
//         return;
//       }
//       if (credits !== null && credits < pageCount) {
//         setShowInsufficientCreditsModal(true);
//         setExtracting(false);
//         return;
//       }

//       await handleUpdateStatus(pageCount);
//       return continueFileProcessing(file, pageCount);
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const startFakeProgress = () => {
//     setIsFakeProgress(true);
//     let fakeProgress = 0;

//     const interval = setInterval(() => {
//       fakeProgress += 1;
//       fakeProgressRef.current = fakeProgress;
//       setProgress(Math.min(fakeProgress, 30));

//       if (fakeProgress >= 30) {
//         clearInterval(interval);
//       }
//     }, 100);
//   };

//   const continueFileProcessing = async (file: File, pageCount: number) => {
//     try {
//       const fakeProgressValue = fakeProgressRef.current;
//       const { data } = await axios.post('/api/process-file', {
//         fileName: file.name,
//         contentType: file.type,
//       });

//       if (data && data.success) {
//         const { uploadUrl, uniqueId, fileName, contentType } = data;

//         setIsFakeProgress(false);
//         setProgress(fakeProgressValue);

//         await uploadFileWithAxios(uploadUrl, file, contentType, fakeProgressValue);

//         const fileKey = `${uniqueId}/${fileName}`;
//         setFileKey(fileKey);

//         setExtracting(false);
//         setProcessing(true);

//         const res = await axios.post('/api/process-upload', {
//           fileName,
//           fileKey,
//           uniqueId,
//           contentType,
//           pageCount,
//         });

//         if (res.data && res.data.success) {
//           setUniqueId(res.data.uniqueId);
//         }
//       }
//     } catch (error) {
//       console.log('Error in file processing:', error);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const uploadFileWithAxios = (
//     uploadUrl: string,
//     file: File,
//     contentType: string,
//     initialProgress: number
//   ) => {
//     let startTime = Date.now();
//     let previousLoaded = 0;

//     return axios.put(uploadUrl, file, {
//       headers: {
//         'Content-Type': contentType,
//       },
//       onUploadProgress: (progressEvent) => {
//         if (progressEvent.total) {
//           const uploadProgress = progressEvent.loaded / progressEvent.total;
//           const realProgress = Math.round(
//             uploadProgress * (100 - initialProgress) + initialProgress
//           );
//           setProgress(realProgress);

//           // Update upload speed and time remaining
//           const elapsedTime = (Date.now() - startTime) / 1000; // Time in seconds
//           const bytesTransferred = progressEvent.loaded - previousLoaded;

//           // Calculate upload speed in KB/s
//           const speedKBps = bytesTransferred / 1024 / (elapsedTime || 1); // Prevent division by zero
//           setUploadSpeed(speedKBps);

//           // Calculate time remaining in seconds
//           const remainingBytes = progressEvent.total - progressEvent.loaded;
//           const uploadSpeedBytesPerSecond = progressEvent.loaded / (elapsedTime || 1); // Bytes per second
//           const timeRemainingSeconds =
//             remainingBytes / (uploadSpeedBytesPerSecond || 1); // Prevent division by zero

//           setTimeRemaining(
//             !isNaN(timeRemainingSeconds) && timeRemainingSeconds > 0
//               ? timeRemainingSeconds
//               : 0
//           );

//           previousLoaded = progressEvent.loaded;
//         }
//       },
//     });
//   };

//   const handleFileReady = async (fileUrl: string) => {
//     if (fileKey) {
//       try {
//         const token = await getToken();

//         await axios.patch(
//           '/api/save-file',
//           {
//             fileKey,
//             resultedFile: fileUrl,
//             status: 'COMPLETED',
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//       } catch (error) {
//         console.error('Error saving file:', error);
//       }
//     } else {
//       console.error('fileKey is not available');
//     }
//   };

//   const handleButtonClick = () => {
//     if (!user) {
//       router.push('/sign-in');
//       return;
//     }
//     document.getElementById('file-input')?.click();
//   };

//   const handleDownloadComplete = () => {
//     // Reset all state variables to their initial values
//     setExtracting(false);
//     setProcessing(false);
//     setProgress(0);
//     setIsFakeProgress(true);
//     setFileKey(null);
//     setUniqueId(null);
//     setUploadSpeed(0);
//     setTimeRemaining(0);
//     // Reset the file input's value
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };



//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!user) {
//       router.push('/sign-in');
//       return;
//     }

//     const topic = e.currentTarget.topic.value;
//     if (!topic) {
//       setSubmissionStatus('empty');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const data = {
//         topic: topic,
//         templateId: selectedTemplate ? selectedTemplate.id : '',
//         userId: user.id,
//       };

//       await axios.post(
//         'https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o',
//         data
//       );

//       setSubmissionStatus('success');
//       e.currentTarget.reset();
//       setSelectedTemplate(null);
//     } catch (error) {
//       console.error('Error sending data:', error);
//       setSubmissionStatus('error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <>
//       {/* Modals */}
//       <Modal
//         isOpen={showSizeModal}
//         onClose={() => setShowSizeModal(false)}
//         title="الملف يتجاوز حجمه ١٠ ميجابايت "
//         message="الرجاء ضغط الملف من خلال الموقع التالي وأعد تحميله مرة أخرى"
//         actionText="ضغط الملف"
//         actionLink="https://www.ilovepdf.com/ar/compress_pdf"
//       />
//       <Modal
//         isOpen={showInsufficientCreditsModal}
//         onClose={() => setShowInsufficientCreditsModal(false)}
//         title="غير كافٍ من عدد الصفحات المتاحة"
//         message="ليس لديك عدد صفحات كافٍ لهذا الملف. يرجى ترقية خطتك."
//         actionText="ترقية الخطة"
//         actionLink="/pricing"
//       />
//       <Modal
//         isOpen={showPageLimitModal}
//         onClose={() => setShowPageLimitModal(false)}
//         title="تم تجاوز الحد الأقصى للصفحات"
//         message="يتجاوز الملف الحد الأقصى المسموح به وهو 500 صفحة. يرجى اختيار ملف يحتوي على عدد أقل من الصفحات."
//         actionText="إغلاق"
//       />

//       <div className="max-w-6xl mx-auto bg-gray-100 rounded-lg shadow-lg p-6">
//         <div className="flex flex-col md:flex-row md:space-x-6 gap-4 space-y-6 md:space-y-0">
//           {/* First Card */}
//           <div className="flex-1 bg-white rounded-lg shadow p-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>موضوع البوربوينت</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleSubmit}>
//                   <div className="mb-4">
//                     <input
//                       type="text"
//                       name="topic"
//                       id="topic"
//                       placeholder="ادخل الموضوع"
//                       required
//                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                     />
//                   </div>

//                   <div className="mb-4">
//                     <button
//                       type="button"
//                       onClick={() => setIsModalOpen(true)}
//                       className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//                     >
//                       {selectedTemplate
//                         ? `تم اختيار القالب: ${selectedTemplate.name}`
//                         : 'اختر القالب'}
//                     </button>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <button
//                       type="submit"
//                       className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
//                       disabled={isSubmitting}
//                     >
//                       {isSubmitting ? 'جاري الإرسال...' : 'ارسال'}
//                     </button>
//                   </div>
//                 </form>

//                 {/* Display submission status messages */}
//                 {submissionStatus === 'success' && (
//                   <p className="text-green-500 mt-4">تم الإرسال بنجاح!</p>
//                 )}
//                 {submissionStatus === 'error' && (
//                   <p className="text-red-500 mt-4">حدث خطأ أثناء الإرسال.</p>
//                 )}
//                 {submissionStatus === 'empty' && (
//                   <p className="text-yellow-500 mt-4">الرجاء إدخال الموضوع.</p>
//                 )}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Second Card */}
//           <div className="flex-1 bg-white rounded-lg shadow p-6 flex flex-col items-center">
//             <div
//               className={`cursor-pointer flex flex-col items-center justify-center border-4 border-dashed border-blue-600 rounded-lg h-48 w-full mb-4 ${
//                 extracting ? 'bg-blue-100' : 'bg-white hover:bg-blue-50'
//               }`}
//             >
//               <input
//                 ref={fileInputRef}
//                 id="file-input"
//                 type="file"
//                 accept=".pdf, image/*"
//                 onChange={handleFileChange}
//                 className="hidden"
//                 multiple={false}
//               />
//               <button
//                 onClick={handleButtonClick}
//                 className="w-full h-full flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-black font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
//               >
//                 اختر ملف أو صورة
//               </button>
//             </div>

//             <div className="w-full">
//               {extracting && !processing && (
//                 <div className="w-full">
//                   <p className="text-gray-500 text-sm mt-4 text-center">
//                     {progress}% {isFakeProgress ? 'جارٍ التحضير...' : 'تم التحميل'}
//                   </p>

//                   <progress
//                     className="w-full mt-2 h-2 bg-gray-200 rounded"
//                     value={progress}
//                     max="100"
//                   >
//                     {progress}%
//                   </progress>

//                   {!isFakeProgress && (
//                     <p className="text-gray-500 text-sm mt-2 text-center">
//                       سرعة التحميل:{' '}
//                       {uploadSpeed > 0 ? `${uploadSpeed.toFixed(2)} ك.ب / ث` : 'جاري الحساب...'}
//                       <br />
//                       الوقت المتبقي:{' '}
//                       {timeRemaining > 0 ? `${timeRemaining.toFixed(2)} ثانية` : 'جاري الحساب...'}
//                     </p>
//                   )}
//                 </div>
//               )}

//               {processing && (
//                 <div className="w-full flex justify-center mt-4">
//                   <Loading />
//                 </div>
//               )}
//             </div>

//             {uniqueId && !extracting && fileKey && (
//               <CheckFileAndDownload
//                 fileKey={fileKey}
//                 filePath={filePath}
//                 onFileReady={handleFileReady}
//                 onDownloadComplete={handleDownloadComplete}
//               />
//             )}
//           </div>
//         </div>

//         {/* Template Selection Modal */}
//         <TemplateModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           onSelect={(template) => setSelectedTemplate(template)}
//         />
//       </div>
//     </>
//   );
// };

// export default ocr;



// // Ocr.tsx
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { PDFDocument } from 'pdf-lib';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { useStore } from '@/store/useStore';
// import Modal from '@/components/custom/ocrModal';
// import Loading from '@/components/global/loading';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// interface Template {
//   id: string;
//   name: string;
//   preview: string;
// }

// interface TemplateModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSelect: (template: Template) => void;
// }

// const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
//   const [templates, setTemplates] = useState<Template[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (isOpen) {
//       const fetchTemplates = async () => {
//         setLoading(true);
//         try {
//           const response = await axios.get('/api/templates');
//           console.log('Templates response:', response.data); // For debugging
//           setTemplates(response.data.templates || []);
//         } catch (error) {
//           console.error('Error fetching templates:', error);
//           setTemplates([]);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchTemplates();
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-8 sm:p-6 sm:w-3/4 w-full max-w-6xl">
//         <h2 className="text-lg font-bold mb-4 text-center">اختر قالبًا</h2>

//         {loading ? (
//           <p>جاري تحميل القوالب...</p>
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {templates.map((template) => (
//               <div
//                 key={template.id}
//                 className="relative bg-white rounded-lg hover:border-[2px] border border-transparent hover:border-blue-500 hover:border-[4px] overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
//                 onClick={() => {
//                   onSelect(template);
//                   onClose();
//                 }}
//               >
//                 <img src={template.preview} alt={template.name} className="w-full h-40 object-cover" />
//                 <div className="p-2">
//                   <p className="text-sm font-semibold text-center">{template.name}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         <button
//           onClick={onClose}
//           className="mt-6 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
//         >
//           إغلاق
//         </button>
//       </div>
//     </div>
//   );
// };

// const Ocr: React.FC = () => {
//   const { user } = useUser();
//   const router = useRouter();
//   const { getToken } = useAuth();

//   const setCredits = useStore((state) => state.setCredits);
//   const setUsedCredits = useStore((state) => state.setUsedCredits);
//   const credits = useStore((state) => state.credits);
//   const usedCredits = useStore((state) => state.usedCredits);

//   const [showSizeModal, setShowSizeModal] = useState(false);
//   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
//   const [showPageLimitModal, setShowPageLimitModal] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
//   const [submissionStatus, setSubmissionStatus] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     if (user) {
//       axios
//         .get(`/api/user-data?userId=${user.id}`)
//         .then(({ data }) => {
//           setCredits(data.credits);
//           setUsedCredits(data.usedCredits);
//         })
//         .catch((error) => console.error('Error fetching user data:', error));
//     }
//   }, [user, setCredits, setUsedCredits]);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!user) {
//       router.push('/sign-in');
//       return;
//     }

//     const topic = e.currentTarget.topic.value;
//     if (!topic) {
//       setSubmissionStatus('empty');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const data = {
//         topic: topic,
//         templateId: selectedTemplate ? selectedTemplate.id : '',
//         userId: user.id,
//       };

//       await axios.post(
//         'https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o',
//         data
//       );

//       setSubmissionStatus('success');
//       e.currentTarget.reset();
//       setSelectedTemplate(null);
//     } catch (error) {
//       console.error('Error sending data:', error);
//       setSubmissionStatus('error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto bg-gray-100 rounded-lg shadow-lg p-6">
//       {/* Template Selection Modal */}
//       <TemplateModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSelect={(template) => setSelectedTemplate(template)}
//       />

//       {/* Main form */}
//       <form onSubmit={handleSubmit}>
//         <div className="flex flex-col md:flex-row md:space-x-6 gap-4 space-y-6 md:space-y-0">
//           <div className="flex-1 bg-white rounded-lg shadow p-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>موضوع البوربوينت</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <input
//                   type="text"
//                   name="topic"
//                   id="topic"
//                   placeholder="ادخل الموضوع"
//                   required
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(true)}
//                   className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
//                 >
//                   {selectedTemplate
//                     ? `تم اختيار القالب: ${selectedTemplate.name}`
//                     : 'اختر القالب'}
//                 </button>

//                 <button
//                   type="submit"
//                   className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
//                   disabled={isSubmitting}
//                 >
//                   {isSubmitting ? 'جاري الإرسال...' : 'ارسال'}
//                 </button>

//                 {/* Display submission status messages */}
//                 {submissionStatus === 'success' && (
//                   <p className="text-green-500 mt-4">تم الإرسال بنجاح!</p>
//                 )}
//                 {submissionStatus === 'error' && (
//                   <p className="text-red-500 mt-4">حدث خطأ أثناء الإرسال.</p>
//                 )}
//                 {submissionStatus === 'empty' && (
//                   <p className="text-yellow-500 mt-4">الرجاء إدخال الموضوع.</p>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Ocr;


// // // Ocr.tsx
// // import React, { useState, useEffect, useCallback, useRef } from 'react';
// // import axios from 'axios';
// // import { useRouter } from 'next/navigation';
// // import { PDFDocument } from 'pdf-lib';
// // import { useUser, useAuth } from '@clerk/nextjs';
// // import { useStore } from '@/store/useStore';
// // import Modal from '@/components/custom/ocrModal';
// // import Loading from '@/components/global/loading';
// // import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// // interface Template {
// //   id: string;
// //   name: string;
// //   preview: string;
// // }

// // interface TemplateModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   onSelect: (template: Template) => void;
// // }

// // const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
// //   const [templates, setTemplates] = useState<Template[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (isOpen) {
// //       const fetchTemplates = async () => {
// //         setLoading(true);
// //         try {
// //           const response = await axios.get('/api/templates');
// //           console.log('Templates response:', response.data); // For debugging
// //           setTemplates(response.data.templates || []);
// //         } catch (error) {
// //           console.error('Error fetching templates:', error);
// //           setTemplates([]);
// //         } finally {
// //           setLoading(false);
// //         }
// //       };
// //       fetchTemplates();
// //     }
// //   }, [isOpen]);

// //   if (!isOpen) return null;

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //       <div className="bg-white rounded-lg p-8 sm:p-6 sm:w-3/4 w-full max-w-6xl">
// //         <h2 className="text-lg font-bold mb-4 text-center">اختر قالبًا</h2>

// //         {loading ? (
// //           <p>جاري تحميل القوالب...</p>
// //         ) : (
// //           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
// //             {templates.map((template) => (
// //               <div
// //                 key={template.id}
// //                 className="relative bg-white rounded-lg hover:border-[2px] border border-transparent hover:border-blue-500 hover:border-[4px] overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
// //                 onClick={() => {
// //                   onSelect(template);
// //                   onClose();
// //                 }}
// //               >
// //                 <img src={template.preview} alt={template.name} className="w-full h-40 object-cover" />
// //                 <div className="p-2">
// //                   <p className="text-sm font-semibold text-center">{template.name}</p>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         )}

// //         <button
// //           onClick={onClose}
// //           className="mt-6 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
// //         >
// //           إغلاق
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // const Ocr: React.FC = () => {
// //   const { user } = useUser();
// //   const router = useRouter();
// //   const { getToken } = useAuth();

// //   const setCredits = useStore((state) => state.setCredits);
// //   const setUsedCredits = useStore((state) => state.setUsedCredits);
// //   const credits = useStore((state) => state.credits);
// //   const usedCredits = useStore((state) => state.usedCredits);

// //   const [showSizeModal, setShowSizeModal] = useState(false);
// //   const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
// //   const [showPageLimitModal, setShowPageLimitModal] = useState(false);
// //   const [extracting, setExtracting] = useState(false);
// //   const [processing, setProcessing] = useState(false);
// //   const [progress, setProgress] = useState<number>(0);
// //   const [isFakeProgress, setIsFakeProgress] = useState(true);
// //   const [fileKey, setFileKey] = useState<string | null>(null);
// //   const [uniqueId, setUniqueId] = useState<string | null>(null);
// //   const [uploadSpeed, setUploadSpeed] = useState<number>(0);
// //   const [timeRemaining, setTimeRemaining] = useState<number>(0);

// //   const fileInputRef = useRef<HTMLInputElement>(null);

// //   const maxPageLimit = 500;
// //   const fakeProgressRef = useRef(0);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

// //   const [submissionStatus, setSubmissionStatus] = useState('');
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   const filePath = uniqueId ? `${uniqueId}/output/result.docx` : '';

// //   useEffect(() => {
// //     if (user) {
// //       axios
// //         .get(`/api/user-data?userId=${user.id}`)
// //         .then(({ data }) => {
// //           setCredits(data.credits);
// //           setUsedCredits(data.usedCredits);
// //         })
// //         .catch((error) => console.error('Error fetching user data:', error));
// //     }
// //   }, [user, setCredits, setUsedCredits]);

// //   const handleUpdateStatus = useCallback(
// //     async (pagesUsed: number) => {
// //       if (user) {
// //         try {
// //           await axios.patch('/api/update-status', {
// //             userId: user.id,
// //             pagesUsed,
// //           });

// //           const updatedUsedCredits = (usedCredits || 0) + pagesUsed;
// //           const updatedCredits = (credits || 0) - pagesUsed;

// //           setUsedCredits(updatedUsedCredits);
// //           setCredits(updatedCredits);
// //         } catch (error) {
// //           console.error('Error updating credits:', error);
// //         }
// //       }
// //     },
// //     [user, credits, usedCredits, setCredits, setUsedCredits]
// //   );

// //   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = event.target.files?.[0];
// //     if (!file) return;

// //     const fileSizeInMB = file.size / (1024 * 1024);
// //     if (fileSizeInMB > 10) {
// //       setShowSizeModal(true);
// //       return;
// //     }

// //     setExtracting(true);
// //     startFakeProgress();

// //     if (file.type !== 'application/pdf') {
// //       await handleUpdateStatus(1);
// //       return continueFileProcessing(file, 1);
// //     }
// //     return fileReader(file, credits || 0);
// //   };

// //   const fileReader = (file: File, remainingPage: number) => {
// //     const reader = new FileReader();
// //     reader.onload = async (e) => {
// //       const buffer = e.target?.result as ArrayBuffer;
// //       const pdf = await PDFDocument.load(buffer);
// //       const pageCount = pdf.getPageCount();

// //       if (pageCount > maxPageLimit) {
// //         setShowPageLimitModal(true);
// //         setExtracting(false);
// //         return;
// //       }
// //       if (credits !== null && credits < pageCount) {
// //         setShowInsufficientCreditsModal(true);
// //         setExtracting(false);
// //         return;
// //       }

// //       await handleUpdateStatus(pageCount);
// //       return continueFileProcessing(file, pageCount);
// //     };
// //     reader.readAsArrayBuffer(file);
// //   };

// //   const startFakeProgress = () => {
// //     setIsFakeProgress(true);
// //     let fakeProgress = 0;

// //     const interval = setInterval(() => {
// //       fakeProgress += 1;
// //       fakeProgressRef.current = fakeProgress;
// //       setProgress(Math.min(fakeProgress, 30));

// //       if (fakeProgress >= 30) {
// //         clearInterval(interval);
// //       }
// //     }, 100);
// //   };

// //   const continueFileProcessing = async (file: File, pageCount: number) => {
// //     try {
// //       const fakeProgressValue = fakeProgressRef.current;
// //       const { data } = await axios.post('/api/process-file', {
// //         fileName: file.name,
// //         contentType: file.type,
// //       });

// //       if (data && data.success) {
// //         const { uploadUrl, uniqueId, fileName, contentType } = data;

// //         setIsFakeProgress(false);
// //         setProgress(fakeProgressValue);

// //         await uploadFileWithAxios(uploadUrl, file, contentType, fakeProgressValue);

// //         const fileKey = `${uniqueId}/${fileName}`;
// //         setFileKey(fileKey);

// //         setExtracting(false);
// //         setProcessing(true);

// //         const res = await axios.post('/api/process-upload', {
// //           fileName,
// //           fileKey,
// //           uniqueId,
// //           contentType,
// //           pageCount,
// //         });

// //         if (res.data && res.data.success) {
// //           setUniqueId(res.data.uniqueId);
// //         }
// //       }
// //     } catch (error) {
// //       console.log('Error in file processing:', error);
// //     } finally {
// //       setProcessing(false);
// //     }
// //   };

// //   const uploadFileWithAxios = (
// //     uploadUrl: string,
// //     file: File,
// //     contentType: string,
// //     initialProgress: number
// //   ) => {
// //     let startTime = Date.now();
// //     let previousLoaded = 0;

// //     return axios.put(uploadUrl, file, {
// //       headers: {
// //         'Content-Type': contentType,
// //       },
// //       onUploadProgress: (progressEvent) => {
// //         if (progressEvent.total) {
// //           const uploadProgress = progressEvent.loaded / progressEvent.total;
// //           const realProgress = Math.round(
// //             uploadProgress * (100 - initialProgress) + initialProgress
// //           );
// //           setProgress(realProgress);

// //           const elapsedTime = (Date.now() - startTime) / 1000;
// //           const bytesTransferred = progressEvent.loaded - previousLoaded;

// //           const speedKBps = bytesTransferred / 1024 / (elapsedTime || 1);
// //           setUploadSpeed(speedKBps);

// //           const remainingBytes = progressEvent.total - progressEvent.loaded;
// //           const uploadSpeedBytesPerSecond = progressEvent.loaded / (elapsedTime || 1);
// //           const timeRemainingSeconds = remainingBytes / (uploadSpeedBytesPerSecond || 1);

// //           setTimeRemaining(
// //             !isNaN(timeRemainingSeconds) && timeRemainingSeconds > 0
// //               ? timeRemainingSeconds
// //               : 0
// //           );

// //           previousLoaded = progressEvent.loaded;
// //         }
// //       },
// //     });
// //   };

// //   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
// //     e.preventDefault();
// //     if (!user) {
// //       router.push('/sign-in');
// //       return;
// //     }

// //     const topic = e.currentTarget.topic.value;
// //     if (!topic) {
// //       setSubmissionStatus('empty');
// //       return;
// //     }

// //     setIsSubmitting(true);
// //     try {
// //       const data = {
// //         topic: topic,
// //         templateId: selectedTemplate ? selectedTemplate.id : '',
// //         userId: user.id,
// //       };

// //       await axios.post(
// //         'https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o',
// //         data
// //       );

// //       setSubmissionStatus('success');
// //       e.currentTarget.reset();
// //       setSelectedTemplate(null);
// //     } catch (error) {
// //       console.error('Error sending data:', error);
// //       setSubmissionStatus('error');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   return (
// //     <>
// //       <TemplateModal
// //         isOpen={isModalOpen}
// //         onClose={() => setIsModalOpen(false)}
// //         onSelect={(template) => setSelectedTemplate(template)}
// //       />
// //     </>
// //   );
// // };

// // export default Ocr;



//   //Users/omair/sasi/apps/nextjs/src/components/ocr/ocr.tsx

//   'use client';
//   import React, { useState, useEffect, useCallback, useRef } from 'react';
  
//   import axios from 'axios';
//   import { useRouter } from 'next/navigation';
//   import { PDFDocument } from 'pdf-lib';
//   import { useUser } from '@clerk/nextjs';
//   import { useStore } from '@/store/useStore';
//   import CheckFileAndDownload from './CheckFileAndDownload';
//   import Modal from '@/components/custom/ocrModal';
//   import Loading from '@/components/global/loading'
//   import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
//   import { motion } from "framer-motion";

//   import { useAuth } from '@clerk/nextjs';


  
//   const Ocr: React.FC = () => {
//     const { user } = useUser(); 
//     const router = useRouter();
//     const { getToken } = useAuth(); // <-- Add this line

    
//     const setCredits = useStore((state) => state.setCredits);
//     const setUsedCredits = useStore((state) => state.setUsedCredits);
//     const credits = useStore((state) => state.credits);
//     const usedCredits = useStore((state) => state.usedCredits);

  
//     const [showSizeModal, setShowSizeModal] = useState(false);
//     const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
//     const [showPageLimitModal, setShowPageLimitModal] = useState(false);
//     const [extracting, setExtracting] = useState(false);
//     const [processing, setProcessing] = useState(false);
//     const [progress, setProgress] = useState<number>(0);
//     const [isFakeProgress, setIsFakeProgress] = useState(true);
//     const [fileKey, setFileKey] = useState<string | null>(null);
//     const [uniqueId, setUniqueId] = useState<string | null>(null);

//     const [uploadSpeed, setUploadSpeed] = useState<number>(0); // number instead of string
//     const [timeRemaining, setTimeRemaining] = useState<number>(0); // number instead of string


//       // Modal component for selecting templates
//     const TemplateModal = ({ isOpen, onClose, onSelect }) => {
//     const [templates, setTemplates] = useState([]);
//     const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (isOpen) {
//       // Fetch templates when the modal is opened
//       const fetchTemplates = async () => {
//         setLoading(true);
//         try {
//           const response = await axios.get('/api/templates'); // Replace with your backend endpoint
//           setTemplates(response.data);
//         } catch (error) {
//           console.error('Error fetching templates:', error);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchTemplates();
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const CardsSection = () => {
//     const [hasAnimated, setHasAnimated] = useState(false);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedTemplate, setSelectedTemplate] = useState(null);
//     const [formData, setFormData] = useState({
//       topic: '',
//       file: null,
//     });
  
//     useEffect(() => {
//       const onScroll = () => {
//         if (window.scrollY > 100 && !hasAnimated) {
//           setHasAnimated(true);
//         }
//       };
  
//       window.addEventListener("scroll", onScroll);
//       return () => window.removeEventListener("scroll", onScroll);
//     }, [hasAnimated]);
  
//     const handleChange = (e) => {
//       const { name, value, files } = e.target;
//       setFormData((prev) => ({
//         ...prev,
//         [name]: files ? files[0] : value,
//       }));
//     };
  
//     const handleSubmit = async (e) => {
//       e.preventDefault();
//       if (!selectedTemplate) {
//         alert('Please select a template');
//         return;
//       }
  
//       const data = new FormData();
//       data.append('topic', formData.topic);
//       data.append('templateId', selectedTemplate.id); // Include the selected template ID
//       if (formData.file) {
//         data.append('file', formData.file);
//       }
  
//       try {
//         await axios.post('https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o', data, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });
//         alert('Data sent successfully!');
//       } catch (error) {
//         console.error('Error sending data:', error);
//         alert('Failed to send data.');
//       }
//     };

  
//     const maxPageLimit = 500;
//     const fakeProgressRef = useRef(0);

//       const filePath = uniqueId ? `${uniqueId}/output/result.docx` : '';

//       const fileInputRef = useRef<HTMLInputElement>(null); // Add this line
    
  
//     useEffect(() => {
//       if (user) {
//         axios.get(`/api/user-data?userId=${user.id}`)
//           .then(({ data }) => {
//             setCredits(data.credits);
//             setUsedCredits(data.usedCredits);
//           })
//           .catch((error) => console.error('Error fetching user data:', error));
//       }
//     }, [user, setCredits, setUsedCredits]);

  
//     const handleUpdateStatus = useCallback(async (pagesUsed: number) => {
//       if (user) {
//         try {
//           await axios.patch('/api/update-status', {
//             userId: user.id,
//             pagesUsed,
//           });
    
//           // Update the local state after the server confirms the update
//           const updatedUsedCredits = (usedCredits || 0) + pagesUsed;
//           const updatedCredits = (credits || 0) - pagesUsed;
    
//           setUsedCredits(updatedUsedCredits);
//           setCredits(updatedCredits);
//         } catch (error) {
//           console.error('Error updating credits:', error);
//           // Handle error (e.g., show a message to the user)
//         }
//       }
//     }, [user, credits, usedCredits, setCredits, setUsedCredits]);
    
  
//     const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//       const file = event.target.files?.[0];
//       if (!file) return;
  
//       const fileSizeInMB = file.size / (1024 * 1024);
//       if (fileSizeInMB > 10) {
//         setShowSizeModal(true);
//         return; 
//       }
  
//       setExtracting(true);
//       startFakeProgress();
  
//       if (file.type !== 'application/pdf') {
//         await handleUpdateStatus(1);
//         return continueFileProcessing(file, 1);
//       }
//       return fileReader(file, credits || 0);
//     };
  
//     const fileReader = (file: File, remainingPage: number) => {
//       const reader = new FileReader();
//       reader.onload = async (e) => {
//         const buffer = e.target?.result as ArrayBuffer;
//         const pdf = await PDFDocument.load(buffer);
//         const pageCount = pdf.getPageCount();
  
//         if (pageCount > maxPageLimit) {
//           setShowPageLimitModal(true);
//           setExtracting(false); 
//           return;
//         }
//         if (credits !== null && credits < pageCount) {
//           setShowInsufficientCreditsModal(true); // Update modal to reflect credits
//           setExtracting(false); 
//           return;
//         }
        
  
//         await handleUpdateStatus(pageCount);
//         return continueFileProcessing(file, pageCount);
//       };
//       reader.readAsArrayBuffer(file);
//     };
  
//     const startFakeProgress = () => {
//       setIsFakeProgress(true);
//       let fakeProgress = 0;
  
//       const interval = setInterval(() => {
//         fakeProgress += 1;
//         fakeProgressRef.current = fakeProgress;
//         setProgress(Math.min(fakeProgress, 30));
  
//         if (fakeProgress >= 30) {
//           clearInterval(interval);
//         }
//       }, 100);
//     };
  
//     const continueFileProcessing = async (file: File, pageCount: number) => {
//       try {
//         const fakeProgressValue = fakeProgressRef.current;
//         const { data } = await axios.post('/api/process-file', {
//           fileName: file.name,
//           contentType: file.type,
//         });
  
//         if (data && data.success) {
//           const { uploadUrl, uniqueId, fileName, contentType } = data;
  
//           setIsFakeProgress(false);
//           setProgress(fakeProgressValue);
  
//           await uploadFileWithAxios(uploadUrl, file, contentType, fakeProgressValue);
        
//           const fileKey = `${uniqueId}/${fileName}`;
//           setFileKey(fileKey);
        
//           setExtracting(false);
//           setProcessing(true);
  
//           const res = await axios.post('/api/process-upload', {
//             fileName,
//             fileKey,
//             uniqueId,
//             contentType,
//             pageCount,
//           });
        
//           if (res.data && res.data.success) {
//             setUniqueId(res.data.uniqueId);
//           }
//         }
//       } catch (error) {
//         console.log('Error in file processing:', error);
//       } finally {
//         setProcessing(false);
//       }
//     };
  
//     const uploadFileWithAxios = (
//       uploadUrl: string,
//       file: File,
//       contentType: string,
//       initialProgress: number
//     ) => {
//       let startTime = Date.now();
//       let previousLoaded = 0;
    
//       return axios.put(uploadUrl, file, {
//         headers: {
//           'Content-Type': contentType,
//         },
//         onUploadProgress: (progressEvent) => {
//           if (progressEvent.total) {
//             const uploadProgress = progressEvent.loaded / progressEvent.total;
//             const realProgress = Math.round(
//               uploadProgress * (100 - initialProgress) + initialProgress
//             );
//             setProgress(realProgress);
    
//             // Update upload speed and time remaining
//             const elapsedTime = (Date.now() - startTime) / 1000; // Time in seconds
//             const bytesTransferred = progressEvent.loaded - previousLoaded;
    
//             // Calculate upload speed in KB/s
//             const speedKBps = bytesTransferred / 1024 / (elapsedTime || 1); // Prevent division by zero
//             setUploadSpeed(speedKBps);
    
//             // Calculate time remaining in seconds
//             const remainingBytes = progressEvent.total - progressEvent.loaded;
//             const uploadSpeedBytesPerSecond = progressEvent.loaded / (elapsedTime || 1); // Bytes per second
//             const timeRemainingSeconds =
//               remainingBytes / (uploadSpeedBytesPerSecond || 1); // Prevent division by zero
    
//             setTimeRemaining(
//               !isNaN(timeRemainingSeconds) && timeRemainingSeconds > 0
//                 ? timeRemainingSeconds
//                 : 0
//             );
    
//             previousLoaded = progressEvent.loaded;
//           }
//         },
//       });
//     };
    
  
//     const handleFileReady = async (fileUrl: string) => {
//       if (fileKey) {
//         try {
//           const token = await getToken(); // <-- Get the auth token

//           await axios.patch('/api/save-file', {
//             fileKey,
//             resultedFile: fileUrl,
//             status: 'COMPLETED',
//           }, {
//               headers: {
//                 Authorization: `Bearer ${token}`, // <-- Include the token in the headers
//               },
//           });
          
//         } catch (error) {
//           console.error('Error saving file:', error);
//         }
//       } else {
//         console.error('fileKey is not available');
//       }
//     };
  
//     const handleButtonClick = () => {
//       if (!user) {
//         router.push('/sign-in');
//         return;
//       }
//       document.getElementById('file-input')?.click();
//     };

//     const handleDownloadComplete = () => {
//       // Reset all state variables to their initial values
//       setExtracting(false);
//       setProcessing(false);
//       setProgress(0);
//       setIsFakeProgress(true);
//       setFileKey(null);
//       setUniqueId(null);
//       setUploadSpeed(0);
//       setTimeRemaining(0);
//       // Reset any other state variables if necessary
//       // Reset the file input's value
//   if (fileInputRef.current) {
//     fileInputRef.current.value = '';
//   }
//     };
    
  
//     return (
//       <>
//       <div className="mt-6">
//         <Modal
//           isOpen={showSizeModal}
//           onClose={() => setShowSizeModal(false)}
//           title="الملف يتجاوز حجمه ١٠ ميجابايت "
//           message="الرجاء ضغط الملف من خلال الموقع التالي وأعد تحميله مرة أخرى"
//           actionText="ضغط الملف"
//           actionLink="https://www.ilovepdf.com/ar/compress_pdf"
//         />
//         <Modal
//           isOpen={showInsufficientCreditsModal}
//           onClose={() => setShowInsufficientCreditsModal(false)}
//           title="غير كافٍ من عدد الصفحات المتاحة"
//           message="ليس لديك عدد صفحات كافٍ لهذا الملف. يرجى ترقية خطتك."
//           actionText="ترقية الخطة"
//           actionLink="/pricing"
//         />
//         <Modal
//           isOpen={showPageLimitModal}
//           onClose={() => setShowPageLimitModal(false)}
//           title="تم تجاوز الحد الأقصى للصفحات"
//           message="يتجاوز الملف الحد الأقصى المسموح به وهو 500 صفحة. يرجى اختيار ملف يحتوي على عدد أقل من الصفحات."
//           actionText="إغلاق"
//         />

        
//         <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
//           <div className="flex flex-col items-center">
//             <div className={`cursor-pointer flex flex-col items-center justify-center border-4 border-dashed border-blue-600 rounded-lg h-48 w-full mid:w-3/4 mb-4 ${
//                 extracting ? "bg-blue-100" : "bg-white hover:bg-blue-50"
//               }`}>
//               <input
//                 ref={fileInputRef}
//                 id="file-input"
//                 type="file"
//                 accept=".pdf, image/*"
//                 onChange={handleFileChange}
//                 className="hidden"
//                 multiple={false}
//               />
//               <button
//                 onClick={handleButtonClick}
//                 className="min-w-[280px] min-h-[80px] bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-opacity-50"
//               >
//                 اختر ملف او صورة
//               </button>
//             </div>

//             <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto">
//   {extracting && !processing && (
//     <div className="w-full">
     
//       <p className="text-gray-500 text-sm mt-4 text-center">
//         {progress}% {isFakeProgress ? 'جارٍ التحضير...' : 'تم التحميل'}
//       </p>

     
//       <progress
//         className="responsive-progress-bar w-full mt-4"
//         value={progress}
//         max="100"
//       >
//         {progress}%
//       </progress>

     
//       {!isFakeProgress && (
//         <p className="text-gray-500 text-sm mt-4 text-center">
//           سرعة التحميل: {uploadSpeed > 0 ? `${uploadSpeed.toFixed(2)} ك.ب / ث` : 'جاري الحساب...'}
//           الوقت المتبقي: {timeRemaining > 0 ? `${timeRemaining.toFixed(2)} ثانية` : 'جاري الحساب...'}
//         </p>
//       )}
//     </div>
//   )}


//   {processing && (
//     <div className="w-full">
//       <div className="flex flex-col justify-center items-center">
//       <Loading></Loading>


//         {/* <CustomLoader size={40} color={"#FF6347"} loading={processing} /> */}
//       </div>
//     </div>
//   )}
// </div>
//             {uniqueId && !extracting && fileKey && (
//             <CheckFileAndDownload
//               fileKey={fileKey} // Use fileKey from state
//               filePath={filePath}
//               onFileReady={handleFileReady}
//               onDownloadComplete={handleDownloadComplete} // Pass the function here

//             />
//           )}
//           </div>
       
//           </div>
//         </div>

// <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// <div className="bg-white rounded-lg p-4 w-3/4 max-w-4xl">
//   <h2 className="text-lg font-bold mb-4">Select a Template</h2>
//   {loading ? (
//     <p>Loading templates...</p>
//   ) : (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//       {templates.map((template) => (
//         <div
//           key={template.id}
//           className="border p-2 rounded cursor-pointer hover:shadow-lg"
//           onClick={() => {
//             onSelect(template);
//             onClose();
//           }}
//         >
//           <img src={template.preview} alt={template.name} className="mb-2 rounded" />
//           <p className="text-sm font-semibold text-center">{template.name}</p>
//         </div>
//       ))}
//     </div>
//   )}
//   <button
//     onClick={onClose}
//     className="mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
//   >
//     Close
//   </button>
// </div>
// </div>
// <div className="container mx-auto py-16 px-4">
//       <motion.div
//         initial={{ opacity: 100, y: 50 }}
//         animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
//         transition={{ duration: 0.5 }}
//       >
//         <Card>
//           <CardHeader>
//             <CardTitle>Submit a Topic</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="topic"
//                 >
//                   Topic for the Presentation
//                 </label>
//                 <input
//                   type="text"
//                   name="topic"
//                   id="topic"
//                   value={formData.topic}
//                   onChange={handleChange}
//                   placeholder="Enter the topic"
//                   required
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 />
//               </div>

//               <div className="mb-4">
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(true)}
//                   className="bg-gray-200 text-gray-800 py-2 px-4 rounded"
//                 >
//                   {selectedTemplate ? `Template Selected: ${selectedTemplate.name}` : 'Choose Template'}
//                 </button>
//               </div>

//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="file"
//                 >
//                   Upload a File (optional)
//                 </label>
//                 <input
//                   type="file"
//                   name="file"
//                   id="file"
//                   onChange={handleChange}
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 />
//               </div>

//               <div className="flex items-center justify-between">
//                 <button
//                   type="submit"
//                   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//                 >
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Template selection modal */}
//       <TemplateModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSelect={(template) => setSelectedTemplate(template)}
//       />
//     </div>
// </>
//     );
//   };
  
//   export default Ocr;
  

