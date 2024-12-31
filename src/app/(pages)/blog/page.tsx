// /Users/omair/gadawel/src/app/(pages)/blog/page.tsx
import { compareDesc } from "date-fns";
import { BlogPosts } from "./blog-posts";
import { getAllPosts } from "@/utils/posts";
import { Footer } from "@/components/gadawel/footer";

export const metadata = {
  title: "Blog",
};

export default function BlogPage() {
  const allPosts = getAllPosts();
  const posts = allPosts
    .filter((post) => post.published)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return (
    <>
    <main className="m-8 p-8 ">
      <BlogPosts posts={posts} />
     

    </main>
     {/* <Footer /> */}
     </>
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
