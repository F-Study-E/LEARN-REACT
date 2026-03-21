import Example1 from "./example1";
import Example2 from "./example2";
import useLayoutEffectMd from "./useLayoutEffect.md?raw";
import MdRenderer from "@/components/MdRenderer";

export default function Ehdrjs() {
  return (
    <div>
      <h4>useLayoutEffect</h4>

      <Example1 />
      <br />
      <Example2 />
      <br />
      <MdRenderer markdown={useLayoutEffectMd} title="useLayoutEffect" />
    </div>
  );
}