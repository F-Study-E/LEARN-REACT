import MdRenderer from "@/components/MdRenderer";
import useStateMd from "./useState.md?raw";
import Example1 from "./example1";
import Example2 from "./example2";

export default function Ehdrjs() {
  return (
    <div>
      <h4>useState</h4>
      <Example1 />
      <br />
      <Example2 />
      <MdRenderer markdown={useStateMd} title="useState" />
    </div>
  );
}
