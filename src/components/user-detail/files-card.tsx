// files-card.tsx

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
} from '@/components/ui';

import { Prisma } from '@prisma/client';


interface UserFile {
  id: number;
  fileName: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  fileKey: string | null;
  fileUrl: string | null;
  resultedFile: string | null;
  type: string;
  results: Prisma.JsonValue; // Updated type
}


interface FilesCardProps {
  userFiles: UserFile[];
}

export function FilesCard({ userFiles }: FilesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Files</CardTitle>
      </CardHeader>
      <CardContent>
        {userFiles.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{file.fileName}</TableCell>
                  <TableCell>
                    <Badge>{file.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(file.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">
            No files uploaded by this user.
          </p>
        )}
      </CardContent>
    </Card>
  );
}


// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
//   Badge,
// } from "@/components/ui";

// interface UserFile {
//   id: number;
//   fileName: string;
//   status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
//   createdAt: Date;
//   fileKey: string | null;       // Changed from 'string | undefined' to 'string | null'
//   fileUrl: string | null;       // Changed from 'string | undefined' to 'string | null'
//   resultedFile: string | null;
//   type: string;
//   results: Record<string, unknown> | null;
// }


// interface FilesCardProps {
//   userFiles: UserFile[];
// }

// export function FilesCard({ userFiles }: FilesCardProps) {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Files</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {userFiles.length > 0 ? (
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>File Name</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Uploaded On</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {userFiles.map((file) => (
//                 <TableRow key={file.id}>
//                   <TableCell>{file.fileName}</TableCell>
//                   <TableCell>
//                     <Badge>{file.status}</Badge>
//                   </TableCell>
//                   <TableCell>
//                     {new Date(file.createdAt).toLocaleDateString()}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         ) : (
//           <p className="text-muted-foreground">
//             No files uploaded by this user.
//           </p>
//         )}
//       </CardContent>
//     </Card>
//   );
// }


// import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui"

// interface UserFile {
//   id: number;
//   fileName: string;
//   status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
//   createdAt: Date;
//   fileKey: string | null;       // Changed from 'string | undefined' to 'string | null'
//   fileUrl: string | null;       // Changed from 'string | undefined' to 'string | null'
//   resultedFile: string | null;
//   type: string;
//   results: Record<string, unknown> | null;
// }


// interface FilesCardProps {
//   userFiles: UserFile[]
// }

// export function FilesCard({ userFiles }: FilesCardProps) {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Files</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {userFiles.length > 0 ? (
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>File Name</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Uploaded On</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {userFiles.map((file) => (
//                 <TableRow key={file.id}>
//                   <TableCell>{file.fileName}</TableCell>
//                   <TableCell>
//                     <Badge
                      
//                     >
//                       {file.status}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     {new Date(file.createdAt).toLocaleDateString()}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         ) : (
//           <p className="text-muted-foreground">No files uploaded by this user.</p>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

