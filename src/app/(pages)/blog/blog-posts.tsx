// // apps/nextjs/src/components/blog/blog-posts.tsx

// ./blog-posts.tsx
import Link from 'next/link';

interface BlogPostsProps {
  posts: {
    title: string;
    date: string;
    slug: string;
    content: string;
  }[];
}

export function BlogPosts({ posts }: BlogPostsProps) {
  if (!posts || posts.length === 0) {
    return <p>No posts available</p>;
  }

  return (
    <section>
      {posts.map((post) => (
        <article key={post.slug}>
          <h2>{post.title}</h2>
          <time dateTime={post.date}>{post.date}</time>
          <p>{post.content.slice(0, 100)}...</p>
          <Link href={`/blog/${post.slug}`}>Read more</Link>
        </article>
      ))}
    </section>
  );
}

// import Link from 'next/link';

// interface BlogPostsProps {
//   posts: {
//     title: string;
//     date: string;
//     content: string;
//   }[];
// }

// export function BlogPosts({ posts }: BlogPostsProps) {
//   return (
//     <section>
//       {posts.map((post, index) => (
//         <article key={index}>
//           <h2>{post.title}</h2>
//           <time dateTime={post.date}>{post.date}</time>
//           <p>{post.content.slice(0, 100)}...</p>
//           <Link href={`/blog/${index}`}>Read more</Link>
//         </article>
//       ))}
//     </section>
//   );
// }
