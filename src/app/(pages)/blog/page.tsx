// /Users/omair/gadawel/src/app/(pages)/blog/page.tsx
import { compareDesc } from "date-fns";
import { BlogPosts } from "./blog-posts";
import { getAllPosts, Post } from "@/utils/posts";

export const metadata = {
  title: "Blog",
};

export default function BlogPage() {
  const allPosts = getAllPosts();
  const posts = allPosts
    .filter((post) => post.published)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return (
    <main>
      <BlogPosts posts={posts} />
    </main>
  );
}

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
