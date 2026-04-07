import { createContext, useContext, useMemo, useState, type ReactNode, type SetStateAction } from "react";

// context/CountContext.tsx
const CountContext = createContext<{ count: number; setCount: (v: SetStateAction<number>) => void } | null>(null);

export function CountProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const value = useMemo(() => ({ count, setCount }), [count]);
  return <CountContext.Provider value={value}>{children}</CountContext.Provider>;
}

function useCount() {
  const context = useContext(CountContext);
  if (!context) throw new Error("useCount는 CountProvider 안에서만 사용 가능");
  return context;
}

// children 패턴 (B 리렌더 안 됨)
export default function Example1() {
  return (
    <CountProvider>
      <A />
      <B />
    </CountProvider>
  );
}

function A() {
  console.log("A 렌더");
  const { count, setCount } = useCount();
  return <button onClick={() => setCount((c) => c + 1)}>count: {count}</button>;
}

function B() {
  console.log("B 렌더");
  return <div>나는 B</div>;
}
