// i18n/request.ts
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const loc = locale || "ar";           // fallback to Arabic
  return {
    locale: loc,
    messages: (await import(`../messages/${loc}.json`)).default,
  };
});
