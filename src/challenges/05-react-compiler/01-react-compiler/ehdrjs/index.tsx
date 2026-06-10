import MdRenderer from "@/components/MdRenderer";
import reactCompilerMd from "./react-compiler.md?raw";
import Example1 from "./example1";

export default function Ehdrjs() {
  return (
    <div>
      <h4>React Compiler</h4>
      <Example1 />
      <MdRenderer markdown={reactCompilerMd} title="useState" />
    </div>
  );
}
