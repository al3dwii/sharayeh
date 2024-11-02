// apps/nextjs/src/app/[lang]/(marketing)/blog/[id]/page.tsx
import { getAllPosts, Post } from "@/utils/posts";
import { notFound } from "next/navigation";

interface BlogPostPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((_, index) => ({
    id: index.toString(),
  }));
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const allPosts = getAllPosts();
  const post = allPosts[parseInt(params.id)];

  if (!post) return notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      <time dateTime={post.date}>{post.date}</time>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
