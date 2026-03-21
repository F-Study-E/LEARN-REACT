import { useCallback, useEffect, useEffectEvent, useState } from "react";

export default function Example1() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <BadPointerMoveExample />
      <GoodPointerMoveExample />
    </div>
  );
}

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
        left: color === "red" ? -20 : 0,
        top: color === "red" ? -20 : 0,
        width: 40,
        height: 40,
        zIndex: 9999,
      }}
    />
  );
}

function BadPointerMoveExample() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);
  const handleMove = (e: PointerEvent) => {
    if (canMove) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  };

  /**
   * handleMove는 초기 렌더링 과정에서 생성된 handleMove 함수,
   * 초기 렌더링 과정에서 canMove가 true였으므로 초기 렌더링 과정에서 생성된 handleMove는 영원히 true를 바라보게 됨
   */
  useEffect(() => {
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <div style={{ position: "relative", minHeight: 90, border: "1px solid #ddd", padding: 12 }}>
      <h4>Bad: useEffect + eslint-disable</h4>
      <label>
        <input
          type="checkbox"
          checked={canMove}
          onChange={(e) => setCanMove(e.target.checked)}
        />
        빨간점 움직이게 하기 (끔으로 바꿔도 계속 움직일 수 있음)
      </label>
      <Dot position={position} color="red" />
    </div>
  );
}

function GoodPointerMoveExample() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  // 기존에는 useCallback을 사용하여 함수를 캐시화하고, useEffect의 의존성 배열에 넣어서 함수가 바뀌지 않도록 함
  // 그래도 문제는 canMove가 바뀌면 함수가 바뀌기 때문에 useEffect가 실행됨
  // const onMove = useCallback((e: PointerEvent) => {
  //   if (canMove) {
  //     setPosition({ x: e.clientX, y: e.clientY });
  //   }
  // }, [canMove]);

  // useEffect(() => {
  //   console.log('effect 실행')
  //   window.addEventListener("pointermove", onMove);
  //   return () => window.removeEventListener("pointermove", onMove);
  // }, [onMove]);

  const onMove = useEffectEvent((e: PointerEvent) => {
    if (canMove) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  });

  useEffect(() => {
    console.log('effect 실행')
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div style={{ position: "relative", minHeight: 90, border: "1px solid #ddd", padding: 12 }}>
      <h4>Good: useEffectEvent 사용</h4>
      <label>
        <input
          type="checkbox"
          checked={canMove}
          onChange={(e) => setCanMove(e.target.checked)}
        />
        파란점 움직이게 하기 (체크 상태를 즉시 반영)
      </label>
      <Dot position={position} color="blue" />
    </div>
  );
}