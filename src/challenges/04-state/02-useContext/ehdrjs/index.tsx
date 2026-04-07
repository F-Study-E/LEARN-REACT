import MdRenderer from "@/components/MdRenderer";
import useContext from "./useContext.md?raw";
import Example1 from "./example1";
import Example2 from "./example2";

export default function Ehdrjs() {
  return (
    <div>
      <h4>useContext</h4>
      <Example1 />
      <br />
      <Example2 />
      <MdRenderer markdown={useContext} title="useContext" />
    </div>
  );
}
