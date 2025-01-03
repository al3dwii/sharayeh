// /src/components/custom/FileTableWithPagination.tsx

"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner"; // Ensure toast is imported
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi"; // Import necessary icons
import { useRouter } from "next/navigation"; // For client-side navigation
import { useProModal } from "@/hooks/useProModal"; // Import the Zustand store

import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

type File = {
  id: string;
  fileName: string;
  createdAt: string;
  fileUrl: string | null;
  resultedFile: string | null;
  resultedFile2: string | null;
};

export function FileTableWithPagination({ userFiles }: { userFiles: File[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>(userFiles); // Initialize with userFiles
  const [error, setError] = useState<string | null>(null); // State to handle errors

  const router = useRouter(); // For navigation
  const onOpen = useProModal((state) => state.onOpen); // Access modal controls

  useEffect(() => {
    console.log("User Files IDs:", userFiles.map((file) => file.id)); // <-- Added for debugging
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

  // Existing handleApplyMorph logic
  const handleApplyMorph = async (file: File) => {
    if (!file.resultedFile) {
      // Notify user that the file is not available for processing
      toast.error(
        <div className="flex justify-between items-center">
          <span>الملف غير متاح للمعالجة.</span>
          <button
            onClick={() => toast.dismiss()}
            className="ml-4 text-red-800 hover:text-red-900"
          >
            X
          </button>
        </div>,
        {
          position: "top-center",
          duration: 20000,
          style: {
            backgroundColor: "#F8D7DA", // Error red background
            color: "#721C24", // Error text color
            border: "1px solid #F5C6CB", // Error border color
          },
          icon: <FiAlertCircle color="#721C24" size={24} />,
        }
      );
      console.log("❌ File unavailable error toast displayed.");
      return;
    }

    try {
      // Indicate that the file is being processed
      setProcessingFiles((prev) => [...prev, file.id]);

      // Optionally, notify the user that processing has started
      toast.info(
        <div className="flex justify-between items-center">
          <span>بدأت معالجة الملف.</span>
          <button
            onClick={() => toast.dismiss()}
            className="ml-4 text-blue-800 hover:text-blue-900"
          >
            X
          </button>
        </div>,
        {
          position: "top-center",
          duration: 10000,
          style: {
            backgroundColor: "#D1ECF1", // Info blue background
            color: "#0C5460", // Info text color
            border: "1px solid #BEE5EB", // Info border color
          },
        }
      );

      // Send a POST request to the API with the resultedFile URL
      const response = await fetch("/api/apply-morph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
          toast.success(
            <div className="flex justify-between items-center">
              <span>تمت معالجة الملف بنجاح. يمكنك تحميله الآن.</span>
              <button
                onClick={() => toast.dismiss()}
                className="ml-4 text-green-800 hover:text-green-900"
              >
                X
              </button>
            </div>,
            {
              position: "top-center",
              duration: 20000,
              style: {
                backgroundColor: "#D4EDDA", // Success green background
                color: "#155724", // Success text color
                border: "1px solid #C3E6CB", // Success border color
              },
              icon: <FiCheckCircle color="#155724" size={24} />,
            }
          );
          console.log("✅ Success toast displayed.");
        } else {
          throw new Error("عنوان URL للملف المعالج مفقود في الاستجابة.");
        }
      } else {
        throw new Error(result.error || "فشل في معالجة الملف.");
      }
    } catch (error: any) {
      console.error("خطأ في معالجة الملف:", error);
      // Determine error type and display appropriate toast
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
              position: "top-center",
              duration: 20000,
              style: {
                backgroundColor: "#F8D7DA", // Error red background
                color: "#721C24", // Error text color
                border: "1px solid #F5C6CB", // Error border color
              },
              icon: <FiAlertCircle color="#721C24" size={24} />,
            }
          );
          console.log("❌ Network error toast displayed.");
          break;

        case "server-error":
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
              position: "top-center",
              duration: 20000,
              style: {
                backgroundColor: "#F8D7DA", // Error red background
                color: "#721C24", // Error text color
                border: "1px solid #F5C6CB", // Error border color
              },
              icon: <FiAlertCircle color="#721C24" size={24} />,
            }
          );
          console.log("❌ Server error toast displayed.");
          break;

        case "client-error":
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
              position: "top-center",
              duration: 20000,
              style: {
                backgroundColor: "#F8D7DA", // Error red background
                color: "#721C24", // Error text color
                border: "1px solid #F5C6CB", // Error border color
              },
              icon: <FiAlertCircle color="#721C24" size={24} />,
            }
          );
          console.log("❌ Client error toast displayed.");
          break;

        default:
          // Generic error toast
          toast.error(
            <div className="flex justify-between items-center">
              <span>حدث خطأ أثناء معالجة الملف. يرجى المحاولة مرة أخرى.</span>
              <button
                onClick={() => toast.dismiss()}
                className="ml-4 text-red-800 hover:text-red-900"
              >
                X
              </button>
            </div>,
            {
              position: "top-center",
              duration: 20000,
              style: {
                backgroundColor: "#F8D7DA", // Error red background
                color: "#721C24", // Error text color
                border: "1px solid #F5C6CB", // Error border color
              },
              icon: <FiAlertCircle color="#721C24" size={24} />,
            }
          );
          console.log("❌ Generic error toast displayed.");
          break;
      }
    } finally {
      // Remove the file from the processing state
      setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
    }
  };

  // New handler function to integrate premium check
  const handleApplyMorphWithPremiumCheck = async (file: File) => {
    // Prevent duplicate processing
    if (processingFiles.includes(file.id)) return;

    // Add file to processing state
    setProcessingFiles((prev) => [...prev, file.id]);

    try {
      // Call the API to check user tier
      const response = await fetch("/api/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated, redirect to login
          router.push("/login");
          return;
        }
        // Handle other HTTP errors
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في فحص حالة المستخدم.");
      }

      const data = await response.json();
      const { userTier } = data;

      if (userTier === "premium") {
        // User is premium, proceed with applying morph
        await handleApplyMorph(file);
      } else {
        // User is not premium, open the ProModal to prompt upgrade
        onOpen();
      }
    } catch (error: any) {
      console.error("Error checking user tier:", error);
      setError(error.message || "حدث خطأ غير متوقع.");
      // Optionally, display an error toast
      toast.error(
        <div className="flex justify-between items-center">
          <span>{error.message || "حدث خطأ غير متوقع."}</span>
          <button
            onClick={() => toast.dismiss()}
            className="ml-4 text-red-800 hover:text-red-900"
          >
            X
          </button>
        </div>,
        {
          position: "top-center",
          duration: 20000,
          style: {
            backgroundColor: "#F8D7DA", // Error red background
            color: "#721C24", // Error text color
            border: "1px solid #F5C6CB", // Error border color
          },
          icon: <FiAlertCircle color="#721C24" size={24} />,
        }
      );
    } finally {
      // Remove the file from the processing state if it wasn't added by handleApplyMorph
      setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
    }
  };

  return (
    <div dir="rtl">
      {/* Improved border design */}
      <div className="rounded-lg border border-gray-300 shadow-md">
        <div className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200">
            {/* <TableCaption className="text-gray-700 font-semibold">ملفاتك</TableCaption> */}
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
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Display error message if any */}
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

