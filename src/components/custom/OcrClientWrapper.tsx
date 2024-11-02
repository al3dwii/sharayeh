///Users/omair/sasi/apps/nextjs/src/components/ocr/OcrClientWrapper.tsx

'use client';

import React, { useState } from 'react';
import Ocr from './ocr';

const OcrClientWrapper = () => {
    const [requireProps, setRequireProps] = useState<{ remainingPage: number | null }>({ remainingPage: null });

  return (
    <Ocr   />
  );
};

export default OcrClientWrapper;


