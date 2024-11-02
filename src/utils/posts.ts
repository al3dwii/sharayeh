import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Post {
  title: string;
  date: string;
  published: boolean;
  slug: string;
  content: string;
}

export function getAllPosts(): Post[] {
  const postsDirectory = path.join(process.cwd(), 'apps/nextjs/src/content/posts');

  // Check if the directory exists, and create it if it doesn't
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    return []; // Return an empty array as there are no posts yet
  }

  const filenames = fs.readdirSync(postsDirectory);
  return filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContents);

    return {
      title: data.title,
      date: data.date,
      published: data.published,
      slug: data.slug,
      content,
    };
  });
}