// // /src/components/custom/FileTableWithPagination.tsx

// "use client";

// import React, { useState, useEffect } from "react";
// import { toast } from "sonner"; // Ensure toast is imported
// import { FiAlertCircle, FiCheckCircle } from "react-icons/fi"; // Import necessary icons
// import { useRouter } from "next/navigation"; // For client-side navigation
// import { useProModal } from "@/hooks/useProModal"; // Import the Zustand store

// import {
//   Table,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table";

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
//   const [files, setFiles] = useState<File[]>(userFiles); // Initialize with userFiles
//   const [error, setError] = useState<string | null>(null); // State to handle errors

//   const router = useRouter(); // For navigation
//   const onOpen = useProModal((state) => state.onOpen); // Access modal controls

//   useEffect(() => {
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

//   // Existing handleApplyMorph logic
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
//             prevFiles.map((f) =>
//               f.id === file.id ? { ...f, resultedFile2: processedFileUrl } : f
//             )
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

//   // New handler function to integrate premium check
//   const handleApplyMorphWithPremiumCheck = async (file: File) => {
//     // Prevent duplicate processing
//     if (processingFiles.includes(file.id)) return;

//     // Add file to processing state
//     setProcessingFiles((prev) => [...prev, file.id]);

//     try {
//       // Call the API to check user tier
//       const response = await fetch("/api/status", {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include", // Send cookies for authentication
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           // User is not authenticated, redirect to login
//           router.push("/login");
//           return;
//         }
//         // Handle other HTTP errors
//         const errorData = await response.json();
//         throw new Error(errorData.error || "فشل في فحص حالة المستخدم.");
//       }

//       const data = await response.json();
//       const { userTier } = data;

