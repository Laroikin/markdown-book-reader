import { remark } from "remark";
import remarkGfm from "remark-gfm";

export default async function markdownToHtml(markdown: string) {
  const result = await remark().use(remarkGfm).process(markdown);
  return result.toString();
}
