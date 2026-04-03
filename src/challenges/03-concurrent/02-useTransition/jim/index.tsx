import MdRenderer from "@/components/MdRenderer";
import useTransitionMd from "./useTransition.md?raw";
import Example from "./example";

export default function index() {
  return (
    <div>
      <Example />
      <br />
      <MdRenderer markdown={useTransitionMd} title="useTransition" />
    </div>
  );
}
