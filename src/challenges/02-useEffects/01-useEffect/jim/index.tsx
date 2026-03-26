import MdRenderer from "@/components/MdRenderer";
import useEffectMd from "./useEffext.md?raw";
import ScrollIndicator from "./example";

export default function index() {
  return (
    <div>
      <ScrollIndicator />
      <br />
      <MdRenderer markdown={useEffectMd} title="useEffect" />
    </div>
  );
}