//       if (userTier === "premium") {
//         // User is premium, proceed with applying morph
//         await handleApplyMorph(file);
//       } else {
//         // User is not premium, open the ProModal to prompt upgrade
//         onOpen();
//       }
//     } catch (error: any) {
//       console.error("Error checking user tier:", error);
//       setError(error.message || "حدث خطأ غير متوقع.");
//       // Optionally, display an error toast
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
//             backgroundColor: "#F8D7DA", // Error red background
//             color: "#721C24", // Error text color
//             border: "1px solid #F5C6CB", // Error border color
//           },
//           icon: <FiAlertCircle color="#721C24" size={24} />,
//         }
//       );
//     } finally {
//       // Remove the file from the processing state if it wasn't added by handleApplyMorph
//       setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
//     }
//   };

//   return (
//     <div dir="rtl">
//       {/* Improved border design */}
//       <div className="rounded-lg border border-gray-300 shadow-md">
//         <div className="overflow-x-auto">
//           <Table className="min-w-full divide-y divide-gray-200">
//             {/* <TableCaption className="text-gray-700 font-semibold">ملفاتك</TableCaption> */}
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

//       {/* Display error message if any */}
//       {error && (
//         <p className="text-red-500 mt-2 text-center">{error}</p>
//       )}

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


// // /src/components/custom/FileTableWithPagination.tsx
// "use client";

// import { toast } from "sonner"; // Ensure toast is imported
// import { FiAlertCircle, FiCheckCircle } from "react-icons/fi"; // Import necessary icons

// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table";

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
//   const [files, setFiles] = useState<File[]>(userFiles); // Initialize with userFiles
//   const [error, setError] = useState<string | null>(null); // State to handle errors

//   useEffect(() => {
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
//       // Uncomment the lines below if you want to inform the user when processing begins
      
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
//           // icon: <FiInfo color="#0C5460" size={24} />, // Ensure to import FiInfo if used
//         }
//       );
      

//       // Send a POST request to the API with the resultedFile URL
//       const response = await fetch("/api/apply-morph", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
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
//             prevFiles.map((f) =>
//               f.id === file.id ? { ...f, resultedFile2: processedFileUrl } : f
//             )
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
//       // For demonstration, we'll categorize based on error message
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

//   return (
//     <div dir="rtl">
//       {/* Improved border design */}
//       <div className="rounded-lg border border-gray-300 shadow-md">
//         <div className="overflow-x-auto">
//           <Table className="min-w-full divide-y divide-gray-200">
//             {/* <TableCaption className="text-gray-700 font-semibold">ملفاتك</TableCaption> */}
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
//                       onClick={() => handleApplyMorph(file)}
//                       disabled={processingFiles.includes(file.id)}
//                       className={`px-3 py-2 rounded-md ${
//                         processingFiles.includes(file.id)
//                           ? "bg-gray-400 cursor-not-allowed"
//                           : "bg-green-600 text-white hover:bg-green-700"
//                       } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
//                     >
//                       {processingFiles.includes(file.id) ? "جاري المعالجة..." : "إضافة الحركات"}
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



// // /src/components/custom/FileTableWithPagination.tsx
// "use client";

// import { toast } from "sonner"; // Ensure toast is imported

// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table";

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
//   const [files, setFiles] = useState<File[]>(userFiles); // Initialize with userFiles
//   const [error, setError] = useState<string | null>(null); // State to handle errors

//   useEffect(() => {
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

//   const handleApplyMorph = async (file: File) => {
//     if (!file.resultedFile) {
//       // Notify user that the file is not available for processing
//       toast.error("الملف غير متاح للمعالجة.");
//       return;
//     }

//     try {
//       // Indicate that the file is being processed
//       setProcessingFiles((prev) => [...prev, file.id]);

//       // Optional: Notify the user that processing has started
//       // Uncomment the line below if you want to inform the user when processing begins
//       toast.info("بدأت معالجة الملف.");

//       // Send a POST request to the API with the resultedFile URL
//       const response = await fetch("/api/apply-morph", {
//         method: "POST",
//         headers: {
//           'Content-Type': 'application/json',
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
//             prevFiles.map((f) =>
//               f.id === file.id ? { ...f, resultedFile2: processedFileUrl } : f
//             )
//           );
//           // Notify user of successful processing
//           toast.success("تمت معالجة الملف بنجاح. يمكنك تحميله الآن.");
//         } else {
//           throw new Error("عنوان URL للملف المعالج مفقود في الاستجابة.");
//         }
//       } else {
//         throw new Error(result.error || "فشل في معالجة الملف.");
//       }
//     } catch (error: any) { // Specify 'any' type for better error property access
//       console.error("خطأ في معالجة الملف:", error);
//       // Notify user of the error
//       toast.error(`خطأ في معالجة الملف: ${error.message}`);
//     } finally {
//       // Remove the file from the processing state
//       setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
//     }
//   };

