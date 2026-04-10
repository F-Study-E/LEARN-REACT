import { createContext, useContext, useMemo, useState, type SetStateAction } from "react";

const CountContext = createContext<{ count: number; setCount: (v: SetStateAction<number>) => void } | null>(null);

function useCount() {
  const context = useContext(CountContext);
  if (!context) throw new Error("useCount는 CountProvider 안에서만 사용 가능");
  return context;
}

export default function Example2() {
  const [count, setCount] = useState(0);
  const value = useMemo(() => ({ count, setCount }), [count]);
  return (
    <CountContext.Provider value={value}>
      <A />
      <B />
    </CountContext.Provider>
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
