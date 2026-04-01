/* eslint-disable react-hooks/purity */
import { useState, useTransition, memo } from "react";

const SearchResults = memo(function SearchResults({ query }: { query: string }) {
  if (!query) return <p style={{ color: "#aaa" }}>검색어를 입력하세요.</p>;

  const start = performance.now();
  while (performance.now() - start < 120) {
    Math.sqrt(Math.random() * 9999);
  }

  return (
    <ul style={{ margin: 0, padding: "0 0 0 20px" }}>
      {Array.from({ length: 20 }, (_, i) => (
        <li key={i} style={{ marginBottom: 4 }}>
          "{query}" 검색 결과 #{i + 1}
        </li>
      ))}
    </ul>
  );
});

export default function Example1() {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [useTransitionEnabled, setUseTransitionEnabled] = useState(true); // ← 토글

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);

    if (useTransitionEnabled) {
      startTransition(() => {
        setQuery(e.target.value);
      });
    } else {
      setQuery(e.target.value); // ← transition 없음 → 블로킹 발생
    }
  }

  return (
    <section>
      <h4>Example1 - useTransition으로 검색 입력 끊김 방지</h4>

      {/* 토글 버튼 */}
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => {
            setUseTransitionEnabled((prev) => !prev);
            setInputValue("");
            setQuery("");
          }}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            border: "2px solid",
            borderColor: useTransitionEnabled ? "#1976d2" : "#e53935",
            background: useTransitionEnabled ? "#e3f2fd" : "#ffebee",
            color: useTransitionEnabled ? "#1976d2" : "#e53935",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {useTransitionEnabled ? "✅ useTransition ON" : "❌ useTransition OFF"}
        </button>
        <span style={{ marginLeft: 10, fontSize: 13, color: "#555" }}>
          {useTransitionEnabled ? "타이핑이 끊기지 않습니다" : "타이핑할 때마다 블로킹됩니다"}
        </span>
      </div>

      <input
        value={inputValue}
        onChange={handleChange}
        placeholder="빠르게 타이핑해 보세요..."
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 6,
          border: `2px solid ${useTransitionEnabled ? "#1976d2" : "#e53935"}`,
          fontSize: 15,
          marginBottom: 12,
          boxSizing: "border-box",
          outline: "none",
        }}
      />

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 16,
          minHeight: 80,
          opacity: isPending ? 0.4 : 1,
          transition: "opacity 0.15s",
          position: "relative",
        }}
      >
        {isPending && (
          <span style={{ position: "absolute", top: 12, right: 12, fontSize: 12, color: "#888" }}>⏳ 검색 중...</span>
        )}
        <SearchResults query={query} />
      </div>
    </section>
  );
}
