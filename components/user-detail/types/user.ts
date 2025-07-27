export interface User {
    id: string;
    firstName: string | null; // Allow null
    lastName: string | null;  // Allow null
    emailAddresses: Array<{ emailAddress: string }>;
   
    imageUrl?: string;
    
  }
  
