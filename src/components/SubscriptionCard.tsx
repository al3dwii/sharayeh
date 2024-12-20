// /src/components/SubscriptionCard.tsx

import React from 'react';

interface Subscription {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionCardProps {
  subscription: Subscription | null;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription }) => {
  if (!subscription) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800">لا يوجد اشتراك نشط</h3>
        <p className="text-sm text-yellow-700">قم بالاشتراك للاستفادة من الميزات المتقدمة.</p>
        <button className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
          اشترك الآن
        </button>
      </div>
    );
  }

  const currentPeriodEnd = new Date(subscription.stripeCurrentPeriodEnd || '').toLocaleDateString();

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded-md">
      <h3 className="text-lg font-medium text-blue-800">اشتراكك الحالي</h3>
      <p className="mt-2 text-sm text-blue-700">خطة: {subscription.stripePriceId || 'غير محددة'}</p>
      <p className="mt-1 text-sm text-blue-700">تاريخ التجديد: {currentPeriodEnd}</p>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        إدارة الاشتراك
      </button>
    </div>
  );
};

export default SubscriptionCard;
