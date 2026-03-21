import { useEffect, useState } from "react";

function LeakyResizeListener() {
  useEffect(() => {
    const handler = () => {
      console.log("resize [누수]");
    };

    window.addEventListener("resize", handler);
    // ❌ cleanup 없음 — 언마운트 시 removeEventListener 되지 않음
  }, []);

  return <p>이 블록이 마운트된 동안 resize 리스너가 등록됩니다.</p>;
}

function SafeResizeListener() {
  useEffect(() => {
    const handler = () => {
      console.log("resize [클린업]");
    };

    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  }, []);

  return <p>언마운트 시 리스너가 제거됩니다.</p>;
}

export default function Example3() {
  const [mountedLeak, setMountedLeak] = useState(true);
  const [mountedSafe, setMountedSafe] = useState(true);

  return (
    <div>
      <h4>Example3 — 이벤트 리스너 (누수 vs 클린업)</h4>
      <p>콘솔 창에서 getEventListeners(window).resize를 통해 리스너 개수를 확인 가능</p>
      <section style={{ marginBottom: "1.5rem" }}>
        <h5>1) cleanup 없음 (누수)</h5>
        <p>
          언마운트 → 마운트를 여러 번 반복한 뒤 창 크기를 조절하면 "resize
          [누수]"가 여러 번 찍힙니다.
        </p>
        <button type="button" onClick={() => setMountedLeak((m) => !m)}>
          {mountedLeak ? "언마운트" : "다시 마운트"}
        </button>
        {mountedLeak && <LeakyResizeListener />}
      </section>

      <section>
        <h5>2) cleanup 있음 (removeEventListener)</h5>
        <p>
          같은 방식으로 반복해도, 마운트된 동안에는 항상 "resize
          [클린업]"가 한 번만 찍힙니다.
        </p>
        <button type="button" onClick={() => setMountedSafe((m) => !m)}>
          {mountedSafe ? "언마운트" : "다시 마운트"}
        </button>
        {mountedSafe && <SafeResizeListener />}
      </section>
    </div>
  );
}
