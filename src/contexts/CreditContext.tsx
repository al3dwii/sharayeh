// src/contexts/CreditContext.tsx

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/nextjs';

interface CreditContextType {
  credits: number | null;
  refreshCredits: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);

  const fetchCredits = async () => {
    if (user) {
      try {
        const token = await getToken();
        const response = await axios.get('/api/credits', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCredits(response.data.credits);
      } catch (error) {
        console.error('Error fetching credits:', error);
        setCredits(null);
      }
    } else {
      setCredits(null);
    }
  };

  useEffect(() => {
    fetchCredits();
    // Optionally, set up polling or subscriptions for real-time updates here
  }, [user]);

  return (
    <CreditContext.Provider value={{ credits, refreshCredits: fetchCredits }}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredits = (): CreditContextType => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
};
