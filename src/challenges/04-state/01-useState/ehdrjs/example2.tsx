import { useState } from "react";

export default function Example2() {
  const [count, setCount] = useState(0);

  console.log("count: ", count);

  return (
    <div>
      <h3>값 전달 vs 업데이터 함수</h3>
      <p>
        count: <strong>{count}</strong>
      </p>
      <button
        onClick={() => {
          setCount(count + 1);
          setCount(count + 1);
          setCount(count + 1);
        }}
      >
        ❌ count+1 × 3
      </button>{" "}
      <button
        onClick={() => {
          setCount((p) => p + 1);
          setCount((p) => p + 1);
          setCount((p) => p + 1);
        }}
      >
        ✅ prev+1 × 3
      </button>{" "}
      <button onClick={() => setCount(0)}>리셋</button>
    </div>
  );
}