//   return (
//     <div dir="rtl">
//       {/* Improved border design */}
//       <div className="rounded-lg border border-gray-300 shadow-md">
//         <div className="overflow-x-auto">
//           <Table className="min-w-full divide-y divide-gray-200">
//             {/* <TableCaption className="text-gray-700 font-semibold">ملفاتك</TableCaption> */}
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
//                       onClick={() => handleApplyMorph(file)}
//                       disabled={processingFiles.includes(file.id)}
//                       className={`px-3 py-2 rounded-md ${
//                         processingFiles.includes(file.id)
//                           ? "bg-gray-400 cursor-not-allowed"
//                           : "bg-green-600 text-white hover:bg-green-700"
//                       } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
//                     >
//                       {processingFiles.includes(file.id) ? "جاري المعالجة..." : "إضافة الحركات"}
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





// // /src/components/custom/FileTableWithPagination.tsx
// "use client";

// import { toast } from "sonner"; // Ensure toast is imported


// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table";

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
//   const [files, setFiles] = useState<File[]>(userFiles); // Initialize with userFiles
//   const [error, setError] = useState<string | null>(null); // State to handle errors

//   useEffect(() => {
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

//   const handleApplyMorph = async (file: File) => {
//     if (!file.resultedFile) {
//       // Replace alert with toast
//       toast.error("الملف غير متاح للمعالجة.");
//       return;
//     }

//     try {
//       // Indicate that the file is being processed
//       setProcessingFiles((prev) => [...prev, file.id]);

//       // Send a POST request to the API with the resultedFile URL
//       const response = await fetch("/api/apply-morph", {
//         method: "POST",
//         headers: {
//           'Content-Type': 'application/json',
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
//             prevFiles.map((f) =>
//               f.id === file.id ? { ...f, resultedFile2: processedFileUrl } : f
//             )
//           );
//           // Replace alert with toast
//           toast.success("تمت معالجة الملف بنجاح. يمكنك تحميله الآن.");
//         } else {
//           throw new Error("عنوان URL للملف المعالج مفقود في الاستجابة.");
//         }
//       } else {
//         throw new Error(result.error || "فشل في معالجة الملف.");
//       }
//     } catch (error: any) { // Specify 'any' type for better error property access
//       console.error("خطأ في معالجة الملف:", error);
//       // Replace alert with toast
//       toast.error(`خطأ في معالجة الملف: ${error.message}`);
//     } finally {
//       // Remove the file from the processing state
//       setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
//     }
//   };

//   return (
//     <div dir="rtl">
//       {/* Improved border design */}
//       <div className="rounded-lg border border-gray-300 shadow-md">
//         <div className="overflow-x-auto">
//           <Table className="min-w-full divide-y divide-gray-200">
//             {/* <TableCaption className="text-gray-700 font-semibold">ملفاتك</TableCaption> */}
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
//                       onClick={() => handleApplyMorph(file)}
//                       disabled={processingFiles.includes(file.id)}
//                       className={`px-3 py-2 rounded-md ${
//                         processingFiles.includes(file.id)
//                           ? "bg-gray-400 cursor-not-allowed"
//                           : "bg-green-600 text-white hover:bg-green-700"
//                       } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
//                     >
//                       {processingFiles.includes(file.id) ? "جاري المعالجة..." : "إضافة الحركات"}
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



// // /src/components/custom/FileTableWithPagination.tsx

// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table";

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
//   const [files, setFiles] = useState<File[]>(userFiles); // Initialize with userFiles
//   const [error, setError] = useState<string | null>(null); // State to handle errors

//   useEffect(() => {
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

//   const handleApplyMorph = async (file: File) => {
//     if (!file.resultedFile) {
//       alert("الملف غير متاح للمعالجة.");
//       return;
//     }

//     try {
//       // Indicate that the file is being processed
//       setProcessingFiles((prev) => [...prev, file.id]);

