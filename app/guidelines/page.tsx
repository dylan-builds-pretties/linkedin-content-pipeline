import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

async function getGuidelines() {
  const filePath = path.join(process.cwd(), "content", "guidelines.md");
  const content = fs.readFileSync(filePath, "utf-8");
  return content;
}

export default async function GuidelinesPage() {
  const content = await getGuidelines();

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
      <article className="prose prose-slate dark:prose-invert max-w-4xl">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    </div>
  );
}
