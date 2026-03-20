import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/github.css";

export default function MdRenderer({
  markdown,
  title,
}: {
  markdown: string;
  title?: string;
}) {
  return (
    <section style={{ width: "min(900px, 100%)" }}>
      <h2 style={{ margin: 0 }}>Note{title && `: ${title}`}</h2>
      <article
        className="markdown-body"
        style={{
          margin: "0.75rem 0",
          padding: "1rem 1.25rem",
          border: "1px solid #e5e5e5",
          borderRadius: 10,
          background: "#fff",
          width: "100%",
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {markdown}
        </ReactMarkdown>
      </article>
    </section>
  );
}
