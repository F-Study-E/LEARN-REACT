import MdRenderer from "@/components/MdRenderer";
import suspenseMd from "./suspense.md?raw";
import Example1 from "./example1";
import Example2 from "./example2";
import Example3 from "./example3";

export default function Ehdrjs() {
  return (
    <div>
      <h4>Suspense</h4>
      <Example1 />
      <br />
      <Example2 />
      <br />
      <Example3 />
      <br />
      <MdRenderer markdown={suspenseMd} title="Suspense" />
    </div>
  );
}
