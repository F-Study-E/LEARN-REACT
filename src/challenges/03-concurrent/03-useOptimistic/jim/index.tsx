import MdRenderer from "@/components/MdRenderer";
import useOptimisticMd from "./useOptimistic.md?raw";
import Example from "./example";
import Example2 from "./example2";

export default function index() {
  return (
    <div>
      <Example />
      <br />
      <Example2 />
      <br />
      <MdRenderer markdown={useOptimisticMd} title="useOptimistic" />
    </div>
  );
}
