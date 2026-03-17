# useRef

리액트 기본 제공 훅으로 `{current: initialValue}` 형태의 ref 객체를 반환한다.

## 동작원리

첫 번째 렌더링에서 `{current: initialValue}` 객체 반환, 이 객체를 리액트가 저장해두기 때문에 이후 렌더링에서도 같은 객체를 반환한다.

```typescript
// useRef의 내부 구현 (개념적으로)
function useRef(initialValue) {
  const [ref, _] = useState({ current: initialValue });
  return ref; // setter는 쓰지 않음
}
```

`useState`는 값과 setter함수를 반환

```typescript
const [ref, _] = useState({ current: initialValue });
//      ↑     ↑
//    값    setter
```

ref의 경우

```typescript
// ref 방식 — 객체는 그대로, 내부 프로퍼티만 변경
const [ref, _] = useState({ current: 0 });
ref.current = 1; // 객체 자체는 동일, current만 바꿈 → 리렌더링 없음
```

> 객체 참조는 그대로이면서, `current` 프로퍼티만 직접 변경하는 것  
> -> 리액트 입장에선 같은 객체기에 변화를 감지하지 않고, 리렌더링을 발생시키지 않음

## cf. state

state와 ref의 가장 큰 차이가 렌더링 트리거 여부다.

### state는 snapshot처럼 동작한다

state는 렌더링 시점의 스냅샵임 -> 각 렌더링은 그 시점의 state 값을 캡처해서 이벤트 핸들러에 고정시킴

```typescript
function handleSend() {
  setIsSending(true);
  setTimeout(() => {
    // 이 시점에 isSending을 읽으면?
    // → 이 렌더링이 캡처한 스냅샷 값
    console.log(isSending); // 항상 false (변경 전 값)
  }, 3000);
}
```

`setIsSending(true)`을 호출했지만, 현재 렌더링의 클로저에 잡힌 isSending은 false임  
-> 따라서 false 반환  
-> 다음 렌더링이 일어나야 true가 됨

#### 참고 useState 내부 구현

리액트는 컴포넌트마다 훅 호출 순서를 기반으로 상태를 배열에 저장함

```typescript
// React 내부 (개념적으로)
const React = (function () {
  const hooks = []; // 컴포넌트의 모든 훅 상태를 저장하는 배열
  let index = 0; // 현재 어떤 훅인지 추적하는 포인터

  function useState(initialValue) {
    const currentIndex = index; // 이 useState가 사용할 슬롯 번호를 클로저로 고정

    // 처음 렌더링이면 초기값 저장
    if (hooks[currentIndex] === undefined) {
      hooks[currentIndex] = initialValue;
    }

    function setState(newValue) {
      hooks[currentIndex] = newValue; // 해당 슬롯에 새 값 저장
      render(); // 리렌더링 트리거
    }

    index++; // 다음 훅을 위해 포인터 이동
    return [hooks[currentIndex], setState];
  }

  function render(Component) {
    index = 0; // 렌더링 시작 전 포인터 초기화 (훅 호출 순서 보장)
    Component();
  }

  return { useState, render };
})();
```

```
const currentIndex = index; // 클로저로 고정
```

컴포넌트가 useState를 여러 번 호출하면, 각각의 setState가 자신의 슬롯 번호(currentIndex)를 기억해야 한다  
클로저 덕분에 각 setState는 자신이 담당하는 인덱스를 영구적으로 "캡처"함

```typescript
function Chat() {
  const [text, setText] = useState(""); // → hooks[0], currentIndex=0 고정
  const [isSending, setIsSending] = useState(false); // → hooks[1], currentIndex=1 고정
}
```

setText는 항상 hooks[0]만, setIsSending은 항상 hooks[1]만 사용

-> 그래서 조건문 안에서 훅을 호출하면 안됨

> 훅 배열의 포인터는 호출 순서에 의존하기 떄문에, 조건문 안에서 훅을 호출하면 인덱스가 뒤섞임  
> -> 그래서 훅은 최상위에서만 호출해야 함

### ref는 현재 값을 직접 가리킨다

ref의 `current` 변경은 리렌더링을 트리거하지 않음  
-> ref는 리액트가 추적하지 않는 순수한 JS 객체기때문

```typescript
function handleSend() {
  setIsSending(true);
  timeoutID.current = setTimeout(() => {
    // ref.current는 항상 "지금 이 순간"의 값
    // 스냅샷이 아니라 실제 객체를 직접 참조하므로
    // 언제 읽어도 최신 값
  }, 3000);
}

function handleUndo() {
  clearTimeout(timeoutID.current); // 언제나 최신 ID
}
```

### 왜 리렌더링이 안 일어날까

리액트는 state가 바뀌었는지를 객체 참조(주소)로 판단함

```typescript
// setter를 쓰면 → 새 값으로 교체 → React가 변화 감지 → 리렌더링
setCount(1); // hooks[0] = 1  ← 새 값

// ref.current를 직접 바꾸면 → 객체 주소는 동일 → React가 변화 감지 못함 → 리렌더링 없음
ref.current = 1; // hooks[0]은 여전히 같은 객체 { current: 1 }
```

메모리 관점에서 보면

```
최초 렌더링
  hooks[0] = { current: 0 }  ← 0x001 주소의 객체

ref.current = 1 실행 후
  hooks[0] = { current: 1 }  ← 여전히 0x001 주소 (같은 객체!)
  → React: "hooks[0] 주소 안 바뀌었네, 리렌더링 안 해도 되겠다"
```

-> setter를 사용하지 않는다 = 리액트에게 변경을 알리지 않는다
