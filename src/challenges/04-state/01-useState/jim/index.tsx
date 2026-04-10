import MdRenderer from "@/components/MdRenderer";
import useStateMd from "./useState.md?raw";

export default function index() {
  return (
    <div>
      <br />
      <MdRenderer markdown={useStateMd} title="useState" />
    </div>
  );
}
