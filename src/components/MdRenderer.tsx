import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "./MdRenderer.css";

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
      <article className="markdown-body md-renderer-card">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          // md 안에 있는 HTML(details/summary 등)을 실제로 렌더링하기 위함
          skipHtml={false}
        >
          {markdown}
        </ReactMarkdown>
      </article>
    </section>
  );
}
