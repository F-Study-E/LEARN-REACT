import { useEffect, useState } from "react";

export default function Example2() {
  const [id, setId] = useState(1);

  useEffect(() => {
    console.log("본문 실행", id);
    return () => {
      console.log("cleanup 실행", id);
    };
  }, [id]);

  return (
    <div>
      <h4>Example2</h4>
      클린업 함수 실행 예제
      <button onClick={() => setId((n) => n + 1)}>id++</button>
    </div>
  );
}