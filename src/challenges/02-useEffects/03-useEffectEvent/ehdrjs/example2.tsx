import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * useEffectEvent를 직접 구현한 버전
 *
 * 핵심:
 * - useLayoutEffect로 매 렌더마다 최신 fn을 ref에 저장
 * - useCallback([], [])으로 참조값이 절대 바뀌지 않는 래퍼 반환
 *
 * useLayoutEffect가 useEffect보다 먼저 실행되기 때문에,
 * 이벤트가 발생하는 시점엔 ref.current가 반드시 최신 fn을 가리킴
 */
function useMyEffectEvent<T extends (...args: never[]) => unknown>(fn: T): T {
  const ref = useRef(fn);

  useLayoutEffect(() => {
    ref.current = fn;
  });

  return useCallback((...args: never[]) => {
    return ref.current(...args);
  }, []) as T;
}

// ──────────────────────────────────────────

function Dot({ position, color }: { position: { x: number; y: number }; color: string }) {
  return (
    <div
      style={{
        position: "fixed",
        backgroundColor: color,
        borderRadius: "50%",
        opacity: 0.7,
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: "none",
        left: -30,
        top: 0,
        width: 40,
        height: 40,
        zIndex: 9999,
      }}
    />
  );
}

function UseMyEffectEventExample() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  const onMove = useMyEffectEvent((e: PointerEvent) => {
    if (canMove) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  });

  useEffect(() => {
    console.log("effect 실행 (한 번만 실행되어야 함)");
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
    // 공식 useEffectEvent는 린터가 이를 자동으로 인식하지만, 커스텀 훅은 그렇지 않음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "relative", minHeight: 90, border: "1px solid #ddd", padding: 12 }}>
      <h4>Manual: useMyEffectEvent (직접 구현)</h4>
      <label>
        <input
          type="checkbox"
          checked={canMove}
          onChange={(e) => setCanMove(e.target.checked)}
        />
        초록점 움직이게 하기 (체크 상태 즉시 반영)
      </label>
      <Dot position={position} color="green" />
    </div>
  );
}

export default function Example2() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <UseMyEffectEventExample />
    </div>
  );
}
