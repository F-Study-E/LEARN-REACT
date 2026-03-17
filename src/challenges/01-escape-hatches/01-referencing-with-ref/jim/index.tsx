import Chat from "./challenge1";
import Toggle from "./challenge2";
import Dashboard from "./challenge3";
import Chat4 from "./challenge4";
import refMarkdown from "./ref.md?raw";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/github.css";

export default function Jim() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      <Chat />
      <hr />
      <Toggle />
      <hr />
      <Dashboard />
      <hr />
      <Chat4 />
      <hr />
      <section style={{ width: "min(900px, 100%)" }}>
        <h2 style={{ margin: 0 }}>노트 (ref.md)</h2>
        <article
          className="markdown-body"
          style={{
            marginTop: "0.75rem",
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
            {refMarkdown}
          </ReactMarkdown>
        </article>
      </section>
    </div>
  );
}
