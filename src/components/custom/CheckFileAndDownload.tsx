import { useRouter } from 'next/navigation'; // For Next.js 14 useRouter
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Loading from '@/components/global/loading';

interface CheckFileProps {
  fileKey: string;
  filePath: string;
  interval?: number;
  onFileReady: (fileUrl: string) => void;
  onDownloadComplete: () => void; // Add this line

}

const CheckFileAndDownload: React.FC<CheckFileProps> = ({
  fileKey,
  filePath,
  interval = 3000,
  onFileReady,
  onDownloadComplete, // Destructure prop

}) => {
  const [isFileReady, setIsFileReady] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [fileDownloaded, setFileDownloaded] = useState<boolean>(false);
  const router = useRouter();

  // Memoize checkFileStatus function to avoid recreating it on every render
  const checkFileStatus = useCallback(async () => {
    try {
      console.log('Checking file status for:', fileKey);

      // API call to check file status
      const response = await axios.get('/api/check-file-status', {
        params: { filePath },
      });

      // If the file is ready, update the state accordingly
      if (response.data.success && response.data.status === 'ready') {
        const downloadUrl = `https://storage.googleapis.com/tablesb/${filePath}`;
        setIsFileReady(true);
        setDownloadUrl(downloadUrl);
        setLoading(false);
        onFileReady(downloadUrl);
      }
    } catch (error) {
      console.error('Error checking file status:', error);
      setIsFileReady(false);
      setLoading(true);
    }
  }, [fileKey, filePath, onFileReady]); // Dependencies of checkFileStatus

  // Poll the file status at a defined interval
  useEffect(() => {
    if (!isFileReady) {
      const intervalId = setInterval(async () => {
        await checkFileStatus();
        if (isFileReady) {
          clearInterval(intervalId);
        }
      }, interval);

      // Cleanup the interval when the component is unmounted or the file becomes ready
      return () => clearInterval(intervalId);
    }
  }, [checkFileStatus, interval, isFileReady]);

  const handleDownload = async () => {
    // Programmatically trigger file download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    setFileDownloaded(true);
  
    // Revalidate any cached data if necessary
    await axios.post('/api/revalidate');
  
    // Call the onDownloadComplete callback
    if (onDownloadComplete) {
      onDownloadComplete();
    }
    // Refresh the current route
  // router.refresh();

  };
  
   

  return (
    <div>
      {/* Loading spinner and waiting message */}
      {loading && !isFileReady ? (
        <div className="flex flex-col justify-center items-center">
          <Loading />
          <p className="text-gray-500 text-sm mt-8">
            يتم تحويل النصوص والجداول إلى ملف وورد .... الرجاء الانتظار
          </p>
        </div>
      ) : (
        // Show the download button when the file is ready
        isFileReady &&
        !fileDownloaded && (
          <div>
            <p>الملف جاهز للتحميل</p>
            <button
              onClick={handleDownload}
              className="mt-4 inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              حمل الملف
            </button>
          </div>
        )
      )}

      {/* Message after the file is downloaded */}
      {fileDownloaded && (
        <div>
          <p>تم تحميل الملف بنجاح!</p>
        </div>
      )}
    </div>
  );
};

export default CheckFileAndDownload;


// import { useRouter } from 'next/navigation'; // For Next.js 14 useRouter
// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import Loading from '@/components/global/loading'


// interface CheckFileProps {
//   fileKey: string;
//   filePath: string;
//   interval?: number;
//   onFileReady: (fileUrl: string) => void;
// }

// const CheckFileAndDownload: React.FC<CheckFileProps> = ({ fileKey, filePath, interval = 3000, onFileReady }) => {
//   const [isFileReady, setIsFileReady] = useState<boolean>(false);
//   const [downloadUrl, setDownloadUrl] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(true);
//   const [fileDownloaded, setFileDownloaded] = useState<boolean>(false);
//   const router = useRouter();

//   // Memoize checkFileStatus function to avoid recreating it on every render
//   const checkFileStatus = useCallback(async () => {
//     try {
//       console.log('Checking file status for:', fileKey);

//       // API call to check file status
//       const response = await axios.get('/api/check-file-status', {
//         params: { filePath },
//       });

//       // If the file is ready, update the state accordingly
//       if (response.data.success && response.data.status === 'ready') {
//         const downloadUrl = `https://storage.googleapis.com/tablesb/${filePath}`;
//         setIsFileReady(true);
//         setDownloadUrl(downloadUrl);
//         setLoading(false);
//         onFileReady(downloadUrl);
//       }
//     } catch (error) {
//       console.error('Error checking file status:', error);
//       setIsFileReady(false);
//       setLoading(true);
//     }
//   }, [fileKey, filePath, onFileReady]); // Dependencies of checkFileStatus

//   // Poll the file status at a defined interval
//   useEffect(() => {
//     if (!isFileReady) {
//       const intervalId = setInterval(async () => {
//         await checkFileStatus();
//         if (isFileReady) {
//           clearInterval(intervalId);
//         }
//       }, interval);

//       // Cleanup the interval when the component is unmounted or the file becomes ready
//       return () => clearInterval(intervalId);
//     }
//   }, [checkFileStatus, interval, isFileReady]);

//   const handleDownload = async () => {
//     setFileDownloaded(true);

//     // Revalidate any cached data if necessary
//     await axios.post('/api/revalidate');

