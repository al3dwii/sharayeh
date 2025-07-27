"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useProModal } from "@/hooks/useProModal";
import { useAuth } from "@clerk/nextjs";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// 1) Import your user data hook
import { useUserData } from "@/context/UserContext";

// 2) Import CustomModal
import CustomModal from "@/components/custom/CustomModal";
import { ChartPreview } from "@/components/ChartPreview";

export const dynamic = 'force-dynamic';

type File = {
  id: string;
  fileName: string;
  createdAt: string;
  fileUrl: string | null;
  resultedFile: string | null;
  resultedFile2: string | null;
  previewChartUrl?: string | null;
};

export function FileTableWithPagination({ userFiles }: { userFiles: File[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>(userFiles);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>("free"); // local state for tier

  const router = useRouter();
  const onOpen = useProModal((state) => state.onOpen);
  const { getToken } = useAuth();

  // 3) Grab user data from the context
  const userData = useUserData(); 
  // Suppose userData.userTier might be "FREE", "STANDARD", or "PREMIUM"
  // Or "free"/"premium" if you store them in lowercase.

  // 4) Sync local `userTier` state with context
  useEffect(() => {
    if (!userData) {
      // If userData is null or undefined, assume "free"
        setUserTier("free");
        } else {
        const tier = userData.userTier ?? 'FREE';    // fallback if undefined
        setUserTier(tier.toLowerCase());
      }
    }, [userData]);

  // Keep your existing logic for files, etc.
  useEffect(() => {
    console.log("User Files IDs:", userFiles.map((file) => file.id));
    setFiles(userFiles);
  }, [userFiles]);


  const rowsPerPage = 10;
  const totalPages = Math.ceil(files.length / rowsPerPage);
  const currentFiles = files.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 5) Add state for CustomModal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    message: string;
    actionText?: string;
    actionLink?: string;
    iconType?: "success" | "error" | "info";
  } | null>(null);

  // handleApplyMorph function remains the same
  const handleApplyMorph = async (file: File) => {
    if (!file.resultedFile) {
      // Replace toast.error with CustomModal
      setModalContent({
        title: "خطأ",
        message: "الملف غير متاح للمعالجة.",
        iconType: "error",
      });
      setIsCustomModalOpen(true);
      console.log("❌ File unavailable error modal displayed.");
      return;
    }

    try {
      // Indicate that the file is being processed
      setProcessingFiles((prev) => [...prev, file.id]);

      // Optionally, notify the user that processing has started
      setModalContent({
        title: "معالجة الملف",
        message: "بدأت معالجة الملف قد يستغرق الأمر بعض الوقت الرجاء الانتظار.",
        iconType: "success",
      });
      setIsCustomModalOpen(true);
      console.log("ℹ️ Informational modal displayed for processing.");

      // Send a POST request to the API with the resultedFile URL
      const response = await fetch("/api/apply-morph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`, // Include Authorization header
        },
        body: JSON.stringify({ resultedFile: file.resultedFile }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في معالجة الملف.");
      }

      const result = await response.json();

      if (result.success) {
        const { processedFileUrl } = result;
        if (processedFileUrl) {
          // Update the specific file in the state with the new processedFileUrl
          setFiles((prevFiles) =>
            prevFiles.map((f) => {
              if (f.id === file.id) {
                console.log(`Updating resultedFile2 for file id: ${f.id}`); // <-- Added for debugging
                return { ...f, resultedFile2: processedFileUrl };
              }
              return f;
            })
          );
          // Notify user of successful processing
          setModalContent({
            title: "نجاح",
            message: "تمت معالجة الملف بنجاح. يمكنك تحميله الآن.",
            iconType: "success",
          });
          console.log("✅ Success modal displayed.");
        } else {
          throw new Error("عنوان URL للملف المعالج مفقود في الاستجابة.");
        }
      } else {
        throw new Error(result.error || "فشل في معالجة الملف.");
      }
    } catch (error: any) {
      console.error("خطأ في معالجة الملف:", error);
      // Determine error type and display appropriate modal
      let errorType = "unknown-error";

      if (error.message.includes("Network")) {
        errorType = "network-error";
      } else if (error.message.includes("server")) {
        errorType = "server-error";
      } else if (error.message.includes("Invalid")) {
        errorType = "client-error";
      }

      switch (errorType) {
        case "network-error":
          setModalContent({
            title: "خطأ في الشبكة",
            message: "حدث خطأ في الشبكة. يرجى التحقق من اتصالك.",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
          console.log("❌ Network error modal displayed.");
          break;

        case "server-error":
          setModalContent({
            title: "خطأ في الخادم",
            message: "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
          console.log("❌ Server error modal displayed.");
          break;

        case "client-error":
          setModalContent({
            title: "خطأ",
            message: "فشل الإرسال بسبب إدخال غير صالح.",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
          console.log("❌ Client error modal displayed.");
          break;

        default:
          // Generic error modal
          setModalContent({
            title: "خطأ غير متوقع",
            message: "حدث خطأ أثناء معالجة الملف. يرجى المحاولة مرة أخرى.",
            iconType: "error",
          });
          setIsCustomModalOpen(true);
          console.log("❌ Generic error modal displayed.");
          break;
      }
    } finally {
      // Remove the file from the processing state
      setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
    }
  };

  // 6) Updated to check userTier from context 
  const handleApplyMorphWithPremiumCheck = async (file: File) => {
    if (processingFiles.includes(file.id)) return;
    setProcessingFiles((prev) => [...prev, file.id]);

    try {
      // If userTier is "premium", proceed
      if (userTier === "premium") {
        await handleApplyMorph(file);
      } else {
        // If not premium, open the CustomModal instead of ProModal
        setModalContent({
          title: "ترقية الحساب",
          message: "هذه الميزة متاحة فقط للمشتركين المميزين. يرجى ترقية خطتك.",
          actionText: "ترقية الآن",
          actionLink: "/pricing",
          iconType: "info",
        });
        setIsCustomModalOpen(true);
        setError("upgrade-required");
      }
    } catch (error: any) {
      console.error("Error checking user tier:", error);
      setError(error.message || "حدث خطأ غير متوقع.");

      // Display error in the modal
      setModalContent({
        title: "خطأ",
        message: error.message || "حدث خطأ غير متوقع.",
        iconType: "error",
      });
      setIsCustomModalOpen(true);
    } finally {
      setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
    }
  };

  return (
    <div dir="rtl">
      {/* Render CustomModal */}
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

      <div className="rounded-lg border border-gray-300 shadow-md">
        <div className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow className="bg-gray-100 border-b border-gray-300">
                <TableHead className="px-4 py-2 text-right">اسم الملف</TableHead>
                <TableHead className="px-4 py-2 text-right">التاريخ</TableHead>
                <TableHead className="px-4 py-2 text-right">الملف الناتج</TableHead>
                <TableHead className="px-4 py-2 text-right">إضافة الحركات</TableHead>
                <TableHead className="px-4 py-2 text-right">الملف مع الحركات</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {currentFiles.map((file, idx) => (
                <TableRow
                  key={file.id}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 border-b border-gray-300`}
                >
                  <TableCell className="px-6 py-4 text-right font-medium text-gray-900">
                    {file.fileName}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right text-gray-500">
                    {new Date(file.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    {file.resultedFile ? (
                      <a
                        href={file.resultedFile}
                        download
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        تحميل
                      </a>
                    ) : (
                      <p className="text-gray-400">الملف غير جاهز</p>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleApplyMorphWithPremiumCheck(file)}
                      disabled={processingFiles.includes(file.id)}
                      className={`px-3 py-2 rounded-md ${
                        processingFiles.includes(file.id)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
                    >
                      {processingFiles.includes(file.id)
                        ? "جاري المعالجة..."
                        : "إضافة الحركات"}
                    </button>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    {file.resultedFile2 ? (
                      <a
                        href={file.resultedFile2}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        تحميل
                      </a>
                    ) : (
                      <p className="text-gray-400">غير متوفر</p>
                    )}
                  </TableCell>
                  {file.previewChartUrl && (
                    <TableCell className="px-6 py-4 text-right">
                      <ChartPreview url={file.previewChartUrl} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
        >
          السابق
        </button>
        <span className="text-gray-700">
          صفحة {currentPage} من {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
        >
          التالي
        </button>
      </div>
    </div>
  );
}


// "use client";

// import React, { useState, useEffect } from "react";
// import { toast } from "sonner";
// import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
// import { useRouter } from "next/navigation";
// import { useProModal } from "@/hooks/useProModal";
// import { useAuth } from "@clerk/nextjs";
// import {
//   Table,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table";

// // 1) Import your user data hook
// import { useUserData } from "@/context/UserContext";

// export const dynamic = 'force-dynamic';


// type File = {
//   id: string;
//   fileName: string;
//   createdAt: string;
//   fileUrl: string | null;
//   resultedFile: string | null;
//   resultedFile2: string | null;
// };

// export function FileTableWithPagination({ userFiles }: { userFiles: File[] }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [processingFiles, setProcessingFiles] = useState<string[]>([]);
//   const [files, setFiles] = useState<File[]>(userFiles);
//   const [error, setError] = useState<string | null>(null);
//   const [userTier, setUserTier] = useState<string>("free"); // local state for tier

//   const router = useRouter();
//   const onOpen = useProModal((state) => state.onOpen);
//   const { getToken } = useAuth();

//   // 2) Grab user data from the context
//   const userData = useUserData(); 
//   // Suppose userData.userTier might be "FREE", "STANDARD", or "PREMIUM"
//   // Or "free"/"premium" if you store them in lowercase.

//   // 3) Sync local `userTier` state with context
//   useEffect(() => {
//     if (!userData) {
//       // If userData is null or undefined, assume "free"
//       setUserTier("free");
//     } else {
//       // Convert to lowercase (or whichever format you prefer)
//       setUserTier(userData.userTier.toLowerCase() || "free");
//     }
//   }, [userData]);

//   // Keep your existing logic for files, etc.
//   useEffect(() => {
//     console.log("User Files IDs:", userFiles.map((file) => file.id));
//     setFiles(userFiles);
//   }, [userFiles]);


//   const rowsPerPage = 10;
//   const totalPages = Math.ceil(files.length / rowsPerPage);
//   const currentFiles = files.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   const handlePageChange = (page: number) => {
//     if (page > 0 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   // handleApplyMorph function remains the same
//   const handleApplyMorph = async (file: File) => {
//     if (!file.resultedFile) {
//       // Notify user that the file is not available for processing
//       toast.error(
//         <div className="flex justify-between items-center">
//           <span>الملف غير متاح للمعالجة.</span>
//           <button
//             onClick={() => toast.dismiss()}
//             className="ml-4 text-red-800 hover:text-red-900"
//           >
//             X
//           </button>
//         </div>,
//         {
//           position: "top-center",
//           duration: 20000,
//           style: {
//             backgroundColor: "#F8D7DA", // Error red background
//             color: "#721C24", // Error text color
//             border: "1px solid #F5C6CB", // Error border color
//           },
//           icon: <FiAlertCircle color="#721C24" size={24} />,
//         }
//       );
//       console.log("❌ File unavailable error toast displayed.");
//       return;
//     }

//     try {
//       // Indicate that the file is being processed
//       setProcessingFiles((prev) => [...prev, file.id]);

//       // Optionally, notify the user that processing has started
//       toast.info(
//         <div className="flex justify-between items-center">
//           <span>بدأت معالجة الملف.</span>
//           <button
//             onClick={() => toast.dismiss()}
//             className="ml-4 text-blue-800 hover:text-blue-900"
//           >
//             X
//           </button>
//         </div>,
//         {
//           position: "top-center",
//           duration: 10000,
//           style: {
//             backgroundColor: "#D1ECF1", // Info blue background
//             color: "#0C5460", // Info text color
//             border: "1px solid #BEE5EB", // Info border color
//           },
//         }
//       );

//       // Send a POST request to the API with the resultedFile URL
//       const response = await fetch("/api/apply-morph", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${await getToken()}`, // Include Authorization header
//         },
//         body: JSON.stringify({ resultedFile: file.resultedFile }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "فشل في معالجة الملف.");
//       }

//       const result = await response.json();

//       if (result.success) {
//         const { processedFileUrl } = result;
//         if (processedFileUrl) {
//           // Update the specific file in the state with the new processedFileUrl
//           setFiles((prevFiles) =>
//             prevFiles.map((f) => {
//               if (f.id === file.id) {
//                 console.log(`Updating resultedFile2 for file id: ${f.id}`); // <-- Added for debugging
//                 return { ...f, resultedFile2: processedFileUrl };
//               }
//               return f;
//             })
//           );
//           // Notify user of successful processing
//           toast.success(
//             <div className="flex justify-between items-center">
//               <span>تمت معالجة الملف بنجاح. يمكنك تحميله الآن.</span>
//               <button
//                 onClick={() => toast.dismiss()}
//                 className="ml-4 text-green-800 hover:text-green-900"
//               >
//                 X
//               </button>
//             </div>,
//             {
//               position: "top-center",
//               duration: 20000,
//               style: {
//                 backgroundColor: "#D4EDDA", // Success green background
//                 color: "#155724", // Success text color
//                 border: "1px solid #C3E6CB", // Success border color
//               },
//               icon: <FiCheckCircle color="#155724" size={24} />,
//             }
//           );
//           console.log("✅ Success toast displayed.");
//         } else {
//           throw new Error("عنوان URL للملف المعالج مفقود في الاستجابة.");
//         }
//       } else {
//         throw new Error(result.error || "فشل في معالجة الملف.");
//       }
//     } catch (error: any) {
//       console.error("خطأ في معالجة الملف:", error);
//       // Determine error type and display appropriate toast
//       let errorType = "unknown-error";

//       if (error.message.includes("Network")) {
//         errorType = "network-error";
//       } else if (error.message.includes("server")) {
//         errorType = "server-error";
//       } else if (error.message.includes("Invalid")) {
//         errorType = "client-error";
//       }

//       switch (errorType) {
//         case "network-error":
//           toast.error(
//             <div className="flex justify-between items-center">
//               <span>حدث خطأ في الشبكة. يرجى التحقق من اتصالك.</span>
//               <button
//                 onClick={() => toast.dismiss()}
//                 className="ml-4 text-red-800 hover:text-red-900"
//               >
//                 X
//               </button>
//             </div>,
//             {
//               position: "top-center",
//               duration: 20000,
//               style: {
//                 backgroundColor: "#F8D7DA", // Error red background
//                 color: "#721C24", // Error text color
//                 border: "1px solid #F5C6CB", // Error border color
//               },
//               icon: <FiAlertCircle color="#721C24" size={24} />,
//             }
//           );
//           console.log("❌ Network error toast displayed.");
//           break;

//         case "server-error":
//           toast.error(
//             <div className="flex justify-between items-center">
//               <span>حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.</span>
//               <button
//                 onClick={() => toast.dismiss()}
//                 className="ml-4 text-red-800 hover:text-red-900"
//               >
//                 X
//               </button>
//             </div>,
//             {
//               position: "top-center",
//               duration: 20000,
//               style: {
//                 backgroundColor: "#F8D7DA", // Error red background
//                 color: "#721C24", // Error text color
//                 border: "1px solid #F5C6CB", // Error border color
//               },
//               icon: <FiAlertCircle color="#721C24" size={24} />,
//             }
//           );
//           console.log("❌ Server error toast displayed.");
//           break;

//         case "client-error":
//           toast.error(
//             <div className="flex justify-between items-center">
//               <span>فشل الإرسال بسبب إدخال غير صالح.</span>
//               <button
//                 onClick={() => toast.dismiss()}
//                 className="ml-4 text-red-800 hover:text-red-900"
//               >
//                 X
//               </button>
//             </div>,
//             {
//               position: "top-center",
//               duration: 20000,
//               style: {
//                 backgroundColor: "#F8D7DA", // Error red background
//                 color: "#721C24", // Error text color
//                 border: "1px solid #F5C6CB", // Error border color
//               },
//               icon: <FiAlertCircle color="#721C24" size={24} />,
//             }
//           );
//           console.log("❌ Client error toast displayed.");
//           break;

//         default:
//           // Generic error toast
//           toast.error(
//             <div className="flex justify-between items-center">
//               <span>حدث خطأ أثناء معالجة الملف. يرجى المحاولة مرة أخرى.</span>
//               <button
//                 onClick={() => toast.dismiss()}
//                 className="ml-4 text-red-800 hover:text-red-900"
//               >
//                 X
//               </button>
//             </div>,
//             {
//               position: "top-center",
//               duration: 20000,
//               style: {
//                 backgroundColor: "#F8D7DA", // Error red background
//                 color: "#721C24", // Error text color
//                 border: "1px solid #F5C6CB", // Error border color
//               },
//               icon: <FiAlertCircle color="#721C24" size={24} />,
//             }
//           );
//           console.log("❌ Generic error toast displayed.");
//           break;
//       }
//     } finally {
//       // Remove the file from the processing state
//       setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
//     }
//   };

//   // 4) Updated to check userTier from context 
//   const handleApplyMorphWithPremiumCheck = async (file: File) => {
//     if (processingFiles.includes(file.id)) return;
//     setProcessingFiles((prev) => [...prev, file.id]);

//     try {
//       // If userTier is "premium", proceed
//       if (userTier === "premium") {
//         await handleApplyMorph(file);
//       } else {
//         // If not premium, open the ProModal
//         onOpen();
//         setError("upgrade-required");

//         toast.info(
//           <div className="flex justify-between items-center">
//             <span>هذه الميزة متاحة فقط للمشتركين المميزين. يرجى ترقية خطتك.</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="ml-4 text-blue-800 hover:text-blue-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: "top-center",
//             duration: 20000,
//             style: {
//               backgroundColor: "#D1ECF1", // Info blue background
//               color: "#0C5460", // Info text color
//               border: "1px solid #BEE5EB", // Info border color
//             },
//           }
//         );
//         console.log("ℹ️ Informational toast displayed for upgrade.");
//       }
//     } catch (error: any) {
//       console.error("Error checking user tier:", error);
//       setError(error.message || "حدث خطأ غير متوقع.");

//       toast.error(
//         <div className="flex justify-between items-center">
//           <span>{error.message || "حدث خطأ غير متوقع."}</span>
//           <button
//             onClick={() => toast.dismiss()}
//             className="ml-4 text-red-800 hover:text-red-900"
//           >
//             X
//           </button>
//         </div>,
//         {
//           position: "top-center",
//           duration: 20000,
//           style: {
//             backgroundColor: "#F8D7DA",
//             color: "#721C24",
//             border: "1px solid #F5C6CB",
//           },
//           icon: <FiAlertCircle color="#721C24" size={24} />,
//         }
//       );
//     } finally {
//       setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
//     }
//   };

//   return (
//     <div dir="rtl">
//       <div className="rounded-lg border border-gray-300 shadow-md">
//         <div className="overflow-x-auto">
//           <Table className="min-w-full divide-y divide-gray-200">
//             <TableHeader>
//               <TableRow className="bg-gray-100 border-b border-gray-300">
//                 <TableHead className="px-4 py-2 text-right">اسم الملف</TableHead>
//                 <TableHead className="px-4 py-2 text-right">التاريخ</TableHead>
//                 <TableHead className="px-4 py-2 text-right">الملف الناتج</TableHead>
//                 <TableHead className="px-4 py-2 text-right">إضافة الحركات</TableHead>
//                 <TableHead className="px-4 py-2 text-right">الملف مع الحركات</TableHead>
//               </TableRow>
//             </TableHeader>
//             <tbody>
//               {currentFiles.map((file, idx) => (
//                 <TableRow
//                   key={file.id}
//                   className={`${
//                     idx % 2 === 0 ? "bg-white" : "bg-gray-50"
//                   } hover:bg-gray-100 border-b border-gray-300`}
//                 >
//                   <TableCell className="px-6 py-4 text-right font-medium text-gray-900">
//                     {file.fileName}
//                   </TableCell>
//                   <TableCell className="px-6 py-4 text-right text-gray-500">
//                     {new Date(file.createdAt).toLocaleString()}
//                   </TableCell>
//                   <TableCell className="px-6 py-4 text-right">
//                     {file.resultedFile ? (
//                       <a
//                         href={file.resultedFile}
//                         download
//                         className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                       >
//                         تحميل
//                       </a>
//                     ) : (
//                       <p className="text-gray-400">الملف غير جاهز</p>
//                     )}
//                   </TableCell>
//                   <TableCell className="px-6 py-4 text-right">
//                     <button
//                       onClick={() => handleApplyMorphWithPremiumCheck(file)}
//                       disabled={processingFiles.includes(file.id)}
//                       className={`px-3 py-2 rounded-md ${
//                         processingFiles.includes(file.id)
//                           ? "bg-gray-400 cursor-not-allowed"
//                           : "bg-green-600 text-white hover:bg-green-700"
//                       } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
//                     >
//                       {processingFiles.includes(file.id)
//                         ? "جاري المعالجة..."
//                         : "إضافة الحركات"}
//                     </button>
//                   </TableCell>
//                   <TableCell className="px-6 py-4 text-right">
//                     {file.resultedFile2 ? (
//                       <a
//                         href={file.resultedFile2}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                       >
//                         تحميل
//                       </a>
//                     ) : (
//                       <p className="text-gray-400">غير متوفر</p>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </tbody>
//           </Table>
//         </div>
//       </div>

//       {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

//       {/* Pagination Controls */}
//       <div className="flex justify-center items-center gap-4 mt-4">
//         <button
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//         >
//           السابق
//         </button>
//         <span className="text-gray-700">
//           صفحة {currentPage} من {totalPages}
//         </span>
//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//         >
//           التالي
//         </button>
//       </div>
//     </div>
//   );
// }
