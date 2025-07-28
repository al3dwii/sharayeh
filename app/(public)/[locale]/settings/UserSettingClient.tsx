'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClientToast from '@/components/ClientToast';
import PackageCard from '@/components/PackageCard';
import CreditsCard from '@/components/CreditsCard';
import CreditTransactionsCard from '@/components/CreditTransactionsCard';

interface UserData {
  id: string;
  name: string;
  email: string;
  UserCredits: {
    credits: number;
    usedCredits: number;
    createdAt: string;
    updatedAt: string;
  } | null;
  UserPackage: {
    packageId: string;
    acquiredAt: string;
    expiresAt: string | null;
    package: {
      name: string;
      price: number;
      credits: number;
      presentations: number;
      slidesPerPresentation: number;
      canAddTransition: boolean;
      canUploadPDF: boolean;
    } | null;
  } | null;
  CreditTransactions: Array<{
    type: string;
    amount: number;
    description: string;
    timestamp: string;
  }>;
  Files: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

export default function UserSettingClient() {
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/userSetting');
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
      });
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.response?.data?.error || 'Failed to load user data.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put('/api/userSetting', formData);
      setUser(response.data);
      setShowToast(true);
    } catch (err: any) {
      console.error('Error updating user data:', err);
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (error && !user) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-gray-500">Loading user data...</div>;
  }

  return (
    <>
     <div className="p-8 m-4 mx-auto bg-white shadow-md rounded-md p-6">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">ملف المستخدم</h2>

      {/* Name Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700">الاسم</h3>
        <p className="text-gray-900 mt-1">{formData.name || 'غير متوفر'}</p>
      </div>

      {/* Email Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700">البريد الإلكتروني</h3>
        <p className="text-gray-900 mt-1">{formData.email || 'غير متوفر'}</p>
      </div>

    <div>
    {/* Package and Credits Cards */}
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* <PackageCard userPackage={user.UserPackage} /> */}
      {/* <CreditsCard userCredits={user.UserCredits} /> */}
    </div>

    {/* Credit Transactions Card */}
    <div className="mt-8">
      <CreditTransactionsCard transactions={user.CreditTransactions} />
    </div>

    {showToast && (
      <ClientToast
        message="تم تحديث الملف الشخصي بنجاح!"
        onClose={() => setShowToast(false)}
      />
    )}
  </div>
</div>
    </>
  );
}
