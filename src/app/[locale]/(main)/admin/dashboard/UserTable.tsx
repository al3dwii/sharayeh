// src/components/UserTable.tsx

import React from 'react';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserTableProps {
  users: User[];
  totalUsers: number;
  currentPage: number;
  limit: number;
}

export function UserTable({ users, totalUsers, currentPage, limit }: UserTableProps) {
  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <div dir="rtl">
      <h2 className="mb-4 text-xl font-semibold">المستخدمون</h2>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-sm font-medium text-gray-700">
              <th className="border-b border-gray-300 p-4">ID</th>
              <th className="border-b border-gray-300 p-4">الاسم</th>
              <th className="border-b border-gray-300 p-4">البريد الإلكتروني</th>
              <th className="border-b border-gray-300 p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {users.map((user, index) => (
              <tr key={user.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border-b border-gray-200 p-4 text-right">{user.id}</td>
                <td className="border-b border-gray-200 p-4 text-right">{user.name}</td>
                <td className="border-b border-gray-200 p-4 text-right">{user.email}</td>
                <td className="border-b border-gray-200 p-4 text-center">
                  <button className="rounded-md bg-blue-500 px-3 py-1 text-white">تحميل</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        {currentPage > 1 ? (
          <Link href={`?page=${currentPage - 1}`}>
            <button className="rounded-md bg-gray-200 px-4 py-2">السابق</button>
          </Link>
        ) : (
          <button className="rounded-md bg-gray-200 px-4 py-2" disabled>
            السابق
          </button>
        )}

        <span>
          صفحة {currentPage} من {totalPages}
        </span>

        {currentPage < totalPages ? (
          <Link href={`?page=${currentPage + 1}`}>
            <button className="rounded-md bg-gray-200 px-4 py-2">التالي</button>
          </Link>
        ) : (
          <button className="rounded-md bg-gray-200 px-4 py-2" disabled>
            التالي
          </button>
        )}
      </div>
    </div>
  );
}
