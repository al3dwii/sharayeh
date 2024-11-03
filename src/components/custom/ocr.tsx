// Ocr.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { PDFDocument } from 'pdf-lib';
import { useUser, useAuth } from '@clerk/nextjs';
import { useStore } from '@/store/useStore';
import Modal from '@/components/custom/ocrModal';
import Loading from '@/components/global/loading';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Template {
  id: string;
  name: string;
  preview: string;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchTemplates = async () => {
        setLoading(true);
        try {
          const response = await axios.get('/api/templates');
          console.log('Templates response:', response.data); // For debugging
          setTemplates(response.data.templates || []);
        } catch (error) {
          console.error('Error fetching templates:', error);
          setTemplates([]);
        } finally {
          setLoading(false);
        }
      };
      fetchTemplates();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 sm:p-6 sm:w-3/4 w-full max-w-6xl">
        <h2 className="text-lg font-bold mb-4 text-center">اختر قالبًا</h2>

        {loading ? (
          <p>جاري تحميل القوالب...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="relative bg-white rounded-lg hover:border-[2px] border border-transparent hover:border-blue-500 hover:border-[4px] overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
              >
                <img src={template.preview} alt={template.name} className="w-full h-40 object-cover" />
                <div className="p-2">
                  <p className="text-sm font-semibold text-center">{template.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};

const Ocr: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const { getToken } = useAuth();

  const setCredits = useStore((state) => state.setCredits);
  const setUsedCredits = useStore((state) => state.setUsedCredits);
  const credits = useStore((state) => state.credits);
  const usedCredits = useStore((state) => state.usedCredits);

  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [showPageLimitModal, setShowPageLimitModal] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [isFakeProgress, setIsFakeProgress] = useState(true);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxPageLimit = 500;
  const fakeProgressRef = useRef(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const [submissionStatus, setSubmissionStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filePath = uniqueId ? `${uniqueId}/output/result.docx` : '';

  useEffect(() => {
    if (user) {
      axios
        .get(`/api/user-data?userId=${user.id}`)
        .then(({ data }) => {
          setCredits(data.credits);
          setUsedCredits(data.usedCredits);
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, [user, setCredits, setUsedCredits]);

  const handleUpdateStatus = useCallback(
    async (pagesUsed: number) => {
      if (user) {
        try {
          await axios.patch('/api/update-status', {
            userId: user.id,
            pagesUsed,
          });

          const updatedUsedCredits = (usedCredits || 0) + pagesUsed;
          const updatedCredits = (credits || 0) - pagesUsed;

          setUsedCredits(updatedUsedCredits);
          setCredits(updatedCredits);
        } catch (error) {
          console.error('Error updating credits:', error);
        }
      }
    },
    [user, credits, usedCredits, setCredits, setUsedCredits]
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 10) {
      setShowSizeModal(true);
      return;
    }

    setExtracting(true);
    startFakeProgress();

    if (file.type !== 'application/pdf') {
      await handleUpdateStatus(1);
      return continueFileProcessing(file, 1);
    }
    return fileReader(file, credits || 0);
  };

  const fileReader = (file: File, remainingPage: number) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const pdf = await PDFDocument.load(buffer);
      const pageCount = pdf.getPageCount();

      if (pageCount > maxPageLimit) {
        setShowPageLimitModal(true);
        setExtracting(false);
        return;
      }
      if (credits !== null && credits < pageCount) {
        setShowInsufficientCreditsModal(true);
        setExtracting(false);
        return;
      }

      await handleUpdateStatus(pageCount);
      return continueFileProcessing(file, pageCount);
    };
    reader.readAsArrayBuffer(file);
  };

  const startFakeProgress = () => {
    setIsFakeProgress(true);
    let fakeProgress = 0;

    const interval = setInterval(() => {
      fakeProgress += 1;
      fakeProgressRef.current = fakeProgress;
      setProgress(Math.min(fakeProgress, 30));

      if (fakeProgress >= 30) {
        clearInterval(interval);
      }
    }, 100);
  };

  const continueFileProcessing = async (file: File, pageCount: number) => {
    try {
      const fakeProgressValue = fakeProgressRef.current;
      const { data } = await axios.post('/api/process-file', {
        fileName: file.name,
        contentType: file.type,
      });

      if (data && data.success) {
        const { uploadUrl, uniqueId, fileName, contentType } = data;

        setIsFakeProgress(false);
        setProgress(fakeProgressValue);

        await uploadFileWithAxios(uploadUrl, file, contentType, fakeProgressValue);

        const fileKey = `${uniqueId}/${fileName}`;
        setFileKey(fileKey);

        setExtracting(false);
        setProcessing(true);

        const res = await axios.post('/api/process-upload', {
          fileName,
          fileKey,
          uniqueId,
          contentType,
          pageCount,
        });

        if (res.data && res.data.success) {
          setUniqueId(res.data.uniqueId);
        }
      }
    } catch (error) {
      console.log('Error in file processing:', error);
    } finally {
      setProcessing(false);
    }
  };

  const uploadFileWithAxios = (
    uploadUrl: string,
    file: File,
    contentType: string,
    initialProgress: number
  ) => {
    let startTime = Date.now();
    let previousLoaded = 0;

    return axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': contentType,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const uploadProgress = progressEvent.loaded / progressEvent.total;
          const realProgress = Math.round(
            uploadProgress * (100 - initialProgress) + initialProgress
          );
          setProgress(realProgress);

          const elapsedTime = (Date.now() - startTime) / 1000;
          const bytesTransferred = progressEvent.loaded - previousLoaded;

          const speedKBps = bytesTransferred / 1024 / (elapsedTime || 1);
          setUploadSpeed(speedKBps);

          const remainingBytes = progressEvent.total - progressEvent.loaded;
          const uploadSpeedBytesPerSecond = progressEvent.loaded / (elapsedTime || 1);
          const timeRemainingSeconds = remainingBytes / (uploadSpeedBytesPerSecond || 1);

          setTimeRemaining(
            !isNaN(timeRemainingSeconds) && timeRemainingSeconds > 0
              ? timeRemainingSeconds
              : 0
          );

          previousLoaded = progressEvent.loaded;
        }
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const topic = e.currentTarget.topic.value;
    if (!topic) {
      setSubmissionStatus('empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        topic: topic,
        templateId: selectedTemplate ? selectedTemplate.id : '',
        userId: user.id,
      };

      await axios.post(
        'https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o',
        data
      );

      setSubmissionStatus('success');
      e.currentTarget.reset();
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error sending data:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(template) => setSelectedTemplate(template)}
      />
    </>
  );
};

export default Ocr;



// // Ocr.tsx
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
//           setTemplates([]); // Set templates to empty array on error
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
//           <>
//             {/* Filters Section */}
//             <div className="flex justify-between mb-4 items-center">
//               {/* Optional filters can be added here */}
//             </div>
            
//             {/* Templates Grid */}
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               {templates.map((template) => (
//                 <div
//                   key={template.id}
//                   className="relative bg-white rounded-lg hover:border-[2px] border border-transparent hover:border-blue-500 hover:border-[4px] overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
//                   onClick={() => {
//                     onSelect(template);
//                     onClose();
//                   }}
//                 >
//                   <img src={template.preview} alt={template.name} className="w-full h-40 object-cover" />
//                   <div className="p-2">
//                     <p className="text-sm font-semibold text-center">{template.name}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* Close Button */}
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



// // // Ocr.tsx
// // import React, { useState, useEffect, useCallback, useRef } from 'react';
// // import axios from 'axios';
// // import { useRouter } from 'next/navigation';
// // import { PDFDocument } from 'pdf-lib';
// // import { useUser, useAuth } from '@clerk/nextjs';
// // import { useStore } from '@/store/useStore';
// // import CheckFileAndDownload from './CheckFileAndDownload';
// // import Modal from '@/components/custom/ocrModal';
// // import Loading from '@/components/global/loading';
// // import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// // interface TemplateModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   onSelect: (templateId: string) => void;
// // }

// // interface Template {
// //   id: string;
// //   name: string;
// //   preview: string;
// // }

// // const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
// //   const [templates, setTemplates] = useState([]);
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
// //           setTemplates([]); // Set templates to empty array on error
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
// //   <div className="bg-white rounded-lg p-8 sm:p-6 sm:w-3/4 w-full max-w-6xl">
// //     <h2 className="text-lg font-bold mb-4 text-center">اختر قالبًا</h2>
    
// //     {loading ? (
// //       <p>جاري تحميل القوالب...</p>
// //     ) : (
// //       <>
// //         {/* Filters Section */}
// //         <div className="flex justify-between mb-4 items-center">
          
// //         </div>
        
// //         {/* Templates Grid */}
// //         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
// //           {templates.map((template) => (
// //             <div
// //               key={template.id}
// //               className="relative bg-white rounded-lg  hover:border-[2px] border border-transparent hover:border-blue-500 hover:border-[4px] overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
// //               onClick={() => {
// //                 onSelect(template);
// //                 onClose();
// //               }}
// //             >
// //               <img src={template.preview} alt={template.name} className="w-full h-40 object-cover" />
// //               <div className="p-2">
// //                 <p className="text-sm font-semibold text-center">{template.name}</p>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </>
// //     )}

// //     {/* Close Button */}
// //     <button
// //       onClick={onClose}
// //       className="mt-6 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
// //     >
// //       إغلاق
// //     </button>
// //   </div>
// // </div>


// //   );
// // };


// // Main Ocr Component
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

//   const [submissionStatus, setSubmissionStatus] = useState(''); // State for submission status
//   const [isSubmitting, setIsSubmitting] = useState(false); // State for submit button loading

//   const filePath = uniqueId ? `${uniqueId}/output/result.docx` : '';

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

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault(); // Prevent the default form submission behavior
//     if (!user) {
//       router.push('/sign-in');
//       return;
//     }

//     const topic = e.target.topic.value;
//     if (!topic) {
//       setSubmissionStatus('empty');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       // Create a data object to send
//       const data = {
//         topic: topic,
//         templateId: selectedTemplate ? selectedTemplate.id : '',
//         userId: user.id,
//       };

//       // Send the data to the Make.com webhook
//       await axios.post(
//         'https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o',
//         data
//       );

//       setSubmissionStatus('success');
//       // Optionally, reset the form fields
//       e.target.reset();
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
//         <form onSubmit={handleSubmit}>
//           <div className="flex flex-col md:flex-row md:space-x-6 gap-4 space-y-6 md:space-y-0">
//             {/* First Card */}
//             <div className="flex-1 bg-white rounded-lg shadow p-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>موضوع البوربوينت</CardTitle>
//                 </CardHeader>
//                 <CardContent>
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

//                   {/* Display submission status messages */}
//                   {submissionStatus === 'success' && (
//                     <p className="text-green-500 mt-4">تم الإرسال بنجاح!</p>
//                   )}
//                   {submissionStatus === 'error' && (
//                     <p className="text-red-500 mt-4">حدث خطأ أثناء الإرسال.</p>
//                   )}
//                   {submissionStatus === 'empty' && (
//                     <p className="text-yellow-500 mt-4">الرجاء إدخال الموضوع.</p>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Second Card */}
//             <div className="flex-1 bg-white rounded-lg shadow p-6 flex flex-col items-center">
//               <div
//                 className={`cursor-pointer flex flex-col items-center justify-center border-4 border-dashed border-blue-600 rounded-lg h-48 w-full mb-4 ${
//                   extracting ? 'bg-blue-100' : 'bg-white hover:bg-blue-50'
//                 }`}
//               >
//                 <input
//                   ref={fileInputRef}
//                   id="file-input"
//                   type="file"
//                   accept=".pdf, image/*"
//                   onChange={handleFileChange}
//                   className="hidden"
//                   multiple={false}
//                 />
//                 <button
//                   onClick={handleButtonClick}
//                   className="w-full h-full flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-black font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
//                 >
//                   اختر ملف أو صورة
//                 </button>
//               </div>

//               {/* Progress and processing indicators (omitted for brevity) */}
//             </div>
//           </div>
//         </form>

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

// export default Ocr;


