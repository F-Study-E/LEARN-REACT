## useLayoutEffect

: DOM이 변경된 직후, **브라우저가 화면을 그리기 전에 동기적으로** 실행되는 이펙트 훅  
`useEffect`보다 실행 시점이 앞서기 때문에, 화면 깜빡임 없이 레이아웃 측정/보정이 필요할 때 사용한다.

---

### 동작 순서

1. state / props 변경
2. 리렌더
3. DOM 업데이트
4. **useLayoutEffect 실행**
5. 브라우저 페인트

### useEffect와 동작 차이

- `useEffect`
  - 화면이 먼저 그려진 뒤(paint 이후) 실행
  - 네트워크 요청, 구독/해제, 타이머 같은 일반 부수 효과에 적합
- `useLayoutEffect`
  - DOM 반영 후, paint 이전에 실행
  - 레이아웃 측정(`getBoundingClientRect`) 후 즉시 위치/크기 보정할 때 적합

즉,  
**"보여주기 전에 계산해서 바로 반영해야 하는가?"** -> `useLayoutEffect`  
그 외 대부분 -> `useEffect`

---

### 언제 사용하면 좋을까?

- 요소 크기/위치를 측정하고 바로 스타일을 보정해야 할 때
- 툴팁, 모달, 드롭다운처럼 "첫 프레임 위치가 틀리면" 깜빡이는 UI
- 스크롤 위치를 paint 전에 맞춰야 하는 경우

> 주의: `useLayoutEffect`는 동기적으로 실행되어 렌더링을 잠시 막을 수 있으므로, 꼭 필요한 경우에만 사용해야 한다.

---

### Example

```tsx
import { useLayoutEffect, useRef, useState } from "react";

export default function ExampleTooltip() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !tooltipRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // paint 전에 위치 계산을 끝내서 깜빡임을 방지한다.
    setTop(buttonRect.top - tooltipRect.height - 8);
    setLeft(buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2);
  }, [open]);

  return (
    <div style={{ padding: 40 }}>
      <button ref={buttonRef} onClick={() => setOpen((v) => !v)}>
        Toggle tooltip
      </button>

      {open && (
        <div
          ref={tooltipRef}
          style={{
            position: "fixed",
            top,
            left,
            background: "#111",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: 6,
          }}
        >
          useLayoutEffect로 위치 보정
        </div>
      )}
    </div>
  );
}
```

위 예제는 툴팁을 열 때 먼저 DOM을 만든 뒤, `useLayoutEffect`에서 크기/위치를 측정하고 즉시 좌표를 보정
그래서 사용자가 보는 첫 프레임부터 비교적 자연스러운 위치에 툴팁이 나타난다.

### Example 2 (주의 케이스)

```tsx
import { useLayoutEffect, useState } from "react";

export default function BadLayoutEffect() {
  const [value, setValue] = useState(0);

  useLayoutEffect(() => {
    // 무거운 동기 작업을 넣으면 paint가 늦어진다.
    const start = performance.now();
    while (performance.now() - start < 80) {
      // busy wait (예시용)
    }
  }, [value]);

  return <button onClick={() => setValue((v) => v + 1)}>클릭: {value}</button>;
}
```

이 코드는 클릭할 때마다 `useLayoutEffect`에서 80ms 동기 작업을 수행하므로,  
화면 업데이트가 잠깐 멈춘 듯 느껴질 수 있다.

---

### 핵심요약

- DOM 반영 직후, **브라우저가 그리기(paint) 전**에 **동기**로 실행된다.
- **쓰는 타이밍**: "첫 화면에 잘못된 위치/크기가 잠깐이라도 보이면 안 된다" → 레이아웃 측정 후 바로 보정할 때 `useLayoutEffect`를 고려한다.
- **주의**: `useLayoutEffect` 안에서 무거운 동기 작업을 하면 **페인트가 늦어져** UI가 버벅인다. 꼭 필요한 짧은 측정·보정에만 쓴다.
- **기본 원칙**: 의심되면 먼저 `useEffect`로 두고, 깜빡임·레이아웃 문제가 실제로 있을 때만 `useLayoutEffect`로 옮긴다.
