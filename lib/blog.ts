import fs from 'fs';
import path from 'path';

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  readingTime: string;
  image?: string;
  locale: string;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function parseFrontmatter(fileContent: string): {
  metadata: Record<string, string>;
  content: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, content: fileContent };
  }

  const metadata: Record<string, string> = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      metadata[key] = value;
    }
  }

  return { metadata, content: match[2].trim() };
}

export function getBlogPosts(locale: string): BlogPost[] {
  const localeDir = path.join(BLOG_DIR, locale);

  if (!fs.existsSync(localeDir)) {
    return [];
  }

  const files = fs.readdirSync(localeDir).filter((f) => f.endsWith('.md'));

  const posts = files.map((file) => {
    const slug = file.replace('.md', '');
    const raw = fs.readFileSync(path.join(localeDir, file), 'utf-8');
    const { metadata, content } = parseFrontmatter(raw);

    return {
      slug,
      title: metadata.title || slug,
      description: metadata.description || '',
      date: metadata.date || '',
      author: metadata.author || 'Swetlana Wagner',
      category: metadata.category || 'Numerologie',
      readingTime: metadata.readingTime || '5 min',
      image: metadata.image,
      locale,
      content,
    };
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string, locale: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, locale, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { metadata, content } = parseFrontmatter(raw);

  return {
    slug,
    title: metadata.title || slug,
    description: metadata.description || '',
    date: metadata.date || '',
    author: metadata.author || 'Swetlana Wagner',
    category: metadata.category || 'Numerologie',
    readingTime: metadata.readingTime || '5 min',
    image: metadata.image,
    locale,
    content,
  };
}
