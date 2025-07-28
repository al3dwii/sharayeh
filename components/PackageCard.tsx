import React from 'react';

interface UserPackage {
  packageId: string;
  acquiredAt: string;
  expiresAt?: string | null;
  package: {
    name: string;
    price: number;
    credits: number;
    presentations: number;
    slidesPerPresentation: number;
    canAddTransition: boolean;
    canUploadPDF: boolean;
  } | null;
}

interface PackageCardProps {
  userPackage: UserPackage | null;
}

const PackageCard: React.FC<PackageCardProps> = ({ userPackage }) => {
  if (!userPackage || !userPackage.package) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800">لا توجد حزمة نشطة</h3>
        <p className="text-sm text-yellow-700">قم بشراء حزمة للاستفادة من الميزات المتقدمة.</p>
        <button className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
          شراء الآن
        </button>
      </div>
    );
  }

  const { package: pkg, acquiredAt, expiresAt } = userPackage;
  const formattedAcquiredAt = new Date(acquiredAt).toLocaleDateString();
  const formattedExpiresAt = expiresAt ? new Date(expiresAt).toLocaleDateString() : 'غير محدد';

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded-md">
      <h3 className="text-lg font-medium text-blue-800">الحزمة الحالية</h3>
      <p className="mt-2 text-sm text-blue-700">اسم الحزمة: {pkg.name}</p>
      <p className="mt-1 text-sm text-blue-700">السعر: ${pkg.price}</p>
      <p className="mt-1 text-sm text-blue-700">عدد النقاط: {pkg.credits}</p>
      <p className="mt-1 text-sm text-blue-700">التاريخ: {formattedAcquiredAt}</p>
      {expiresAt && <p className="mt-1 text-sm text-blue-700">تنتهي الصلاحية: {formattedExpiresAt}</p>}
      <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
        <li>العروض التقديمية: {pkg.presentations}</li>
        <li>الشرائح لكل عرض: {pkg.slidesPerPresentation}</li>
        <li>إضافة انتقالات: {pkg.canAddTransition ? 'نعم' : 'لا'}</li>
        <li>رفع ملفات PDF: {pkg.canUploadPDF ? 'نعم' : 'لا'}</li>
      </ul>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        إدارة الحزمة
      </button>
    </div>
  );
};

export default PackageCard;
