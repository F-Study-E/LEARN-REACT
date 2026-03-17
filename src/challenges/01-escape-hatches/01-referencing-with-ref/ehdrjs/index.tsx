import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/github.css";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import Chat1 from "./challenge1";
import Toggle from "./challenge2";
import Dashboard from "./challenge3";
import Chat2 from "./challenge4";
import refMdContent from "./ref.md?raw";

export default function Ehdrjs() {
  return (
    <div>
      <h4>challenge1</h4>
      <Chat1 />
      <h4>challenge2</h4>
      <Toggle />
      <h4>challenge3</h4>
      <Dashboard />
      <h4>challenge4</h4>
      <Chat2 />
      <hr />
      <section style={{ width: "min(900px, 100%)" }}>
        <article className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {refMdContent}
          </ReactMarkdown>
        </article>
      </section>
    </div >
  );
}