import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { useStore } from '@/store/useStore';
import Modal from '@/components/custom/ocrModal';
import Loading from '@/components/global/loading';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import TemplateModal from './TemplateModal';

type Template = {
  id: string;
  name: string;
};

const CreatePresentation: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const { getToken } = useAuth();

  const setCredits = useStore((state) => state.setCredits);
  const setUsedCredits = useStore((state) => state.setUsedCredits);
  const credits = useStore((state) => state.credits);
  const usedCredits = useStore((state) => state.usedCredits);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [pollingIntervalId, setPollingIntervalId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topicValue, setTopicValue] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Fetch user data and update credits
  useEffect(() => {
    if (user) {
      getToken().then((token) => {
        axios
          .get('/api/user-data', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(({ data }) => {
            setCredits(data.credits);
            setUsedCredits(data.usedCredits);
          })
          .catch((error) => console.error('Error fetching user data:', error));
      });
    }
  }, [user, getToken, setCredits, setUsedCredits]);

  // Update credits after usage
  const handleUpdateCredits = useCallback(
    async (pointsUsed: number) => {
      if (user) {
        try {
          await axios.patch('/api/update-credits', {
            userId: user.id,
            pointsUsed,
          });

          // Update local state after confirming server update
          const updatedUsedCredits = (usedCredits || 0) + pointsUsed;
          const updatedCredits = (credits || 0) - pointsUsed;

          setUsedCredits(updatedUsedCredits);
          setCredits(updatedCredits);
        } catch (error) {
          console.error('Error updating credits:', error);
        }
      }
    },
    [user, credits, usedCredits, setCredits, setUsedCredits]
  );

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopicValue(e.target.value);
    if (e.target.value !== '') {
      setDocumentFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentFile(e.target.files[0]);
      setTopicValue('');
    } else {
      setDocumentFile(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Ensure at least one field is filled
    if (!topicValue && !documentFile) {
      setSubmissionStatus('empty');
      return;
    }

    if (credits === null || credits < 1) {
      setShowInsufficientCreditsModal(true);
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('');

    try {
      // Deduct one point
      await handleUpdateCredits(1);

      let data: any;
      let headers: { [key: string]: string } = {};

      if (topicValue) {
        data = {
          topic: topicValue,
          templateId: selectedTemplate ? selectedTemplate.id : '',
          userId: user.id,
        };
      } else if (documentFile) {
        data = new FormData();
        data.append('document', documentFile);
        data.append('templateId', selectedTemplate ? selectedTemplate.id : '');
        data.append('userId', user.id);
        headers['Content-Type'] = 'multipart/form-data';
      }

      // Send data to the webhook
      const res = await axios.post(
        'https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o',
        data,
        { headers }
      );

      const requestId = res.data.requestId; // Assuming the webhook returns requestId
      setRequestId(requestId);

      setSubmissionStatus('success');
      // Reset form
      setTopicValue('');
      setDocumentFile(null);
      setSelectedTemplate(null);

      // Start polling to check if the file is ready
      startPolling(requestId);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Polling function
  const startPolling = (requestId: string) => {
    setIsLoading(true);

    const intervalId = window.setInterval(async () => {
      try {
        const res = await axios.get(`/api/check-status?requestId=${requestId}`);

        if (res.data && res.data.status === 'COMPLETED') {
          setIsLoading(false);
          setDownloadUrl(res.data.downloadUrl);
          if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
            setPollingIntervalId(null);
          }
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    }, 5000); // Poll every 5 seconds

    setPollingIntervalId(intervalId);
  };

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
    };
  }, [pollingIntervalId]);

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

      <div className="max-w-6xl mx-auto bg-gray-100 rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center text-xl justify-center text-slate-900 pb-6 gap-4">
          <h1>بوربوينت بالذكاء الصناعي</h1>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-600 pb-6 gap-4">
          <p>
            اكتب الموضوع أو حمل ملف وورد ثم اختر القالب لإنشاء بوربوينت بالذكاء الصناعي قابل للتعديل
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <Card>
            <CardHeader></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col lg:flex-row justify-between">
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
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                  >
                    {selectedTemplate
                      ? `تم اختيار القالب: ${selectedTemplate.name}`
                      : 'اختر القالب'}
                  </button>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
                  </button>
                </div>
              </form>

              {/* Submission Status Messages */}
              {submissionStatus === 'success' && (
                <p className="text-green-500 mt-4">تم الإرسال بنجاح!</p>
              )}
              {submissionStatus === 'error' && (
                <p className="text-red-500 mt-4">حدث خطأ أثناء الإرسال.</p>
              )}
              {submissionStatus === 'empty' && (
                <p className="text-yellow-500 mt-4">الرجاء إدخال الموضوع أو اختيار ملف.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Loading and Download */}
        {isLoading && (
          <div className="w-full flex justify-center mt-4">
            <Loading />
          </div>
        )}

        {downloadUrl && (
          <div className="w-full flex justify-center mt-4">
            <a
              href={downloadUrl}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              تحميل الملف
            </a>
          </div>
        )}

        {/* Template Modal */}
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
  

