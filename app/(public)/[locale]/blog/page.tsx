// app/(public)/[locale]/blog/page.tsx
import { compareDesc } from 'date-fns';
import { BlogPosts } from './blog-posts';
import { getAllPosts } from '@/utils/posts';
import type { Locale } from '@/utils/i18n';
import { LOCALES } from '@/utils/i18n';
import { siteUrl } from '@/utils/seo';

type PageParams = { params: { locale: Locale } };

/** Dynamic metadata so we can use params.locale safely */
export async function generateMetadata({ params }: PageParams) {
  const { locale } = params;
  const canonical = `${siteUrl}/${locale}/blog`;

  return {
    title: 'Blog',
    description: 'Read the latest updates, tips and news from Doc2Deck.',
    alternates: {
      canonical,
      languages: LOCALES.reduce((acc, loc) => {
        acc[loc] = `${siteUrl}/${loc}/blog`;
        return acc;
      }, {} as Record<string, string>),
    },
    openGraph: {
      title: 'Blog – Doc2Deck',
      description: 'Latest updates, tips and news.',
      url: canonical,
      type: 'website',
    },
  };
}

export default function BlogPage({ params }: PageParams) {
  const { locale } = params;
  const allPosts = getAllPosts();
  const posts = allPosts
    .filter((post) => post.published)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return (
    <>
      <main className="container mx-auto p-6">
        <BlogPosts posts={posts} locale={locale} />
      </main>
    </>
  );
}

// // app/(public)/[locale]/blog/page.tsx
// import { compareDesc } from 'date-fns';
// import { BlogPosts } from './blog-posts';
// import { getAllPosts } from '@/utils/posts';
// import type { Locale } from '@/utils/i18n';
// // import { Footer } from '@/components/gadawel/footer';
// import { LOCALES } from '@/utils/i18n';
// import { siteUrl } from '@/utils/seo';

// export const metadata = {
//   title: 'Blog',
//   description: 'Read the latest updates, tips and news from Doc2Deck.',
//   alternates: {
//     canonical: ({ params }: { params: { locale: Locale } }) =>
//       `${siteUrl}/${params.locale}/blog`,
//     languages: LOCALES.reduce((acc, loc) => {
//       acc[loc] = `${siteUrl}/${loc}/blog`;
//       return acc;
//     }, {} as Record<string, string>),
//   },
// };

// export default function BlogPage({
//   params,
// }: {
//   params: { locale: Locale };
// }) {
//   const { locale } = params;
//   const allPosts = getAllPosts();
//   const posts = allPosts
//     .filter((post) => post.published)
//     .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

//   return (
//     <>
//       <main className="m-2 p-2">
//         {/* Pass locale down so that links remain language‑aware */}
//         <BlogPosts posts={posts} locale={locale} />
//       </main>
//       {/* <Footer /> */}
//     </>
//   );
// }


// // /Users/omair/gadawel/src/app/(pages)/blog/page.tsx
// import { compareDesc } from "date-fns";
// import { BlogPosts } from "./blog-posts";
// import { getAllPosts } from "@/utils/posts";
// // import { Footer } from "@/components/gadawel/footer";

// export const metadata = {
//   title: "Blog",
// };

// export default function BlogPage() {
//   const allPosts = getAllPosts();
//   const posts = allPosts
//     .filter((post) => post.published)
//     .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

//   return (
//     <>
//     <main className="m-2 p-2 ">
//       <BlogPosts posts={posts} />
     

//     </main>
//      {/* <Footer /> */}
//      </>
//   );
// }

// import { compareDesc } from "date-fns";

// import { BlogPosts } from "@/components/blog/blog-posts";

// export const metadata = {
//   title: "Blog",
// };

// export default function BlogPage() {
//   const posts = allPosts
//     .filter((post) => post.published)
//     .sort((a, b) => {
//       return compareDesc(new Date(a.date), new Date(b.date));
//     });

//   return (
//     <main>
//       <BlogPosts posts={posts} />
//     </main>
//   );
// }