//       // Send a POST request to the API with the resultedFile URL
//       const response = await fetch("/api/apply-morph", {
//         method: "POST",
//         headers: {
//           'Content-Type': 'application/json',
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
//             prevFiles.map((f) =>
//               f.id === file.id ? { ...f, resultedFile2: processedFileUrl } : f
//             )
//           );
//           alert("تمت معالجة الملف بنجاح. يمكنك تحميله الآن.");
//         } else {
//           throw new Error("عنوان URL للملف المعالج مفقود في الاستجابة.");
//         }
//       } else {
//         throw new Error(result.error || "فشل في معالجة الملف.");
//       }
//     } catch (error: any) { // Specify 'any' type for better error property access
//       console.error("خطأ في معالجة الملف:", error);
//       alert(`خطأ في معالجة الملف: ${error.message}`);
//     } finally {
//       // Remove the file from the processing state
//       setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
//     }
//   };

//   return (
//     <div dir="rtl">
//       {/* Improved border design */}
//       <div className="rounded-lg border border-gray-300 shadow-md">
//         <div className="overflow-x-auto">
//           <Table className="min-w-full divide-y divide-gray-200">
//             {/* <TableCaption className="text-gray-700 font-semibold">ملفاتك</TableCaption> */}
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
//                       onClick={() => handleApplyMorph(file)}
//                       disabled={processingFiles.includes(file.id)}
//                       className={`px-3 py-2 rounded-md ${
//                         processingFiles.includes(file.id)
//                           ? "bg-gray-400 cursor-not-allowed"
//                           : "bg-green-600 text-white hover:bg-green-700"
//                       } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
//                     >
//                       {processingFiles.includes(file.id) ? "جاري المعالجة..." : "إضافة الحركات"}
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


// // /src/components/custom/FileTableWithPagination.tsx

// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table";

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
//   const [files, setFiles] = useState<File[]>(userFiles); // Initialize with userFiles

//   useEffect(() => {
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

//   const handleApplyMorph = async (file: File) => {
//     if (!file.resultedFile) {
//       alert("الملف غير متاح للمعالجة.");
//       return;
//     }

//     try {
//       // Indicate that the file is being processed
//       setProcessingFiles((prev) => [...prev, file.id]);

//       // Send a POST request to the API with the resultedFile URL
//       const response = await fetch("/api/apply-morph", {
//         method: "POST",
//         headers: {
//           'Content-Type': 'application/json',
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
//             prevFiles.map((f) =>
//               f.id === file.id ? { ...f, resultedFile2: processedFileUrl } : f
//             )
//           );
//           alert("تمت معالجة الملف بنجاح. يمكنك تحميله الآن.");
//         } else {
//           throw new Error("عنوان URL للملف المعالج مفقود في الاستجابة.");
//         }
//       } else {
//         throw new Error(result.error || "فشل في معالجة الملف.");
//       }
//     } catch (error: any) { // Specify 'any' type for better error property access
//       console.error("خطأ في معالجة الملف:", error);
//       alert(`خطأ في معالجة الملف: ${error.message}`);
//     } finally {
//       // Remove the file from the processing state
//       setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
//     }
//   };

//   return (
//     <div dir="rtl">
//       {/* Improved border design */}
//       <div className="rounded-lg border border-gray-300 shadow-md">
//         <div className="overflow-x-auto">
//           <Table className="min-w-full divide-y divide-gray-200">
//             {/* <TableCaption className="text-gray-700 font-semibold">ملفاتك</TableCaption> */}
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
//                       onClick={() => handleApplyMorph(file)}
//                       disabled={processingFiles.includes(file.id)}
//                       className={`px-3 py-2 rounded-md ${
//                         processingFiles.includes(file.id)
//                           ? "bg-gray-400 cursor-not-allowed"
//                           : "bg-green-600 text-white hover:bg-green-700"
//                       } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
//                     >
//                       {processingFiles.includes(file.id) ? "جاري المعالجة..." : "إضافة الحركات"}
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
//                         تحميل الملف 
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


// ///Users/omair/shraih/src/components/custom/FileTableWithPagination.tsx


// "use client";

// import React, { useState } from "react";
// import {
//   Table,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table";

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
//   const rowsPerPage = 10;
//   const totalPages = Math.ceil(userFiles.length / rowsPerPage);

//   // const [files, setFiles] = useState([]); // Your state for files
//   const [files, setFiles] = useState<File[]>(userFiles); // Initialize with userFiles


//   const currentFiles = userFiles.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   const handlePageChange = (page: number) => {
//     if (page > 0 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   const handleApplyMorph = async (file: File) => {
//     if (!file.resultedFile) {
//       alert("The file is not available to process.");
//       return;
//     }
  
