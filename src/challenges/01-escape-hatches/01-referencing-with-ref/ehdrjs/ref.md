# React Ref 정리

## Ref가 어떻게 동작하는지

- `useRef(초기값)`으로 만든 ref는 **리렌더 사이에서 같은 객체를 유지**한다.
- 값은 `ref.current`에 담기고, `current`를 바꿔도 **리렌더링이 일어나지 않는다**.
- DOM에 붙일 때: `ref={videoRef}` 처럼 JSX에 넘기면, 마운트 후 `ref.current`에 해당 **실제 DOM 노드**가 들어온다.

```tsx
import { useRef, useState } from 'react';

function Counter() {
  const countRef = useRef(0);
  const [count, setCount] = useState(0);

  return (
    <>
      <p>count (state): {count}</p>
      <p>countRef.current: {countRef.current}</p>
      <button onClick={() => setCount(c => c + 1)}>state +1</button>
      <button onClick={() => { countRef.current += 1; }}>ref +1</button>
    </>
  );
}
// "state +1" 클릭 → 화면 숫자 둘 다 올라감 (리렌더되면서 countRef.current도 다시 읽힘)
// "ref +1" 클릭 → 화면 숫자는 그대로! (리렌더 없음. countRef.current만 메모리 안에서 증가)
```

### Ref가 리렌더링 후에도 “변경되지 않는” 이유

- `useRef()`는 **컴포넌트가 처음 마운트될 때 한 번만** ref 객체를 만들고, 그 **같은 객체 참조**를 계속 반환한다.
- 리렌더 시에는 컴포넌트 함수만 다시 실행될 뿐, React가 그 ref **객체 자체는 그대로 유지**해 준다. 즉, “컴포넌트 인스턴스당 하나의 박스”가 있고, 우리가 바꾸는 것은 그 박스 **안의** `current` 값뿐이다.
- React는 **참조 동일성**으로 변경을 본다. `ref`가 가리키는 객체는 그대로이므로 “참조가 바뀌었다”고 보지 않고, 그래서 **리렌더를 일으키지 않는다**. 반대로 state는 `setState`로 새 값이 들어오면 “변경됐다”고 보고 리렌더를 한다.

```tsx
// 마운트 시: ref = { current: 0 }  ← 이 객체가 한 번 만들어짐
// 리렌더 1: ref = { current: 1 }   ← 같은 객체! current만 바뀜
// 리렌더 2: ref = { current: 2 }   ← 여전히 같은 객체

// 반면 state는:
// setCount(1) → React가 새 값으로 "교체" → "변경됐다" → 리렌더
// ref.current = 1 → 객체는 그대로, 내부 필드만 수정 → "참조 동일" → 리렌더 X
```

---

## Ref vs State

|               | **State**             | **Ref**                                   |
| ------------- | --------------------- | ----------------------------------------- |
| **변경 시**   | 리렌더링 O            | 리렌더링 X                                |
| **용도**      | 화면에 보여줄 데이터  | 리렌더 없이 “기억”만 할 값, 또는 DOM 참조 |
| **읽기/쓰기** | `setState()`로만 변경 | `ref.current = 값` 직접 수정              |

- **화면에 반영해야 하는 값** → `useState`
- **타이머 ID, 이전 값, DOM 노드**처럼 **리렌더 없이 유지할 값** → `useRef`
- `setTimeout` 콜백 안에서는 **클로저 때문에 옛날 state**만 보이므로, “그때그때 최신 값”이 필요하면 ref에 같이 써주는 패턴을 쓴다. (예: `Ref로 값 참조하기/c4.tsx`)

---

## DOM 조작할 때 Ref를 쓰는 이유

- **재생/일시정지, focus, scroll** 같은 건 브라우저 **DOM API**(`element.play()`, `element.focus()` 등)가 필요하고, 이 API들은 **특정 DOM 노드**를 알아야 한다.
- **JSX에 `ref`를 걸면** React가 그 요소의 실제 DOM 노드를 `ref.current`에 넣어준다. 그래서 “이 JSX = 이 DOM”이 안정적으로 이어지고, `querySelector` 없이 해당 노드로 API를 호출할 수 있다.