//     // Navigate to the dashboard after download is complete to reload the whole page
//     setTimeout(() => {
//       router.push('/dashboard');
//     }, 1000);
//   };

//   return (
//     <div>
//       {/* Loading spinner and waiting message */}
//       {loading && !isFileReady ? (
//         <div className="flex flex-col justify-center items-center">
//                     <Loading></Loading>

//           {/* <CustomLoader size={40} color={"#FF6347"} loading={loading} /> */}
//           <p className="text-gray-500 text-sm mt-8">
//             يتم تحويل النصوص والجداول إلى ملف وورد .... الرجاء الانتظار
//           </p>
//         </div>
//       ) : (
//         // Show the download button when the file is ready
//         isFileReady && !fileDownloaded && (
//           <div>
//             <p>الملف جاهز للتحميل</p>
//             <a
//               href={downloadUrl}
//               onClick={handleDownload}
//               className="mt-4 inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
//               download
//             >
//               حمل الملف
//             </a>
//           </div>
//         )
//       )}

//       {/* Message after the file is downloaded */}
//       {fileDownloaded && (
//         <div>
//           <p>تم تحميل الملف بنجاح!</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CheckFileAndDownload;


// import { useRouter } from 'next/navigation'; // For Next.js 14 useRouter
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// import CustomLoader from './loader';


// interface CheckFileProps {
//   fileKey: string; // The unique identifier for the file (fileKey)
//   filePath: string; // The full file path in the storage bucket
//   interval?: number; // Polling interval in milliseconds (default is 5000ms)
//   onFileReady: (fileUrl: string) => void; // Callback when the file is ready
// }

// const CheckFileAndDownload: React.FC<CheckFileProps> = ({ fileKey, filePath, interval = 3000, onFileReady }) => {
//   const [isFileReady, setIsFileReady] = useState<boolean>(false); // Track whether the file is ready
//   const [downloadUrl, setDownloadUrl] = useState<string>(''); // Store the download URL
//   const [loading, setLoading] = useState<boolean>(true); // Track the loading state
//   const [fileDownloaded, setFileDownloaded] = useState<boolean>(false); // Track if the file has been downloaded
//   const router = useRouter(); // For refreshing the page

//   // Function to check file status
//   const checkFileStatus = async () => {
//     try {
//       console.log('Checking file status for:', fileKey);

//       // API call to check file status
//       const response = await axios.get('/api/check-file-status', {
//         params: { filePath }, // Send the filePath as a parameter
//       });

//       // If the file is ready, update the state accordingly
//       if (response.data.success && response.data.status === 'ready') {
//         const downloadUrl = `https://storage.googleapis.com/tablesb/${filePath}`;
//         setIsFileReady(true);
//         setDownloadUrl(downloadUrl); // Set the download URL
//         setLoading(false); // Stop the loading indicator
//         onFileReady(downloadUrl); // Trigger the callback with the download URL
//       }
//     } catch (error) {
//       console.error('Error checking file status:', error);
//       setIsFileReady(false); // In case of an error, assume the file is not ready
//       setLoading(true); // Keep the loading state active
//     }
//   };

//   // Poll the file status at a defined interval
//   useEffect(() => {
//     if (!isFileReady) {
//       const intervalId = setInterval(async () => {
//         await checkFileStatus();
//         if (isFileReady) {
//           clearInterval(intervalId); // Stop polling when the file is ready
//         }
//       }, interval);

//       // Cleanup the interval when the component is unmounted or the file becomes ready
//       return () => clearInterval(intervalId);
//     }
//   }, [filePath, interval, isFileReady, ]);

//   // // Handle file download
//   // const handleDownload = async () => {
//   //   setFileDownloaded(true); // Mark the file as downloaded

//   //   // Revalidate any cached data (optional, depending on your setup)
//   //   await axios.post('/api/revalidate');

//   //   // Refresh the page to update the state
//   //   router.refresh();

//   //   // Reset the state after 3 seconds
   
//   // };


//   const handleDownload = async () => {
//     setFileDownloaded(true); // Mark the file as downloaded
  
//     // Revalidate any cached data if necessary
//     await axios.post('/api/revalidate');

//     // Navigate to the dashboard after download is complete to reload the whole page
//   setTimeout(() => {
//     router.push('/dashboard'); // Redirect to the dashboard
//   }, 1000); // Adjust the delay if needed
  
  
//   };
  

 

//   return (
//     <div>
//       {/* Loading spinner and waiting message */}
//       {loading && !isFileReady ? (
//         <div className="flex flex-col justify-center items-center">
//         <CustomLoader size={40} color={"#FF6347"} loading={loading} />

//           {/* <ClipLoader size={50} color={"#123abc"} loading={loading} /> */}
//           <p className="text-gray-500 text-sm mt-8">
//             يتم تحويل النصوص والجداول إلى ملف وورد .... الرجاء الانتظار
//           </p>
//         </div>
//       ) : (
//         // Show the download button when the file is ready
//         isFileReady && !fileDownloaded && (
//           <div>
//             <p>الملف جاهز للتحميل</p>
//             <a
//               href={downloadUrl}
//               onClick={handleDownload}
//               className="mt-4 inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
//               download
//             >
//               حمل الملف
//             </a>
//           </div>
//         )
//       )}

//       {/* Message after the file is downloaded */}
//       {fileDownloaded && (
//         <div>
//           <p>تم تحميل الملف بنجاح!</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CheckFileAndDownload;


