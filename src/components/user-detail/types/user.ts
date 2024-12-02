export interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    emailAddresses: Array<{
      emailAddress: string;
    }>;
  }
  
  