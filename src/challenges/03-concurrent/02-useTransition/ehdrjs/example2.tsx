import { useState, useTransition, Suspense, use } from "react";

function createPromise(ms: number) {
  return new Promise<string>((resolve) => setTimeout(() => resolve(`${ms}ms 탭 내용입니다`), ms));
}

function TabContent({ promise }: { promise: Promise<string> }) {
  const data = use(promise); // promise가 pending이면 Suspense로 던짐
  return <div>{data}</div>;
}

export default function Example2() {
  const [tab, setTab] = useState("home");
  const [promise, setPromise] = useState(() => createPromise(300));
  const [isPending, startTransition] = useTransition();

  function handleTabClick(nextTab: string) {
    const ms = nextTab === "slow" ? 3000 : 300;
    startTransition(() => {
      setTab(nextTab);
      setPromise(createPromise(ms)); // 새 promise 생성
    });
  }

  function handleSlowWithoutTransition() {
    setPromise(createPromise(3000)); // transition 없음
  }

  return (
    <div>
      <nav style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["home", "about", "slow"].map((t) => (
          <button
            key={t}
            onClick={() => handleTabClick(t)}
            style={{
              opacity: isPending ? 0.5 : 1,
              fontWeight: tab === t ? "bold" : "normal",
            }}
          >
            {t}
          </button>
        ))}
        <button onClick={handleSlowWithoutTransition}>slow (transition 없음)</button>
      </nav>
      <Suspense fallback={<div>로딩 중... (Suspense fallback)</div>}>
        <TabContent promise={promise} />
      </Suspense>
    </div>
  );
}
