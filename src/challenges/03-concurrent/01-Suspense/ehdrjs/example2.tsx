import { Suspense, useState, use } from "react";

type SectionData = { label: string; content: string };

function fetchSection(label: string, delayMs: number): Promise<SectionData> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ label, content: `${delayMs}ms 후 로드된 데이터` }), delayMs),
  );
}

function Section({ promise, color }: { promise: Promise<SectionData>; color: string }) {
  const data = use(promise);
  return (
    <div
      style={{
        padding: "12px 16px",
        border: `2px solid ${color}`,
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <strong>{data.label}</strong>
      <span style={{ color: "#888", marginLeft: 8 }}>({data.content})</span>
    </div>
  );
}

const SECTIONS = [
  { label: "📌 사이드바", delayMs: 800, color: "#2196f3" },
  { label: "📰 피드", delayMs: 1600, color: "#9c27b0" },
  { label: "📢 광고", delayMs: 2400, color: "#ff9800" },
] as const;

type Promises = [Promise<SectionData>, Promise<SectionData>, Promise<SectionData>];

export default function Example2() {
  const [promises, setPromises] = useState<Promises | null>(null);

  function handleToggle() {
    if (promises) {
      setPromises(null);
    } else {
      setPromises(SECTIONS.map((s) => fetchSection(s.label, s.delayMs)) as unknown as Promises);
    }
  }

  return (
    <section>
      <h4>Example2 - 중첩 Suspense boundary</h4>
      <p>
        각 컴포넌트가 독립된 <code>{"<Suspense>"}</code>로 감싸져 있어서,
        <br />
        준비된 컴포넌트부터 순서대로 표시된다.
      </p>

      <button onClick={handleToggle}>{promises ? "리셋" : "레이아웃 불러오기"}</button>

      {promises && (
        <div style={{ marginTop: 16 }}>
          {/* 각각 독립된 Suspense → 서로 블로킹하지 않음 */}
          {SECTIONS.map((s, i) => (
            <Suspense key={s.label} fallback={<div style={{ color: s.color }}>⏳ {s.label} 로딩 중...</div>}>
              <Section promise={promises[i]} color={s.color} />
            </Suspense>
          ))}
        </div>
      )}
    </section>
  );
}
