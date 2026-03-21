## useEffectEvent

### useEffectEvent란

`useEffectEvent`는 Effect 내부에서 호출할 "이벤트 함수"를 만든다.

- 함수 참조(identity)는 안정적
- 함수 내부에서 읽는 값은 항상 최신 렌더 기준

즉,

- effect 재실행 조건(deps)은 최소화하고
- 콜백에서는 최신값을 안전하게 읽는다

---

### 왜 필요할까?

`useEffect` 안에서 등록한 콜백(이벤트 리스너, interval, subscription 등)은  
등록 시점의 state/props를 클로저로 잡는다.

그래서 다음 문제가 자주 생긴다.

- 최신 값을 읽으려고 deps를 늘리면 effect가 자주 재실행됨
- 재연결/재구독이 불필요하게 반복되어 성능과 코드 가독성이 떨어짐

`useEffectEvent`는 이 상황에서  
**"등록 로직은 안정적으로 유지"**하면서도  
**"콜백 내부에서 최신 state/props를 읽을 수 있게"** 해주는 훅이다.

---

### 언제 쓰면 좋을까?

- `useEffect` 안에서 등록한 콜백이 최신 state/props를 읽어야 할 때
- 구독/연결은 유지하고, 콜백 동작만 최신값 기준으로 바꾸고 싶을 때
- deps를 늘려서 불필요한 재등록이 반복되는 문제를 줄이고 싶을 때

대표 예:

- WebSocket `onmessage`
- `setInterval` / `setTimeout` 콜백
- DOM 이벤트 리스너(`addEventListener`)

---

### 기본 형태

```tsx
const onSomething = useEffectEvent(() => {
  // 최신 state/props 접근
});

useEffect(
  () => {
    // 외부 시스템 연결/등록
    // ...

    // Effect 내부에서 onSomething 호출
    // ...

    return () => {
      // cleanup
    };
  },
  [
    /* 연결 자체에 필요한 deps만 */
  ],
);
```

---

### 핵심 동작 포인트

1. `useEffectEvent`로 콜백 로직을 분리한다.
2. `useEffect`에는 "연결/등록"에 필요한 deps만 넣는다.
3. 등록된 핸들러 안에서 Effect Event를 호출해 최신값을 읽는다.

이렇게 하면 "연결 수명"과 "콜백이 참조하는 값"을 분리할 수 있다.

---

### Example 1 (채팅 연결 + 테마 알림)

```tsx
import { useEffect, useEffectEvent } from "react";

function ChatRoom({ roomId, theme }: { roomId: string; theme: string }) {
  const onConnected = useEffectEvent(() => {
    // 항상 최신 theme 기준으로 동작
    showNotification("Connected!", theme);
  });

  useEffect(() => {
    const conn = createConnection(roomId);
    conn.on("connected", () => {
      onConnected();
    });
    conn.connect();

    return () => conn.disconnect();
  }, [roomId]); // 연결 대상(roomId)만 의존

  return null;
}
```

포인트:

- `theme`가 바뀌어도 연결을 끊고 다시 연결할 필요는 없음
- 하지만 알림 표시 로직은 최신 `theme`를 사용해야 함
- 이때 `useEffectEvent`가 가장 깔끔하게 문제를 분리해준다

---

### Example 2 (pointermove + canMove 토글)

```tsx
import { useEffect, useEffectEvent, useState } from "react";

export default function PointerMoveGood() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  const onMove = useEffectEvent((e: PointerEvent) => {
    if (canMove) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  });

  useEffect(() => {
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []); // 리스너는 한 번만 등록

  return (
    <label>
      <input
        type="checkbox"
        checked={canMove}
        onChange={(e) => setCanMove(e.target.checked)}
      />
      점 움직이게 하기
    </label>
  );
}
```

---

### `useEffectEvent` 없이 작성하면 왜 린트 경고가 뜰까?

아래처럼 Effect 바깥에서 만든 `handleMove`를 Effect 안에서 사용하면서 deps를 `[]`로 두면,  
`eslint-plugin-react-hooks`의 `exhaustive-deps` 경고가 뜬다.

```tsx
const handleMove = (e: PointerEvent) => {
  if (canMove) {
    setPosition({ x: e.clientX, y: e.clientY });
  }
};

useEffect(() => {
  window.addEventListener("pointermove", handleMove);
  return () => window.removeEventListener("pointermove", handleMove);
}, []); // ❌ handleMove 누락
```

