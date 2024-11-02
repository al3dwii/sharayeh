// src/types/UserFile.ts

import { FileStatus } from '@/types/FileStatus'; // Ensure this is correctly imported
import { JsonValue } from 'type-fest'; // Or the appropriate import for JsonValue

export interface UserFile {
  userId: string;
  id: number;
  createdAt: Date;
  fileKey: string;
  fileUrl: string;
  fileName: string;
  type: string;
  resultedFile: string | null;
  status: FileStatus;
  results: JsonValue;
}
