import { Spinner } from "@/components/ui/spinner";
import "highlight.js/styles/github-dark.css";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}

export function MarkdownMessage({
  content,
  isUser = false,
}: MarkdownMessageProps) {
  // Handle empty content
  if (!content || content.trim().length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Spinner className="size-4" />
        <span className="text-sm">Thinking...</span>
      </div>
    );
  }

  if (isUser) {
    // User messages - render as plain text
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  // Assistant messages - render as markdown
  return (
    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Customize code blocks
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            // Check if this is an inline code element by checking props
            const isInline = !match;
            return !isInline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code
                className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Customize paragraphs
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>;
          },
          // Customize lists
          ul({ children }) {
            return <ul className="mb-2 ml-4 list-disc">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="mb-2 ml-4 list-decimal">{children}</ol>;
          },
          // Customize headings
          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold mb-2 mt-4 first:mt-0">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-xl font-bold mb-2 mt-3 first:mt-0">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-lg font-bold mb-2 mt-2 first:mt-0">
                {children}
              </h3>
            );
          },
          // Customize blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2">
                {children}
              </blockquote>
            );
          },
          // Customize horizontal rules
          hr() {
            return <hr className="my-4 border-gray-300 dark:border-gray-600" />;
          },
          // Customize links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                {children}
              </a>
            );
          },
          // Customize tables
          table({ children }) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full border border-gray-300 dark:border-gray-600">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                {children}
              </td>
            );
          },
          // Customize pre (code block wrapper)
          pre({ children }) {
            return (
              <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto my-2">
                {children}
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
