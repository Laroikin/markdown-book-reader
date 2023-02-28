import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import remarkParse from "remark-parse";

const pagesDirectory = join(process.cwd(), "_pages");

export function getPagesSlugs() {
  const files = fs.readdirSync(pagesDirectory);

  const slugs = files.map((file) => {
    return file.replace(/\.md$/, "");
  });

  return slugs;
}

export async function getPageBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(pagesDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {
      footnoteBackLabel: "",
    })
    .use(rehypeStringify)
    .process(matterResult.content);

  const contentHtml = processedContent.toString();

  return {
    slug: realSlug,
    contentHtml,
  };
}
