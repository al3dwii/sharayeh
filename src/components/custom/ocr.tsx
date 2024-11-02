  //Users/omair/sasi/apps/nextjs/src/components/ocr/ocr.tsx

  'use client';
  import React, { useState, useEffect, useCallback, useRef } from 'react';
  
  import axios from 'axios';
  import { useRouter } from 'next/navigation';
  import { PDFDocument } from 'pdf-lib';
  import { useUser } from '@clerk/nextjs';
  import { useStore } from '@/store/useStore';
  import CheckFileAndDownload from './CheckFileAndDownload';
  import Modal from '@/components/custom/ocrModal';
  import Loading from '@/components/global/loading'

  import { useAuth } from '@clerk/nextjs';


  
  const Ocr: React.FC = () => {
    const { user } = useUser(); 
    const router = useRouter();
    const { getToken } = useAuth(); // <-- Add this line

    
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

    const [uploadSpeed, setUploadSpeed] = useState<number>(0); // number instead of string
    const [timeRemaining, setTimeRemaining] = useState<number>(0); // number instead of string

  
    const maxPageLimit = 500;
    const fakeProgressRef = useRef(0);

      const filePath = uniqueId ? `${uniqueId}/output/result.docx` : '';

      const fileInputRef = useRef<HTMLInputElement>(null); // Add this line



    // useEffect(() => {
    //   if (user) {
    //     // Mock credits for testing purposes
    //     setCredits(100);
    //     setUsedCredits(0);
    //     // Optionally skip the API call
    //     // axios.get(`/api/user-data?userId=${user.id}`)
    //     //   .then(({ data }) => {
    //     //     setCredits(data.credits);
    //     //     setUsedCredits(data.usedCredits);
    //     //   })
    //     //   .catch((error) => console.error('Error fetching user data:', error));
    //   }
    // }, [user, setCredits, setUsedCredits]);
    
  
    useEffect(() => {
      if (user) {
        axios.get(`/api/user-data?userId=${user.id}`)
          .then(({ data }) => {
            setCredits(data.credits);
            setUsedCredits(data.usedCredits);
          })
          .catch((error) => console.error('Error fetching user data:', error));
      }
    }, [user, setCredits, setUsedCredits]);


    // const handleUpdateStatus = useCallback(async (pagesUsed: number) => {
    //   if (user) {
    //     try {
    //       const response = await axios.patch('/api/update-status', {
    //         userId: user.id,
    //         pagesUsed,
    //       });
    
    //       if (response.data.success) {
    //         // Update the local state after the server confirms the update
    //         setUsedCredits((prev) => (prev || 0) + pagesUsed);
    //         setCredits((prev) => (prev || 0) - pagesUsed);
    //       } else {
    //         // Handle error response from the server
    //         console.error('Error updating credits:', response.data.error);
    //         // Optionally display an error message to the user
    //       }
    //     } catch (error) {
    //       console.error('Error updating credits:', error);
    //       // Handle network or unexpected errors
    //     }
    //   }
    // }, [user, setCredits, setUsedCredits]);
    
  
    const handleUpdateStatus = useCallback(async (pagesUsed: number) => {
      if (user) {
        try {
          await axios.patch('/api/update-status', {
            userId: user.id,
            pagesUsed,
          });
    
          // Update the local state after the server confirms the update
          const updatedUsedCredits = (usedCredits || 0) + pagesUsed;
          const updatedCredits = (credits || 0) - pagesUsed;
    
          setUsedCredits(updatedUsedCredits);
          setCredits(updatedCredits);
        } catch (error) {
          console.error('Error updating credits:', error);
          // Handle error (e.g., show a message to the user)
        }
      }
    }, [user, credits, usedCredits, setCredits, setUsedCredits]);
    
  
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
          setShowInsufficientCreditsModal(true); // Update modal to reflect credits
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
    
            // Update upload speed and time remaining
            const elapsedTime = (Date.now() - startTime) / 1000; // Time in seconds
            const bytesTransferred = progressEvent.loaded - previousLoaded;
    
            // Calculate upload speed in KB/s
            const speedKBps = bytesTransferred / 1024 / (elapsedTime || 1); // Prevent division by zero
            setUploadSpeed(speedKBps);
    
            // Calculate time remaining in seconds
            const remainingBytes = progressEvent.total - progressEvent.loaded;
            const uploadSpeedBytesPerSecond = progressEvent.loaded / (elapsedTime || 1); // Bytes per second
            const timeRemainingSeconds =
              remainingBytes / (uploadSpeedBytesPerSecond || 1); // Prevent division by zero
    
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
    
  
    const handleFileReady = async (fileUrl: string) => {
      if (fileKey) {
        try {
          const token = await getToken(); // <-- Get the auth token

          await axios.patch('/api/save-file', {
            fileKey,
            resultedFile: fileUrl,
            status: 'COMPLETED',
          }, {
              headers: {
                Authorization: `Bearer ${token}`, // <-- Include the token in the headers
              },
          });
          
        } catch (error) {
          console.error('Error saving file:', error);
        }
      } else {
        console.error('fileKey is not available');
      }
    };
  
    const handleButtonClick = () => {
      if (!user) {
        router.push('/sign-in');
        return;
      }
      document.getElementById('file-input')?.click();
    };

    const handleDownloadComplete = () => {
      // Reset all state variables to their initial values
      setExtracting(false);
      setProcessing(false);
      setProgress(0);
      setIsFakeProgress(true);
      setFileKey(null);
      setUniqueId(null);
      setUploadSpeed(0);
      setTimeRemaining(0);
      // Reset any other state variables if necessary
      // Reset the file input's value
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
    };
    
  
    return (
      <div className="mt-6">
        <Modal
          isOpen={showSizeModal}
          onClose={() => setShowSizeModal(false)}
          title="الملف يتجاوز حجمه ١٠ ميجابايت "
          message="الرجاء ضغط الملف من خلال الموقع التالي وأعد تحميله مرة أخرى"
          actionText="ضغط الملف"
          actionLink="https://www.ilovepdf.com/ar/compress_pdf"
        />
        <Modal
          isOpen={showInsufficientCreditsModal}
          onClose={() => setShowInsufficientCreditsModal(false)}
          title="غير كافٍ من عدد الصفحات المتاحة"
          message="ليس لديك عدد صفحات كافٍ لهذا الملف. يرجى ترقية خطتك."
          actionText="ترقية الخطة"
          actionLink="/pricing"
        />
        <Modal
          isOpen={showPageLimitModal}
          onClose={() => setShowPageLimitModal(false)}
          title="تم تجاوز الحد الأقصى للصفحات"
          message="يتجاوز الملف الحد الأقصى المسموح به وهو 500 صفحة. يرجى اختيار ملف يحتوي على عدد أقل من الصفحات."
          actionText="إغلاق"
        />

        {/* <Modal
          isOpen={showInsufficientCreditsModal}
          onClose={() => setShowInsufficientCreditsModal(false)}
          title="Not Enough Page Allowance"
          message="You do not have enough page allowance for this file. Please upgrade your plan."
          actionText="Upgrade Plan"
          actionLink="/pricing"
        />
        <Modal
          isOpen={showPageLimitModal}
          onClose={() => setShowPageLimitModal(false)}
          title="Page Limit Exceeded"
          message="The file exceeds the maximum limit of 500 pages. Please select a file with fewer pages."
          actionText="Close"
        /> */}
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center">
            <div className={`cursor-pointer flex flex-col items-center justify-center border-4 border-dashed border-blue-600 rounded-lg h-48 w-full mid:w-3/4 mb-4 ${
                extracting ? "bg-blue-100" : "bg-white hover:bg-blue-50"
              }`}>
              <input
                ref={fileInputRef}
                id="file-input"
                type="file"
                accept=".pdf, image/*"
                onChange={handleFileChange}
                className="hidden"
                multiple={false}
              />
              <button
                onClick={handleButtonClick}
                className="min-w-[280px] min-h-[80px] bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-opacity-50"
              >
                اختر ملف او صورة
              </button>
            </div>

            <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto">
  {extracting && !processing && (
    <div className="w-full">
     
      <p className="text-gray-500 text-sm mt-4 text-center">
        {progress}% {isFakeProgress ? 'جارٍ التحضير...' : 'تم التحميل'}
      </p>

     
      <progress
        className="responsive-progress-bar w-full mt-4"
        value={progress}
        max="100"
      >
        {progress}%
      </progress>

     
      {!isFakeProgress && (
        <p className="text-gray-500 text-sm mt-4 text-center">
          سرعة التحميل: {uploadSpeed > 0 ? `${uploadSpeed.toFixed(2)} ك.ب / ث` : 'جاري الحساب...'}
          الوقت المتبقي: {timeRemaining > 0 ? `${timeRemaining.toFixed(2)} ثانية` : 'جاري الحساب...'}
        </p>
      )}
    </div>
  )}


  {processing && (
    <div className="w-full">
      <div className="flex flex-col justify-center items-center">
      <Loading></Loading>


        {/* <CustomLoader size={40} color={"#FF6347"} loading={processing} /> */}
      </div>
    </div>
  )}
</div>
            {uniqueId && !extracting && fileKey && (
            <CheckFileAndDownload
              fileKey={fileKey} // Use fileKey from state
              filePath={filePath}
              onFileReady={handleFileReady}
              onDownloadComplete={handleDownloadComplete} // Pass the function here

            />
          )}
          </div>
       
          </div>
        </div>
      
    );
  };
  
  export default Ocr;
  

