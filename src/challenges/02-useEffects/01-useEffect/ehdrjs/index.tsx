import Example1 from "./example1";
import Example2 from "./example2";
import Example3 from "./example3";
import useEffectMd from "./useEffect.md?raw";
import MdRenderer from "@/components/MdRenderer";

export default function Ehdrjs() {
  return (
    <div>
      <h4>useEffect</h4>
      <span>useEffect의 동작 방식</span>
      <ul>
        <li>1. 리렌더링 후 DOM 업데이트</li>
        <li>2. depth 값이 바뀔 때마다 실행됨</li>
      </ul>
      <Example1 />
      <br />
      <Example2 />
      <br />
      <Example3 />
      <br />
      <MdRenderer markdown={useEffectMd} title="useEffect" />

    </div>
  );
}
