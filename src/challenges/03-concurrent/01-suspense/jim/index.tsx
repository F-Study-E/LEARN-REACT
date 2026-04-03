import MdRenderer from "@/components/MdRenderer";
import suspenseMd from "./suspense.md?raw";
import Example from "./example";

export default function index() {
  return (
    <div>
      <Example />
      <br />
      <MdRenderer markdown={suspenseMd} title="Suspense" />
    </div>
  );
}
