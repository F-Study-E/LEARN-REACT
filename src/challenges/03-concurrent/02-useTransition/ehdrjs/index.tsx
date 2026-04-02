import MdRenderer from "@/components/MdRenderer";
import useTransitionMd from "./useTransition.md?raw";
import Example1 from "./example1";
import Example2 from "./example2";

export default function Ehdrjs() {
  return (
    <div>
      <h4>useTransition</h4>
      <Example1 />
      <br />
      <Example2 />
      <MdRenderer markdown={useTransitionMd} title="useTransition" />
    </div>
  );
}
