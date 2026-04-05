import { useState } from "react";

export default function Example1() {
  const [count, setCount] = useState(0);
  const [toggle, setToggle] = useState(false);

  console.log("렌더!");

  return (
    <div>
      <h3>Batching</h3>
      <p>
        count: <strong>{count}</strong>
      </p>
      <button
        onClick={() => {
          setCount((c) => c + 1);
          setCount((c) => c + 1);
          setCount((c) => c + 1);
          setToggle(!toggle);
        }}
      >
        동기 setState
      </button>
      <button
        onClick={() => {
          setTimeout(() => {
            setCount((c) => c + 1);
            setCount((c) => c + 1);
            setToggle(!toggle);
          }, 0);
        }}
      >
        setTimeout 안에서 setState
      </button>
      <button
        onClick={() => {
          setCount(0);
        }}
      >
        리셋
      </button>
    </div>
  );
}
