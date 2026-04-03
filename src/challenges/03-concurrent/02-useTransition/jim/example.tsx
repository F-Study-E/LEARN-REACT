import React, { useState, useTransition } from "react";

// [핵심] 아주 많은 개수의 컴포넌트가 각각 연산을 수행하게 함
const HeavyCell = ({ val }: { val: number }) => {
  // 각 셀마다 아주 약간의 연산을 수행 (순수 함수 유지)
  let result = 0;
  for (let i = 0; i < 50000; i++) {
    result += Math.sqrt(i + val);
  }
  return (
    <div
      style={{
        width: 5,
        height: 5,
        backgroundColor: result > 0 ? "#3b82f6" : "#eee",
        display: "inline-block",
      }}
    />
  );
};

export default function App() {
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState("");
  const [items, setItems] = useState<number[]>([]);
  const [isTransitionMode, setIsTransitionMode] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    const updateLogic = () => {
      const newItems = Array.from({ length: 5000 }, (_, i) => i + value.length);
      setItems(newItems);
    };

    if (isTransitionMode) {
      // [Transition 모드] 리액트가 5,000개를 그리다가 입력을 받으면 양보함
      startTransition(updateLogic);
    } else {
      // [Blocking 모드] 5,000개를 다 그릴 때까지 브라우저가 멈춤
      updateLogic();
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h2>useTransition 성능 비교 테스트</h2>

      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f3f4f6",
        }}
      >
        <label>
          <input
            type="checkbox"
            checked={isTransitionMode}
            onChange={(e) => setIsTransitionMode(e.target.checked)}
          />
          <strong>
            useTransition 활성화 (지금 체크를 껐다 켰다 하며 타이핑해 보세요)
          </strong>
        </label>
      </div>

      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="빠르게 마구 타이핑하세요!"
        style={{
          padding: "10px",
          fontSize: "18px",
          width: "100%",
          marginBottom: "10px",
        }}
      />

      <div style={{ height: "24px", color: "blue" }}>
        {isPending ? "🔄 백그라운드 렌더링 중..." : "✅ 완료"}
      </div>

      <div
        style={{
          marginTop: "20px",
          lineHeight: 0,
          opacity: isPending ? 0.3 : 1,
        }}
      >
        {items.map((item) => (
          <HeavyCell key={item} val={item} />
        ))}
      </div>
    </div>
  );
}