//     try {
//       // Indicate that the file is being processed
//       setProcessingFiles((prev) => [...prev, file.id]);
  
//       // Send a POST request to the API with the resultedFile URL
//       const response = await fetch("/api/apply-morph", {
//         method: "POST",
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ resultedFile: file.resultedFile }),
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to process the file.");
//       }
  
//       const result = await response.json();
  
//       if (result.success) {
//         const { processedFileUrl } = result;
//         if (processedFileUrl) {
//           // Update the specific file in the state with the new processedFileUrl
//           setFiles((prevFiles) =>
//             prevFiles.map((f) =>
//               f.id === file.id ? { ...f, resultedFile2: processedFileUrl } : f
//             )
//           );
//           alert("File processed successfully. You can download it now.");
//         } else {
//           throw new Error("Processed file URL is missing in the response.");
//         }
//       } else {
//         throw new Error(result.error || "Failed to process the file.");
//       }
//     } catch (error: any) { // Specify 'any' type for better error property access
//       console.error("Error processing file:", error);
//       alert(`Error processing the file: ${error.message}`);
//     } finally {
//       // Remove the file from the processing state
//       setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
//     }
//   };
  
//   return (

//         <div dir="rtl">
//       {/* Improved border design */}
//       <div className="rounded-lg border border-gray-300 shadow-md">
//       <div className="overflow-x-auto">

//         <Table className="min-w-full divide-y divide-gray-200">
//           {/* <TableCaption className="text-gray-700 font-semibold">ملفاتك</TableCaption> */}
//           <TableHeader>
//             <TableRow className="bg-gray-100 border-b border-gray-300">
//               <TableHead className="px-4 py-2 text-right">اسم الملف</TableHead>
//               <TableHead className="px-4 py-2 text-right">التاريخ</TableHead>
//               <TableHead className="px-4 py-2 text-right">الملف الناتج</TableHead>
//               <TableHead className="px-4 py-2 text-right">اضافة الحركات</TableHead>
//               <TableHead className="px-4 py-2 text-right">الملف مع الحركات</TableHead>

//             </TableRow>
//           </TableHeader>
//         <tbody>
//           {currentFiles.map((file, idx) => (
//             <TableRow
//               key={file.id}
//               className={`${
//                 idx % 2 === 0 ? "bg-white" : "bg-gray-50"
//               } hover:bg-gray-100 border-b border-gray-300`}
//             >
//               <TableCell className="px-6 py-4 text-right font-medium text-gray-900">
//                 {file.fileName}
//               </TableCell>
//               <TableCell className="px-6 py-4 text-right text-gray-500">
//                 {new Date(file.createdAt).toLocaleString()}
//               </TableCell>
//               <TableCell className="px-6 py-4 text-right">
//                 {file.resultedFile ? (
//                   <a
//                     href={file.resultedFile}
//                     download
//                     className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                   >
//                     تحميل
//                   </a>
//                 ) : (
//                   <p className="text-gray-400">الملف غير جاهز</p>
//                 )}
//               </TableCell>
//               <TableCell className="px-6 py-4 text-right">
//                 <button
//                   onClick={() => handleApplyMorph(file)}
//                   disabled={processingFiles.includes(file.id)}
//                   className={`px-3 py-2 rounded-md ${
//                     processingFiles.includes(file.id)
//                       ? "bg-gray-400 cursor-not-allowed"
//                       : "bg-green-600 text-white hover:bg-green-700"
//                   } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
//                 >
//                   {processingFiles.includes(file.id) ? "جاري المعالجة..." : "إضافة الحركات"}
//                 </button>
//               </TableCell>

//               <TableCell className="px-6 py-4 text-right">
//                 {file.resultedFile2 ? (
//                   <a
//                     href={file.resultedFile2}
//                     download
//                     className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                   >
//                     تحميل الملف مع الحركات
//                   </a>
//                 ) : (
//                   <p className="text-gray-400">غير متوفر</p>
//                 )}
//               </TableCell>
//             </TableRow>
//           ))}
//         </tbody>
//       </Table>
//     </div>

//   </div>

//   <div className="flex justify-center items-center gap-4 mt-4">
//     <button
//       onClick={() => handlePageChange(currentPage - 1)}
//       disabled={currentPage === 1}
//       className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//     >
//       السابق
//     </button>
//     <span className="text-gray-700">
//       صفحة {currentPage} من {totalPages}
//     </span>
//     <button
//       onClick={() => handlePageChange(currentPage + 1)}
//       disabled={currentPage === totalPages}
//       className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//     >
//       التالي
//     </button>
//   </div>
// </div>

