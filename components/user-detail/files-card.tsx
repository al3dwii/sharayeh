// components/user-detail/files-card.tsx

'use client'

import React, { useState } from 'react';
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

import Button from '@/components/ui/Button2'; // Ensure correct import path

import { Prisma } from '@prisma/client';

interface UserFile {
  id: number;
  fileName: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  fileKey: string | null;
  fileUrl: string | null;
  resultedFile: string | null;
  resultedFile2: string | null;
  type: string;
  results: Prisma.JsonValue;
}

interface FilesCardProps {
  userFiles: UserFile[];
  userId: string; // For actions like deleting a file
}

export function FilesCard({ userFiles: initialFiles, userId }: FilesCardProps) {
  const [files, setFiles] = useState<UserFile[]>(initialFiles);
  const [deletingFileIds, setDeletingFileIds] = useState<number[]>([]);

  // Handler for Download button
  const handleDownload = (file: UserFile, version: 'resultedFile' | 'resultedFile2') => {
    const url = version === 'resultedFile' ? file.resultedFile : file.resultedFile2;
    if (url) {
      window.open(url, '_blank');
    } else {
      alert(`No URL available for ${version}.`);
    }
  };

  // Handler for Delete button
  const handleDelete = async (fileId: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setDeletingFileIds((prev) => [...prev, fileId]);
      try {
        const response = await fetch(`/api/files/${fileId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove the deleted file from the state
          setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
          alert('File deleted successfully.');
        } else {
          throw new Error('Failed to delete the file.');
        }
      } catch (error) {
        console.error(error);
        alert('An error occurred while deleting the file.');
      } finally {
        setDeletingFileIds((prev) => prev.filter((id) => id !== fileId));
      }
    }
  };

  // Helper function to determine badge variant based on status
  function getStatusVariant(status: string) {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PROCESSING':
        return 'warning';
      case 'FAILED':
        return 'destructive'; // Using 'destructive' variant for failed status
      default:
        return 'default';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files</CardTitle>
      </CardHeader>
      <CardContent>
        {files.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded On</TableHead>
                  <TableHead>Resulted File 1</TableHead>
                  <TableHead>Resulted File 2</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>{file.fileName}</TableCell>
                    <TableCell>{file.type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(file.status)}>
                        {file.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(file.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {file.resultedFile ? (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleDownload(file, 'resultedFile')}
                        >
                          Download
                        </Button>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {file.resultedFile2 ? (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleDownload(file, 'resultedFile2')}
                        >
                          Download
                        </Button>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(file.id)}
                        disabled={deletingFileIds.includes(file.id)}
                      >
                        {deletingFileIds.includes(file.id) ? 'Deleting...' : 'Delete'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground">No files uploaded by this user.</p>
        )}
      </CardContent>
    </Card>
  );
}
