// /src/components/CreditsCard.tsx

import React from 'react';

interface UserCredits {
  credits: number;
  usedCredits: number;
  createdAt: string;
  updatedAt: string;
}

interface CreditsCardProps {
  userCredits: UserCredits | null;
}

const CreditsCard: React.FC<CreditsCardProps> = ({ userCredits }) => {
  if (!userCredits) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded-md">
        <h3 className="text-lg font-medium text-red-800">لا توجد بيانات ائتمان</h3>
        <p className="text-sm text-red-700">يرجى الاتصال بالدعم لمزيد من المعلومات.</p>
      </div>
    );
  }

  const remainingCredits = userCredits.credits - userCredits.usedCredits;

  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded-md">
      <h3 className="text-lg font-medium text-green-800">رصيدك الحالي</h3>
      <div className="mt-2">
        <p className="text-sm text-green-700">إجمالي الاعتمادات: {userCredits.credits}</p>
        <p className="text-sm text-green-700">الاعتمادات المستخدمة: {userCredits.usedCredits}</p>
        <p className="text-sm text-green-700">الاعتمادات المتبقية: {remainingCredits}</p>
      </div>
      <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
        شراء اعتمادات إضافية
      </button>
    </div>
  );
};

export default CreditsCard;
