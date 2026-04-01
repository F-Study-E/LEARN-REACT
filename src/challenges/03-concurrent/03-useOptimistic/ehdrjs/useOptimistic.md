## useOptimistic

: 비동기 작업(서버 요청 등)이 완료되기 **전에** 미리 결과를 반영해 UI가 즉각 반응하는 것처럼 만드는 훅.
작업이 실패하면 자동으로 이전 상태로 롤백된다.

```tsx
const [optimisticState, addOptimistic] = useOptimistic(state, updateFn);
```

- `state` — 실제(서버 확인된) 상태
- `updateFn(currentState, optimisticValue)` — 낙관적 상태를 계산하는 순수 함수
- `optimisticState` — 낙관적으로 업데이트된 상태 (렌더링에 사용)
- `addOptimistic(optimisticValue)` — 낙관적 업데이트를 트리거하는 함수

---

### 문제 배경
네트워크 요청은 항상 딜레이가 있다.
기존 방식은 서버 응답이 올 때까지 UI가 멈춰있거나, 별도 로딩 상태를 직접 관리해야 했다.

```tsx
// 좋아요 버튼 — 기존 방식
function LikeButton({ postId, liked }: { postId: number; liked: boolean }) {
  const [isLiked, setIsLiked] = useState(liked);
  const [isPending, setIsPending] = useState(false);

  async function handleLike() {
    setIsPending(true);          // 🔴 로딩 상태 직접 관리
    try {
      const result = await toggleLike(postId);  // 서버 응답 대기... (200ms~1s)
      setIsLiked(result.liked);  // 응답 오면 그때서야 UI 변경
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button onClick={handleLike} disabled={isPending}>
      {isPending ? "처리 중..." : isLiked ? "❤️" : "🤍"}
    </button>
  );
}

```
---

### useOptimistic으로 개선해보자

```tsx
import { useOptimistic, useTransition } from "react";

function LikeButton({ postId, liked }: { postId: number; liked: boolean }) {
  const [isPending, startTransition] = useTransition();

  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    liked,
    (currentState, optimisticValue: boolean) => optimisticValue  // ✅ 낙관적 값을 그대로 사용
  );

  async function handleLike() {
    startTransition(async () => {
      setOptimisticLiked(!optimisticLiked);  // 🟢 즉시 UI 변경!
      await toggleLike(postId);              // 서버 요청은 백그라운드에서
      // 완료 후 → 부모에서 실제 liked 값이 내려오면 자동으로 교체됨
    });
  }

  return (
    <button onClick={handleLike} style={{ opacity: isPending ? 0.7 : 1 }}>
      {optimisticLiked ? "❤️" : "🤍"}
    </button>
  );
}
```

```
사용자: "좋아요" 클릭
UI:     [❤️ 즉시 표시] ← 서버 응답 안 기다림
서버:   (백그라운드에서 처리 중...)
서버:   응답 → 실제 liked 값으로 자동 교체 (이미 같은 값이면 그냥 유지)
```

### 동작 흐름

```
사용자 액션
  → addOptimistic(value) 호출 → optimisticState 즉시 업데이트
  → 비동기 작업 실행 (서버 요청 등)
  → 성공: 실제 state 업데이트 → optimisticState = state (동기화)
  → 실패: 실제 state 그대로 → optimisticState = state (롤백)

```

핵심: transition이 완료되면 optimisticState는 자동으로 state(실제 값)로 되돌아간다.

<details> 
<summary>내부적으로 어떻게 구현되어 있나요?</summary>

useOptimistic은 내부적으로 useReducer + transition 메커니즘의 조합이다.

```
React 렌더링 사이클에서:

1. transition 안에서 addOptimistic() 호출
   → React: "이건 낙관적 업데이트야. 실제 state 말고 이걸 보여줘"

2. 현재 렌더: optimisticState = updateFn(state, optimisticValue)
   → 즉시 반영

3. transition 완료 (서버 응답 → 실제 state 변경)
   → React: "낙관적 오버라이드 해제. 이제 실제 state 써"
   → optimisticState = state (실제 값)

4. transition 실패 (서버 에러)
   → React: "낙관적 오버라이드 자동 롤백"
   → optimisticState = state (원래 값으로 복귀)
```

useTransition의 Lane 시스템 위에서 동작하기 때문에 — transition이 살아있는 동안만 낙관적 값이 유효하고, 완료/실패 시 자동으로 정리된다.
</details>

---

### 에러 났을 땐?

useOptimistic은 자동 롤백을 지원한다.

```
async function handleLike() {
  startTransition(async () => {
    setOptimisticLiked(!optimisticLiked);  // 낙관적 업데이트
    try {
      await toggleLike(postId);
    } catch (e) {
      // ❌ 서버 에러 발생 시
      // → transition 종료 → optimisticState가 자동으로 원래 liked 값으로 롤백!
      // 별도로 setOptimisticLiked(liked) 같은 처리 불필요
    }
  });
}

```
```
[정상 흐름]
클릭 → ❤️ 즉시 표시 → 서버 성공 → ❤️ 유지

[에러 흐름]
클릭 → ❤️ 즉시 표시 → 서버 실패 → 🤍 자동 롤백
```


### 주의 사항

- `useOptimistic`은 **`useTransition` 또는 async Action(<form action={asyncFn}> , useActionState) 내부**에서 사용해야 올바르게 동작한다.
- 낙관적 업데이트가 적용된 상태에서 에러가 발생하면 React가 자동으로 `state`로 되돌린다.
- `updateFn`은 순수 함수여야 한다. 이 함수를 여러 번 호출할 수 있다.
---
