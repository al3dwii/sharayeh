// utils/linkToTool.ts
import { ConversionRecord } from '@/utils/content';
export const linkToTool = (row: ConversionRecord, loc: 'en' | 'ar') =>
  `/${loc}/tools/${loc === 'en' ? row.slug_en : row.slug_ar}`;
