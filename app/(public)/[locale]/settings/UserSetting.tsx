'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClientToast from '@/components/ClientToast';
import PackageCard from '@/components/PackageCard';
import CreditsCard from '@/components/CreditsCard';
import CreditTransactionsCard from '@/components/CreditTransactionsCard';

interface UserSettingProps {
  userId: string;
  isPro: boolean;
  onUpdate?: () => void;
}

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

const UserSetting: React.FC<UserSettingProps> = ({ onUpdate }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
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
      
      // Call onUpdate if provided
      if (onUpdate) {
        onUpdate();
      }
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
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-6">إعدادات المستخدم</h2>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            الاسم
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="أدخل اسمك"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="أدخل بريدك الإلكتروني"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 font-semibold text-white rounded-md ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'جارٍ التحديث...' : 'تحديث الملف الشخصي'}
        </button>
      </form>

      {/* Package and Credits Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Package Card */}
        <PackageCard userPackage={user.UserPackage} />

        {/* Credits Card */}
        <CreditsCard userCredits={user.UserCredits} />
      </div>

      {/* Credit Transactions Card */}
      <div className="mt-8">
        <CreditTransactionsCard transactions={user.CreditTransactions} />
      </div>

      {showToast && (
        <ClientToast
          message="تم تحديث الملف الشخصي بنجاح!"
          onClose={() => setShowToast(false)} // Ensure ClientToast accepts onClose
        />
      )}
    </div>
  );
};

export default UserSetting;