//   );
// }





  // const handleApplyMorph = async (file: File) => {
  //   if (!file.resultedFile) {
  //     alert("The file is not available to process.");
  //     return;
  //   }

  //   try {
  //     // Indicate that the file is being processed
  //     setProcessingFiles((prev) => [...prev, file.id]);

  //     // Send a POST request to the second API with the requestId
  //     const response = await fetch("/api/apply-morph", {
  //       method: "POST",
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ requestId: file.id }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || "Failed to process the file.");
  //     }

  //     const result = await response.json();

  //     if (result.success) {
  //       const { processedFileUrl } = result;
  //       if (processedFileUrl) {
  //         // Update the specific file in the state with the new processedFileUrl
  //         setFiles((prevFiles) =>
  //           prevFiles.map((f) =>
  //             f.id === file.id ? { ...f, resultedFile2: processedFileUrl } : f
  //           )
  //         );
  //         alert("File processed successfully. You can download it now.");
  //       } else {
  //         throw new Error("Processed file URL is missing in the response.");
  //       }
  //     } else {
  //       throw new Error(result.error || "Failed to process the file.");
  //     }
  //   } catch (error) {
  //     console.error("Error processing file:", error);
  //     alert(`Error processing the file: ${error.message}`);
  //   } finally {
  //     // Remove the file from the processing state
  //     setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
  //   }
  // };




  // const handleApplyMorph = async (file: File) => {
  //   if (!file.resultedFile) {
  //     alert("The file is not available to process.");
  //     return;
  //   }
  
  //   try {
  //     setProcessingFiles((prev) => [...prev, file.id]);
  
  //     const formData = new FormData();
  //     formData.append("file", await fetch(file.resultedFile).then((res) => res.blob()));
  
  //     const response = await fetch("/api/apply-morph", {
  //       method: "POST",
  //       body: formData,
  //     });
  
  //     if (!response.ok) {
  //       throw new Error("Failed to process the file.");
  //     }
  
  //     // Convert the response to Blob and create a URL
  //     const blob = await response.blob();
  //     const newFileUrl = URL.createObjectURL(blob);
  
  //     // Save the new file URL to resultedFile2
  //     file.resultedFile2 = newFileUrl;
  
  //     alert("File processed successfully. You can download it now.");
  //   } catch (error) {
  //     console.error(error);
  //     alert("Error processing the file.");
  //   } finally {
  //     setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
  //   }
  // };
  

  // const handleApplyMorph = async (file: File) => {
  //   if (!file.resultedFile) {
  //     alert("The file is not available to process.");
  //     return;
  //   }

  //   try {
  //     setProcessingFiles((prev) => [...prev, file.id]);

  //     const formData = new FormData();
  //     formData.append("file", await fetch(file.resultedFile).then((res) =>
  //       res.blob()
  //     ));

  //     const response = await fetch("/api/apply-morph", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to process the file.");
  //     }

  //     // Create a Blob from the response data
  //     const blob = await response.blob();
  //     const newFileUrl = URL.createObjectURL(blob);

  //     // Update the file's resultedFile property (example: by calling an API or updating state)
  //     file.resultedFile = newFileUrl;

  //     alert("File processed successfully. You can download it now.");
  //   } catch (error) {
  //     console.error(error);
  //     alert("Error processing the file.");
  //   } finally {
  //     setProcessingFiles((prev) => prev.filter((id) => id !== file.id));
  //   }
  // };


// // components/FileTableWithPagination.tsx

// "use client"; // This is a Client Component

// import React, { useState } from 'react';
// import {
//   Table,
//   TableCaption,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
// } from '@/components/ui/table';

// type File = {
//   id: string;
//   file_name: string;
//   created_at: string;
//   file_url: string | null;
//   resulted_file: string | null;
// };

// export function FileTableWithPagination({ userFiles }: { userFiles: File[] }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 10;
//   const totalPages = Math.ceil(userFiles.length / rowsPerPage);

