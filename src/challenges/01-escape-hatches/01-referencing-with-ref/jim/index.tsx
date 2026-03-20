import Chat from "./challenge1";
import Toggle from "./challenge2";
import Dashboard from "./challenge3";
import Chat4 from "./challenge4";
import refMarkdown from "./ref.md?raw";
import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/github.css";
import MdRenderer from "@/components/MdRenderer";

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

      <MdRenderer markdown={refMarkdown} title="useRef" />
    </div>
  );
}
