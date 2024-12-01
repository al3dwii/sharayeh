// src/app/(pages)/blog/blog-posts.tsx
import Link from 'next/link';
import styles from './blog-posts.module.css'; // We'll create this CSS module next

interface BlogPost {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
}

interface BlogPostsProps {
  posts: BlogPost[];
}

export function BlogPosts({ posts }: BlogPostsProps) {
  if (!posts || posts.length === 0) {
    return <p>No posts available</p>;
  }

  return (
    <section className={styles.postsContainer}>
      {posts.map((post) => (
        <article key={post.slug} className={styles.postCard}>
          <h2 className={styles.postTitle}>{post.title}</h2>
          <time dateTime={post.date} className={styles.postDate}>
            {new Date(post.date).toLocaleDateString()}
          </time>
          <p className={styles.postExcerpt}>{post.excerpt}...</p>
          <Link href={`/blog/${post.slug}`} className={styles.readMoreLink}>
            Read more
          </Link>
        </article>
      ))}
    </section>
  );
}
