// /src/components/CreditTransactionsCard.tsx

import React from 'react';

interface CreditTransaction {
  type: string;
  amount: number;
  description: string;
  timestamp: string;
}

interface CreditTransactionsCardProps {
  transactions: CreditTransaction[];
}

const CreditTransactionsCard: React.FC<CreditTransactionsCardProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="p-4 bg-gray-100 border border-gray-300 rounded-md">
        <h3 className="text-lg font-medium text-gray-800">لا توجد معاملات </h3>
        <p className="text-sm text-gray-700">عندما تقوم بإجراء معاملات، ستظهر هنا.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-purple-100 border border-purple-300 rounded-md">
      <h3 className="text-lg font-medium text-purple-800">معاملات الرصيد الأخيرة</h3>
      <ul className="mt-2 space-y-2">
        {transactions.slice(0, 5).map((tx, index) => (
          <li key={index} className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
            <div>
              <p className="text-sm font-medium text-purple-700">{tx.description}</p>
              <p className="text-xs text-purple-600">{new Date(tx.timestamp).toLocaleString()}</p>
            </div>
            <span
              className={`text-sm font-semibold ${
                tx.type === 'ADDITION' ? 'text-green-600' :
                tx.type === 'DEDUCTION' ? 'text-red-600' :
                'text-gray-600'
              }`}
            >
              {tx.type === 'ADDITION' ? '+' : tx.type === 'DEDUCTION' ? '-' : ''}
              {tx.amount}
            </span>
          </li>
        ))}
      </ul>
      {transactions.length > 5 && (
        <button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
          عرض المزيد
        </button>
      )}
    </div>
  );
};

export default CreditTransactionsCard;
