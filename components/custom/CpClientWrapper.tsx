// /Users/omair/sharayeh/src/components/custom/CpClientWrapper.tsx
'use client';

import { Suspense } from 'react';
import CreatePresentation from './CreatePresentation';

const CreatePresentationClientWrapper = () => {
  return (
    <Suspense fallback={
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 animate-pulse">
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    }>
      <CreatePresentation />
    </Suspense>
  );
};

export default CreatePresentationClientWrapper;


