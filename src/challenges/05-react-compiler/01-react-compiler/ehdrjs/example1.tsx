import { useState, memo } from "react";

type CardProps = {
  label: string;
  payload?: { id: number };
};

// memo: props가 이전과 같으면(얕은 비교) 리렌더 스킵
const Card = memo(function Card({ label, payload }: CardProps) {
  // 이 로그가 찍히면 = 실제로 리렌더된 것
  console.log(`Card ${label} rendered`, payload?.id);
  return <p>{label}</p>;
});

export default function Example1() {
  // count가 바뀔 때마다 App이 리렌더 → 아래 JSX 전체가 다시 평가됨
  const [count, setCount] = useState(0);

  return (
    <section>
      <button onClick={() => setCount((c) => c + 1)}>부모 +1 ({count})</button>

      {/*
        payload={{ id: 1 }} 는 매 렌더마다 "새 객체"가 만들어짐.
        → 참조가 매번 달라서 memo의 얕은 비교가 항상 "변경됨" 판정
        → 컴파일러 OFF: 버튼 누를 때마다 Card A/B 모두 리렌더 (로그 찍힘)
        → 컴파일러 ON : 컴파일러가 객체를 자동 캐싱해 같은 참조를 돌려줌
                        → memo 비교 통과 → 리렌더 스킵 (로그 안 찍힘)
      */}
      <Card label="A" payload={{ id: 1 }} />
      <Card label="B" payload={{ id: 2 }} />
    </section>
  );
}
