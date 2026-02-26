"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto [&_th:first-child]:sticky [&_th:first-child]:left-0 [&_th:first-child]:z-10 [&_th:first-child]:bg-muted [&_td:first-child]:sticky [&_td:first-child]:left-0 [&_td:first-child]:z-10 [&_td:first-child]:bg-background [&_th:first-child]:whitespace-nowrap [&_td:first-child]:whitespace-nowrap [&_th:first-child]:px-3 [&_td:first-child]:px-3 [&_td:first-child]:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
      <table {...props}>{children}</table>
    </div>
  ),
};

export function TheoryView({ content }: { content: string }) {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-table:text-sm prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-td:border prose-th:border">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
