export const siteUrl  = 'https://sharayeh.com'; // override NEXT_PUBLIC_SITE_URL
export const siteName = 'Sharayeh';

export const defaultTitle =
  'AI\u2011Powered Content Automation & File Conversion Hub';
export const defaultDescription =
  'Convert, optimise & repurpose any file\u2014documents, media, code or data\u2014using 30+ specialised AI pipelines in one privacy\u2011first workspace.';

/** Build a default OG image; fall back to the site logo if none specified */
export const ogImage = (path?: string) => [
  { url: `${siteUrl}${path ?? '/logo.png'}`, width: 1200, height: 630, alt: defaultTitle },
];

/** Swap one locale segment for another inside a URL. */
export function swapLocale(url: string, from: string, to: string) {
  return url.replace(`/${from}/`, `/${to}/`);
}