//   // Get current page's data
//   const currentFiles = userFiles.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   // Handle page change
//   const handlePageChange = (page: number) => {
//     if (page > 0 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   return (
//     <div dir="rtl">
//       {/* Improved border design */}
//       <div className="rounded-lg border border-gray-300 shadow-md">
//         <Table className="min-w-full divide-y divide-gray-200">
//           {/* <TableCaption className="text-gray-700 font-semibold">ملفاتك</TableCaption> */}
//           <TableHeader>
//             <TableRow className="bg-gray-100 border-b border-gray-300">
//               <TableHead className="px-4 py-2 text-right">اسم الملف</TableHead>
//               <TableHead className="px-4 py-2 text-right">التاريخ</TableHead>
//               <TableHead className="px-4 py-2 text-right">الملف الأصلي</TableHead>
//               <TableHead className="px-4 py-2 text-right">الملف الناتج</TableHead>
//             </TableRow>
//           </TableHeader>
//           <tbody>
//             {currentFiles.map((file, idx) => (
//               <TableRow
//                 key={file.id}
//                 className={`${
//                   idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
//                 } hover:bg-gray-100 border-b border-gray-300`}
//               >
//                 <TableCell className="px-4 py-2 text-right font-medium text-gray-900">
//                   {file.file_name}
//                 </TableCell>
//                 <TableCell className="px-4 py-4 text-right text-gray-500">
//                   {new Date(file.created_at).toLocaleString()}
//                 </TableCell>
//                 <TableCell className="px-4 py-2 text-right">
//                   {file.file_url ? (
//                     <a
//                       href={file.file_url}
//                       download
//                       className="px-3 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                     >
//                       تحميل
//                     </a>
//                   ) : (
//                     <p className="text-gray-400">الملف غير جاهز</p>
//                   )}
//                 </TableCell>
//                 <TableCell className="px-4 py-2 text-right">
//                   {file.resulted_file ? (
//                     <a
//                       href={file.resulted_file}
//                       download
//                       className="px-3 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                     >
//                       تحميل
//                     </a>
//                   ) : (
//                     <p className="text-gray-400">الملف غير جاهز</p>
//                   )}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </tbody>
//         </Table>
//       </div>

//       {/* Pagination controls */}
//       <div className="flex justify-center items-center gap-4 mt-4">
//         <button
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:opacity-50"
//         >
//           السابق
//         </button>
//         <span className="text-gray-700">
//           صفحة {currentPage} من {totalPages}
//         </span>
//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:opacity-50"
//         >
//           التالي
//         </button>
//       </div>
//     </div>
//   );
// }


// // components/FileTableWithPagination.tsx

// "use client"; // This is a Client Component

// import React, { useState } from 'react';
// import {
//   Table,
//   TableCaption,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@saasfly/ui/table';

// type File = {
//   id: string;
//   file_name: string;
//   created_at: string;
//   file_url: string | null;
//   resulted_file: string | null;
// };

// export function FileTableWithPagination({ userFiles }: { userFiles: File[] }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 10;
//   const totalPages = Math.ceil(userFiles.length / rowsPerPage);

//   // Get current page's data
//   const currentFiles = userFiles.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   // Handle page change
//   const handlePageChange = (page: number) => {
//     if (page > 0 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   return (
//     <div dir="rtl">
//       <div  className="divide-y  divide-border rounded-md border">
//         <Table className="divide-y divide-gray-200">
//           <TableCaption>ملفاتك</TableCaption>
//           <TableHeader>
//             <TableRow className="hover:bg-gray-50">
//               <TableHead>اسم الملف</TableHead>
//               <TableHead>التاريخ</TableHead>
//               <TableHead>الملف الأصلي</TableHead>
//               <TableHead>الملف الناتج</TableHead>
//             </TableRow>
//           </TableHeader>
//           <tbody>
//             {currentFiles.map((file) => (
//               <TableRow key={file.id} className="hover:bg-gray-50">
//                 <TableHead>{file.file_name}</TableHead>
//                 <TableHead>{new Date(file.created_at).toLocaleString()}</TableHead>
//                 <TableHead>
//                   {file.file_url ? (
//                     <a
//                       href={file.file_url}
//                       download
//                       className="text-blue-600 hover:text-blue-800"
//                     >
//                       تحميل
//                     </a>
//                   ) : (
//                     <p>الملف غير جاهز</p>
//                   )}
//                 </TableHead>
//                 <TableHead>
//                   <a
//                     href={file.resulted_file}
//                     download
//                     className="text-blue-600 hover:text-blue-800"
//                   >
//                     تحميل
//                   </a>
//                 </TableHead>
//               </TableRow>
//             ))}
//           </tbody>
//         </Table>
//       </div>

//       {/* Pagination controls */}
//       <div className="flex justify-center space-x-2 mt-4">
//         <button
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//         >
//           السابق
//         </button>
//         <span>
//           صفحة {currentPage} من {totalPages}
//         </span>
//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//         >
//           التالي
//         </button>
//       </div>
//     </div>
//   );
// }
