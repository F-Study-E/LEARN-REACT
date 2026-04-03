import React, { Suspense, lazy, useState } from "react";

const DashboardComponent = () => (
  <div
    style={{
      padding: "20px",
      backgroundColor: "#f9f9f9",
      border: "1px solid #ddd",
      marginTop: "10px",
    }}
  >
    <h3>무거운 대시보드 컴포넌트</h3>

    <Suspense
      fallback={
        <div style={{ color: "blue", fontWeight: "bold" }}>
          내부 서스펜스 fallback(2초간 노출)
        </div>
      }
    >
      <UserStats />
    </Suspense>
  </div>
);

const HeavyDashboard = lazy(
  () =>
    new Promise<{ default: React.ComponentType }>((resolve) =>
      setTimeout(() => resolve({ default: DashboardComponent }), 2000),
    ),
);

const StatsComponent = () => (
  <div
    style={{
      padding: "15px",
      backgroundColor: "#eef2ff",
      border: "1px solid #c7d2fe",
      marginTop: "10px",
    }}
  >
    <h4>무거운 대시보드에서 2초 뒤 노출</h4>
  </div>
);

const UserStats = lazy(
  () =>
    new Promise<{ default: React.ComponentType }>(
      (resolve) => setTimeout(() => resolve({ default: StatsComponent }), 2000), // 대시보드 뜨고 나서 2초 더 소요
    ),
);

export default function App() {
  const [show, setShow] = useState(false);

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.5",
      }}
    >
      <h2>Suspense 중첩 및 코드 분할 실습</h2>
      <p>
        목표: <strong>계층적 비동기 렌더링</strong> 흐름 이해
      </p>

      {!show ? (
        <button onClick={() => setShow(true)}>start!</button>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {/* 최상위 Suspense: 전체 레이아웃을 감싸 초기 진입을 제어 */}
          <Suspense
            fallback={
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  backgroundColor: "#fffbe6",
                  border: "1px dashed #ffe58f",
                }}
              >
                2초간 fallback 노출
              </div>
            }
          >
            <HeavyDashboard />
          </Suspense>
        </div>
      )}
    </div>
  );
}
