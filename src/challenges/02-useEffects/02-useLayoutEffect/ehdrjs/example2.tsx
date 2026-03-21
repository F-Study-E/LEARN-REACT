import { useLayoutEffect, useState } from "react";

export default function Example2() {
  const [value, setValue] = useState(0);

  useLayoutEffect(() => {
    // 무거운 동기 작업을 넣으면 paint가 늦어진다.
    const start = performance.now();
    while (performance.now() - start < 300) {
      // busy wait (예시용)
    }
  }, [value]);

  return (
    <section>
      <h4>Example2 - useLayoutEffect 주의 케이스</h4>
      <span>무거운 동기 작업을 넣으면 paint가 늦어진다.</span>
      <p>클릭할 때마다 300ms 동기 작업을 수행하므로, 화면 업데이트가 잠깐 멈춘 듯 느껴질 수 있다.</p>
      <button onClick={() => setValue((v) => v + 1)}>클릭: {value}</button>
    </section>
  );
}