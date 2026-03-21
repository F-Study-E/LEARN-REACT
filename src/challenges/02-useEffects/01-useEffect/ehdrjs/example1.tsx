import { useEffect, useState } from "react";

let count = 0; // 전역 변수 선언

export default function Example1() {
  const [state, setState] = useState(0);

  const increment = () => {
    count++; // 전역 변수 값 증가
    setState(state + 1); // state 변경으로 리렌더링 발생
  };

  useEffect(() => {
    console.log(`useEffect Run! ${count}`);
  }, [count]); // 리렌더링(state 값 변경) + count 값 변경 시 실행

  return (
    <div>
      <h4>Example1</h4>
      <p>state로 리렌더링 발생과 count 값이 변경될 때마다 useEffect 실행</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}