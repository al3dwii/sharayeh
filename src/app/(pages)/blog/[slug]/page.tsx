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
