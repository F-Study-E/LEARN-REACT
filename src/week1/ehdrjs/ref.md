# React Ref 정리

## Ref가 어떻게 동작하는지

- **`useRef(초기값)`**으로 만든 ref는 **리렌더 사이에서 같은 객체를 유지**한다.
- 값은 **`ref.current`**에 담기고, `current`를 바꿔도 **리렌더링이 일어나지 않는다**.
- DOM에 붙일 때: `ref={videoRef}` 처럼 JSX에 넘기면, 마운트 후 `ref.current`에 해당 **실제 DOM 노드**가 들어온다.

```tsx
const videoRef = useRef<HTMLVideoElement>(null);
// ...
<video ref={videoRef} />
// videoRef.current === 실제 <video> DOM
```

---

## Ref vs State

| | **State** | **Ref** |
|---|---|---|
| **변경 시** | 리렌더링 O | 리렌더링 X |
| **용도** | 화면에 보여줄 데이터 | 리렌더 없이 “기억”만 할 값, 또는 DOM 참조 |
| **읽기/쓰기** | `setState()`로만 변경 | `ref.current = 값` 직접 수정 |

- **화면에 반영해야 하는 값** → `useState`
- **타이머 ID, 이전 값, DOM 노드**처럼 **리렌더 없이 유지할 값** → `useRef`
- `setTimeout` 콜백 안에서는 **클로저 때문에 옛날 state**만 보이므로, “그때그때 최신 값”이 필요하면 ref에 같이 써주는 패턴을 쓴다. (예: `Ref로 값 참조하기/c4.tsx`)

---

## DOM 조작할 때 Ref를 쓰는 이유

- React는 보통 **선언적**으로 UI를 그리기 때문에, `querySelector` 같은 식으로 DOM을 직접 찾지 않는다.
- **특정 JSX 요소**에 `ref`를 걸면, React가 그 요소에 대응하는 **실제 DOM 노드**를 `ref.current`에 넣어준다.
- 그래서 **재생/일시정지, focus, scroll** 같은 **브라우저/DOM API 호출**이 필요할 때 ref로 “그 요소의 핸들”만 받아서 쓰면 된다.
