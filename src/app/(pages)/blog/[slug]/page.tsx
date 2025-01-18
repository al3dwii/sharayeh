// src/app/(pages)/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getAllPosts } from '@/utils/posts';
import { marked } from 'marked';
import styles from './post.module.css';
import { Footer } from "@/components/gadawel/footer";

interface BlogPostProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: BlogPostProps) {
  const posts = getAllPosts();
  const post = posts.find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  const htmlContent = marked(post.content);

  return (
    <>
    <main className={styles.postContainer}>
      <article>
        <h1 className={styles.postTitle}>{post.title}</h1>
        <time dateTime={post.date} className={styles.postDate}>
          {new Date(post.date).toLocaleDateString()}
        </time>
        <div className="bg-blue-200 text-black py-8 px-4 sm:px-6 lg:px-8">
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
        ></div>
      </article>

    </main>
          {/* <Footer /> */}
          </>
  );
}
