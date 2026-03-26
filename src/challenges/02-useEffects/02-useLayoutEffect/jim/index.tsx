import MdRenderer from "@/components/MdRenderer";
import useLayoutEffectMd from "./useLayoutEffect.md?raw";
import ScrollIndicator from "./example";

export default function index() {
  return (
    <div>
      <ScrollIndicator />
      <br />
      <MdRenderer markdown={useLayoutEffectMd} title="useLayoutEffect" />
    </div>
  );
}
