// import { db } from "@/lib/db";

import { db } from "@/lib/db"; // Your Prisma client instance
import { File, FileStatus, Prisma } from "@prisma/client";

interface FileData {
  userId: string;
  fileKey: string;
  fileUrl: string;
  fileName: string;
  type: string;
}

export const addFile = async (fileData: FileData): Promise<File> => {
  const newFile = await db.file.create({
    data: {
      userId: fileData.userId,       
      fileKey: fileData.fileKey,     
      fileUrl: fileData.fileUrl,     
      fileName: fileData.fileName,   
      type: fileData.type,
      status: FileStatus.PROCESSING, // Use enum value directly
      // 'results' field is optional and can be omitted if you don't have a value
    },
  });

  return newFile;
};

export const updateFileStatus = async (
  fileKey: string,
  status: FileStatus,
  results?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput
): Promise<File> => {
  // Build the data object dynamically
  const data: Prisma.FileUpdateInput = {
    status: status,
  };

  // Only include 'results' in the update if it's provided
  if (results !== undefined) {
    if (results === null) {
      data.results = Prisma.DbNull; // Set the database field to SQL NULL
    } else {
      data.results = results;
    }
  }

  // Use Prisma's update method to update file status and results
  const updatedFile = await db.file.update({
    where: {
      fileKey: fileKey,
    },
    data: data,
  });

  return updatedFile;
};

