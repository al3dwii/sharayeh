// components/FileTableWithPagination.tsx

"use client"; // This is a Client Component

import React, { useState } from 'react';
import {
  Table,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';

type File = {
  id: string;
  fileName: string;
  createdAt: string;
  fileUrl: string | null;
  resultedFile: string | null;
};

export function FileTableWithPagination({ userFiles }: { userFiles: File[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(userFiles.length / rowsPerPage);

  // Get current page's data
  const currentFiles = userFiles.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div dir="rtl">
      {/* Improved border design */}
      <div className="rounded-lg border border-gray-300 shadow-md">
        <Table className="min-w-full divide-y divide-gray-200">
          {/* <TableCaption className="text-gray-700 font-semibold">ملفاتك</TableCaption> */}
          <TableHeader>
            <TableRow className="bg-gray-100 border-b border-gray-300">
              <TableHead className="px-4 py-2 text-right">اسم الملف</TableHead>
              <TableHead className="px-4 py-2 text-right">التاريخ</TableHead>
              <TableHead className="px-4 py-2 text-right">الملف الأصلي</TableHead>
              <TableHead className="px-4 py-2 text-right">الملف الناتج</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {currentFiles.map((file, idx) => (
              <TableRow
                key={file.id}
                className={`${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-gray-100 border-b border-gray-300`}
              >
                <TableCell className="px-4 py-2 text-right font-medium text-gray-900">
                  {file.fileName}
                </TableCell>
                <TableCell className="px-4 py-4 text-right text-gray-500">
                  {new Date(file.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="px-4 py-2 text-right">
                  {file.fileUrl ? (
                    <a
                      href={file.fileUrl}
                      download
                      className="px-3 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                      تحميل
                    </a>
                  ) : (
                    <p className="text-gray-400">الملف غير جاهز</p>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2 text-right">
                  {file.resultedFile ? (
                    <a
                      href={file.resultedFile}
                      download
                      className="px-3 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                      تحميل
                    </a>
                  ) : (
                    <p className="text-gray-400">الملف غير جاهز</p>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:opacity-50"
        >
          السابق
        </button>
        <span className="text-gray-700">
          صفحة {currentPage} من {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    </div>
  );
}


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