경고가 뜨는 이유:

- Effect 본문에서 `handleMove`를 참조했는데 deps에 없음
- `handleMove`는 `canMove`를 클로저로 잡고 있어서 stale closure 문제가 생길 수 있음
- 실제로 체크박스를 꺼도 점이 계속 움직이는 버그로 이어질 수 있음
- 즉, 린트는 stale closure 버그를 미리 막으려고 경고함

그렇다고 `handleMove`를 deps에 넣으면:

```tsx
useEffect(() => {
  window.addEventListener("pointermove", handleMove);
  return () => window.removeEventListener("pointermove", handleMove);
}, [handleMove]); // canMove 변경 때마다 리스너 재등록
```

- 최신 값은 읽을 수 있지만 리스너를 계속 재등록하게 된다.

`useEffectEvent`는 이 딜레마를 해결한다.

- 등록(`addEventListener`)은 한 번 유지
- 콜백 내부 값(`canMove`)은 항상 최신값 사용

즉, 린트 규칙을 억지로 무시하지 않고,  
의도(등록 수명 vs 최신 값 접근)를 코드로 명확히 분리할 수 있다.

### 동작 원리: 어떻게 의존성 없이 최신값을 읽을 수 있을까?

내부 구현을 개념 코드로 표현하면:

```tsx
function useEffectEvent(fn) {
  const ref = useRef(fn);

  // 매 렌더마다, 화면 그리기 전에 동기적으로 최신 fn 저장
  useLayoutEffect(() => {
    ref.current = fn;
  });

  // 참조값은 절대 바뀌지 않는 래퍼 반환
  return useCallback((...args) => {
    return ref.current(...args); // 호출 시 최신 fn 실행
  }, []);
}
```

두 가지가 동시에 성립한다.

|           | 방법                         | 효과                                          |
| --------- | ---------------------------- | --------------------------------------------- |
| 함수 참조 | `useCallback(..., [])`       | 절대 바뀌지 않음 → useEffect 재실행 없음      |
| 함수 내용 | `useLayoutEffect`로 ref 갱신 | 이벤트 발생 전에 항상 최신 로직으로 교체 완료 |

이게 가능한 이유는 **실행 순서 보장** 덕분이다.

```
① 렌더링          컴포넌트 함수 실행 → 최신 state/props를 잡은 새 fn 클로저 생성
② DOM 커밋        React가 변경사항을 실제 DOM에 반영
③ useLayoutEffect 동기 실행 (화면 그리기 전) → ref.current = 최신 fn 으로 갱신
④ 브라우저 paint  화면 그리기
⑤ useEffect 실행  (화면 그린 후, 비동기)
                    └─ 마운트 시: addEventListener로 래퍼 함수 등록
                    └─ 리렌더 시: 래퍼 참조 동일 → deps 변화 없음 → 재실행 안 됨
--- 이후 사용자 상호작용 ---
⑥ 이벤트 발생     등록된 래퍼 함수 호출 → ref.current() 실행
                    이 시점의 ref.current는 ③에서 이미 최신값으로 갱신된 상태 ✅
```

`useLayoutEffect`(③)는 항상 `useEffect`(⑤)와 이벤트(⑥)보다 먼저 완료된다.  
그래서 래퍼 함수가 호출될 때 `ref.current`는 반드시 최신 fn을 가리키고 있다.

쉽게 말하면, **번호판(참조값)은 그대로인데 차 안의 짐(실제 로직)은 매 렌더마다 교체**되는 구조다.  
useEffect는 번호판만 비교하므로 재실행하지 않고, 실제 로직은 항상 최신 상태다.

참고: https://handhand.tistory.com/entry/understanding-react-useeffectevent

---

### 주의할 점

- `useEffectEvent`는 **Effect 내부에서 호출하는 용도**로 사용한다.
- "무조건 deps를 줄이기 위한 도구"가 아니라,  
  **연결 수명과 콜백 로직의 관심사를 분리**할 때 사용한다.
- 네트워크 요청 자체가 특정 값 변화에 따라 다시 실행돼야 한다면,  
  그 값은 여전히 `useEffect` deps에 포함해야 한다.

---

### 핵심 요약

- `useEffectEvent`는 Effect 안의 콜백에서 **최신 state/props**를 안전하게 읽기 위한 훅이다.
- 등록/구독의 수명과 콜백 로직을 분리해 **불필요한 재실행**을 줄인다.
