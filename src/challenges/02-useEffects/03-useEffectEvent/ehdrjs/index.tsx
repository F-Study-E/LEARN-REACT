import MdRenderer from "@/components/MdRenderer";
import useEffectEventMd from "./useEffectEvent.md?raw";
import Example1 from "./example1";
import Example2 from "./example2";

export default function Ehdrjs() {
  return (
    <div>
      <h4>useEffectEvent</h4>
      <Example1 />
      <Example2 />
      <MdRenderer markdown={useEffectEventMd} title="useEffectEvent" />
    </div>
  );
}
