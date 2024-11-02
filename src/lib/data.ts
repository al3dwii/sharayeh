import { UserFile } from '@/types/UserFile';
import { db } from '@/lib/db';

export const fetchUserFilesFromDB = async (userId: string) => {


const files = await db.file.findMany({
        where: {
          userId: userId,
        },
        select: {
          id: true,
          userId: true, // Add this field
          fileKey: true, // Add this field if it exists in the database
          fileName: true,
          fileUrl: true,
          type: true,
          status: true,
          createdAt: true,
          resultedFile: true, // Add this field
          results: true, // Add this field
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    
      return files.map((file) => ({
        ...file,
        fileKey: file.fileKey || '', // Provide an empty string or null if this is optional
        resultedFile: file.resultedFile || null,
        results: file.results || {}, // Set an empty object if results are JSON values
      }));
    }
    