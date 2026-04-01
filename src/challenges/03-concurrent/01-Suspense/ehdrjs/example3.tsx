import { Suspense, useEffect, useState } from "react";

function fakeApi(id: number): Promise<{ id: number; name: string }> {
  return new Promise((resolve) => setTimeout(() => resolve({ id, name: `User ${id}` }), 1500));
}

// ❌ useEffect로 데이터 페칭 — Suspense가 감지하지 못함
function UserWithEffect({ userId }: { userId: number }) {
  const [data, setData] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    fakeApi(userId).then(setData);
    // Promise를 throw하지 않고 setState로 처리
    // → Suspense는 이걸 전혀 모름
  }, [userId]);

  // Suspense fallback이 아닌 컴포넌트 내부에서 직접 처리해야 함
  if (!data) return <div style={{ color: "gray" }}>⏳ 컴포넌트 내부에서 처리 중...</div>;

  return <div style={{ color: "blue" }}>✅ {data.name}</div>;
}

export default function Example3() {
  return (
    <div>
      <h2>useEffect vs Suspense</h2>

      <section style={{ marginBottom: "2rem" }}>
        <h3>❌ useEffect 방식</h3>
        <p>Suspense fallback이 표시되지 않고, 컴포넌트 내부에서 직접 로딩 처리</p>

        {/* fallback을 선언했지만 useEffect 방식이라 전혀 표시되지 않음 */}
        <Suspense fallback={<div style={{ color: "red" }}>🔴 Suspense fallback (보이면 안 됨)</div>}>
          <UserWithEffect userId={1} />
        </Suspense>
      </section>

      <hr />

      <section style={{ color: "#888", fontSize: "0.9rem", marginTop: "1rem" }}>
        <p>👆 Suspense fallback(빨간 글씨)은 절대 표시되지 않습니다.</p>
        <p>useEffect는 렌더링이 끝난 후 실행되므로 Suspense가 감지할 수 없기 때문입니다.</p>
      </section>
    </div>
  );
}
