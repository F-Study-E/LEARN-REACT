import { Suspense, use, useState, useTransition, useOptimistic } from "react";

// --- [1] 데이터 및 서버 시뮬레이션 ---
interface Todo {
  id: number;
  text: string;
  sending?: boolean;
}

const initialTodosPromise = new Promise<Todo[]>((res) =>
  setTimeout(() => res([{ id: 1, text: "React 19 마스터하기" }]), 1500),
);

const saveTodoToServer = async (text: string): Promise<Todo> => {
  await new Promise((res) => setTimeout(res, 2000)); // 2초 지연
  return { id: Math.random(), text };
};

export default function App() {
  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h2>useTransition On/Off 비교 실습</h2>
      <Suspense fallback={<p>📦 초기 목록 로딩 중...</p>}>
        <TodoContainer />
      </Suspense>
    </div>
  );
}

function TodoContainer() {
  const initialTodos = use(initialTodosPromise);
  const [todos, setTodo] = useState<Todo[]>(initialTodos);

  // 1. Transition 모드 설정을 위한 상태
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [optimisticTodos, addOptimisticTodo] = useOptimistic<Todo[], string>(
    todos,
    (state, newText) => [
      ...state,
      { id: Date.now(), text: newText, sending: true },
    ],
  );

  const handleAddTodo = async (formData: FormData) => {
    const text = formData.get("todo") as string;
    if (!text) return;

    // 공통 비동기 로직
    const runAsyncLogic = async () => {
      addOptimisticTodo(text);
      const newTodo = await saveTodoToServer(text);
      setTodo((prev) => [...prev, newTodo]);
    };

    if (isTransitionEnabled) {
      // [On] startTransition으로 감싸기
      startTransition(runAsyncLogic);
    } else {
      // [Off] 그냥 일반 비동기 함수로 실행
      runAsyncLogic();
    }
  };

  return (
    <div>
      {/* 토글 스위치 */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f0f4ff",
          borderRadius: "8px",
        }}
      >
        <label style={{ fontWeight: "bold", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={isTransitionEnabled}
            onChange={(e) => setIsTransitionEnabled(e.target.checked)}
          />
          useTransition 활성화 (현재: {isTransitionEnabled ? "On" : "Off"})
        </label>
        <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
          * Off 상태에서는 버튼의 '저장 중' 표시가 작동하지 않고 낙관적
          업데이트가 불안정해집니다.
        </p>
      </div>

      <form action={handleAddTodo} style={{ marginBottom: "20px" }}>
        <input name="todo" placeholder="할 일 입력..." disabled={isPending} />
        <button type="submit" disabled={isPending}>
          {isPending ? "⏳ 저장 중..." : "추가"}
        </button>
      </form>

      <ul style={{ opacity: isPending ? 0.6 : 1 }}>
        {optimisticTodos.map((todo) => (
          <li
            key={todo.id}
            style={{
              color: todo.sending ? "#999" : "#000",
              marginBottom: "5px",
            }}
          >
            {todo.text} {todo.sending && <span>(전송 중...)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
