import MdRenderer from "@/components/MdRenderer";
import useOptimisticMd from "./useOptimistic.md?raw";
import Example1 from "./example1";

export default function Ehdrjs() {
  return (
    <div>
      <h4>useOptimistic</h4>
      <Example1 />
      <br />
      <MdRenderer markdown={useOptimisticMd} title="useOptimistic" />
    </div>
  );
}
