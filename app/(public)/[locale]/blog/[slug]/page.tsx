import { notFound } from 'next/navigation';
import { getAllPosts } from '@/utils/posts';
import { marked } from 'marked';
import styles from './post.module.css';
import type { Locale } from '@/utils/i18n';
import { LOCALES } from '@/utils/i18n';
import { siteUrl } from '@/utils/seo';

interface BlogPostProps {
  params: {
    locale: Locale;
    slug: string;
  };
}

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.flatMap((post) =>
    LOCALES.map((locale) => ({ locale, slug: post.slug }))
  );
}

export function generateMetadata({ params }: BlogPostProps) {
  const { locale, slug } = params;
  const post = getAllPosts().find((p) => p.slug === slug);
  if (!post) return {};

  const title = `${post.title} – Blog`;
  const description = post.excerpt ?? post.content.slice(0, 150);
  const canonical = `${siteUrl}/${locale}/blog/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: LOCALES.reduce((acc, loc) => {
        acc[loc] = `${siteUrl}/${loc}/blog/${slug}`;
        return acc;
      }, {} as Record<string, string>),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
    },
  };
}

export default function BlogPostPage({ params }: BlogPostProps) {
  const { locale, slug } = params;
  const post = getAllPosts().find((p) => p.slug === slug);

  if (!post) {
    return notFound();
  }

  const htmlContent = marked(post.content);
  const description = post.excerpt ?? post.content.slice(0, 150);
  const canonical = `${siteUrl}/${locale}/blog/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Sharayeh', // Replace with your name or brand
    },
    url: canonical,
    inLanguage: locale,
  };

  return (
    <>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <main
        className={styles.postContainer}
        lang={locale}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        <article>
          <h1 className={styles.postTitle}>{post.title}</h1>
          <time dateTime={post.date} className={styles.postDate}>
            {new Date(post.date).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>

          <div className="bg-blue-200 text-black py-8 px-4 sm:px-6 lg:px-8 my-6">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
              <h2 className="text-xl sm:text-l font-bold mb-4">
                اضغط لانشاء عروض بوربوينت احترافية بالذكاء الاصطناعي
              </h2>
              <a
                href="https://sharayeh.com"
                className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg shadow hover:bg-blue-50 transition"
              >
                Sharayeh.com
              </a>
            </div>
          </div>

          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>
      </main>
    </>
  );
}

// // app/(public)/[locale]/blog/[slug]/page.tsx
// import { notFound } from 'next/navigation';
// import { getAllPosts } from '@/utils/posts';
// import { marked } from 'marked';
// import styles from './post.module.css';
// import type { Locale } from '@/utils/i18n';
// import { LOCALES } from '@/utils/i18n';
// import { siteUrl } from '@/utils/seo';
// // import { Footer } from '@/components/gadawel/footer';

// interface BlogPostProps {
//   params: {
//     locale: Locale;
//     slug: string;
//   };
// }

// export function generateStaticParams() {
//   const posts = getAllPosts();
//   // Pre‑render every post in every supported locale
//   return posts.flatMap((post) =>
//     LOCALES.map((locale) => ({ locale, slug: post.slug }))
//   );
// }

// /**
//  * Generate per‑post metadata. This adds a descriptive title and description,
//  * sets the canonical URL and defines language alternates for each blog post.
//  */
// export function generateMetadata({ params }: BlogPostProps) {
//   const { locale, slug } = params;
//   const post = getAllPosts().find((p) => p.slug === slug);
//   if (!post) return {};

//   const title = `${post.title} – Blog`;
//   const description = post.excerpt ?? post.content.slice(0, 150);
//   const canonical = `${siteUrl}/${locale}/blog/${slug}`;

  

//   return {
//     title,
//     description,
//     alternates: {
//       canonical,
//       languages: LOCALES.reduce((acc, loc) => {
//         acc[loc] = `${siteUrl}/${loc}/blog/${slug}`;
//         return acc;
//       }, {} as Record<string, string>),
//     },
//     openGraph: {
//       title,
//       description,
//       url: canonical,
//       type: 'article',
//     },
//   };
// }

// export default function BlogPostPage({ params }: BlogPostProps) {
//   const { slug } = params;
//   const posts = getAllPosts();
//   const post = posts.find((p) => p.slug === slug);

//   if (!post) {
//     notFound();
//   }

//   const htmlContent = marked(post.content);

//   const jsonLd = {
//   '@context': 'https://schema.org',
//   '@type': 'Article',
//   headline: post.title,
//   datePublished: post.date,
//   author: {
//     '@type': 'Person',
//     name: 'Your Name or Company',
//   },
//   url: `${siteUrl}/${locale}/blog/${slug}`,
//   inLanguage: locale,
// };

//   return (
//     <>
//     <head>
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />
//     </head>
    

//       <main className={styles.postContainer}>
//         <article>
//           <h1 className={styles.postTitle}>{post.title}</h1>
//           <time dateTime={post.date} className={styles.postDate}>
//             {new Date(post.date).toLocaleDateString()}
//           </time>
//           {/* Promotional banner; consider extracting into a component */}
//           <div className="bg-blue-200 text-black py-8 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
//               <h2 className="text-xl sm:text-l font-bold mb-4">
//                 اضغط لانشاء عروض بوربوينت احترافية بالذكاء الاصطناعي
//               </h2>
//               <a
//                 href="https://sharayeh.com"
//                 className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg shadow hover:bg-blue-50 transition"
//               >
//                 Sharayeh.com
//               </a>
//             </div>
//           </div>
//           <div
//             className={styles.postContent}
//             // eslint-disable-next-line react/no-danger -- content is sanitized via marked
//             dangerouslySetInnerHTML={{ __html: htmlContent }}
//           ></div>
//         </article>
//       </main>
//       {/* <Footer /> */}
//     </>
//   );
// }


// // src/app/(pages)/blog/[slug]/page.tsx
// import { notFound } from 'next/navigation';
// import { getAllPosts } from '@/utils/posts';
// import { marked } from 'marked';
// import styles from './post.module.css';
// // import { Footer } from "@/components/gadawel/footer";

// interface BlogPostProps {
//   params: {
//     slug: string;
//   };
// }

// export function generateStaticParams() {
//   const posts = getAllPosts();
//   return posts.map((post) => ({
//     slug: post.slug,
//   }));
// }

// export default function BlogPostPage({ params }: BlogPostProps) {
//   const posts = getAllPosts();
//   const post = posts.find((post) => post.slug === params.slug);

//   if (!post) {
//     notFound();
//   }

//   const htmlContent = marked(post.content);

//   return (
//     <>
//     <main className={styles.postContainer}>
//       <article>
//         <h1 className={styles.postTitle}>{post.title}</h1>
//         <time dateTime={post.date} className={styles.postDate}>
//           {new Date(post.date).toLocaleDateString()}
//         </time>
//         <div className="bg-blue-200 text-black py-8 px-4 sm:px-6 lg:px-8">
//               <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
//                 <h2 className="text-xl sm:text-l font-bold mb-4">
//                   اضغط لانشاء عروض بوربوينت احترافية بالذكاء الاصطناعي
//                 </h2>
//                 <a
//                   href="https://sharayeh.com"
//                   className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg shadow hover:bg-blue-50 transition"
//                 >
//                    Sharayeh.com 
//                 </a>
//               </div>
//             </div>
//         <div
//           className={styles.postContent}
//           dangerouslySetInnerHTML={{ __html: htmlContent }}
//         ></div>
//       </article>

//     </main>
//           {/* <Footer /> */}
//           </>
//   );
// }
