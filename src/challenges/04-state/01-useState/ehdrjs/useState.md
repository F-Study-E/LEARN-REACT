# useState

`useState`는 컴포넌트에 **state 변수**를 추가할 수 있는 React 훅이다.

```tsx
const [age, setAge] = useState(28);
const [name, setName] = useState('Taylor');
const [todos, setTodos] = useState(() => createTodos());
```

---

## 기본 사용법

### 매개변수

| 매개변수 | 설명 |
|---|---|
| `initialState` | state의 초기값. 모든 타입 가능. 함수를 넘기면 **초기화 함수**로 취급되며 최초 렌더 1회만 실행된다. 이후 렌더에서는 무시된다. |

### 반환값

`useState`는 정확히 두 개의 요소를 가진 배열을 반환한다.

| 반환값 | 설명 |
|---|---|
| `state` | 현재 렌더링 시점의 상태 값 (스냅샷) |
| `setState` | 상태를 업데이트하고 리렌더를 트리거하는 함수. 값 또는 **업데이터 함수**를 인자로 받는다. |

---

## 내부 동작 원리

### Fiber Node

React는 컴포넌트가 화면에 마운트될 때마다 **Fiber Node**라는 객체를 하나 생성한다.
state 훅 데이터는 이 Fiber Node 안에 저장된다.

```
Fiber Node 구조
─────────────────────────────
{
  type: MyComponent,        // 어떤 컴포넌트인지
  pendingProps: { id: 1 },  // 처리할 props
  memoizedState: ...,       // ← useState 값들이 여기에 저장됨
  memoizedProps: ...,       // 이전 렌더의 props
  updateQueue: ...,         // 상태 업데이트 큐
  ...
}
```

### Hook 연결 리스트

컴포넌트 안에 `useState`를 여러 개 쓰면, 각 훅은 **연결 리스트(Linked List)** 형태로 순서대로 연결된다. React는 호출 순서(index)로 각 훅을 식별한다.

```tsx
function MyComponent() {
  const [count, setCount] = useState(0);    // 첫 번째 훅
  const [name, setName]   = useState("");   // 두 번째 훅
  const [on, setOn]       = useState(true); // 세 번째 훅
}
```

Fiber 내부 구조:

```
Fiber.memoizedState
      │
      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Hook #1     │────▶│  Hook #2     │────▶│  Hook #3     │
│              │     │              │     │              │
│  value: 0    │     │  value: ""   │     │  value: true │
│  queue: ...  │     │  queue: ...  │     │  queue: ...  │
│  next: ──────┘     │  next: ──────┘     │  next: null  │
└──────────────┘     └──────────────┘     └──────────────┘
   (count)              (name)               (on)
```

### 조건문 안에서 훅을 쓰면 안 되는 이유

연결 리스트 기반이기 때문에, 훅 호출 순서가 렌더마다 달라지면 React가 어떤 훅이 어떤 state인지 혼동한다.

```tsx
// ❌ 절대 금지
function MyComponent() {
  if (someCondition) {
    const [count, setCount] = useState(0); // 어떤 렌더에는 존재, 어떤 렌더에는 없음
  }
  const [name, setName] = useState("");    // 순서가 밀려버림!
}
```

```
첫 번째 렌더 (someCondition = true):
  Hook #1 → count (0)
  Hook #2 → name ("")

두 번째 렌더 (someCondition = false):
  Hook #1 → name ("")   ← React는 이걸 count 자리라고 착각함!
```

> **규칙**: 훅은 항상 컴포넌트 최상위 레벨에서, 동일한 순서로 호출해야 한다. 반복문·조건문·중첩 함수 안에서 호출하면 안 된다.

---

## setState의 동작 흐름

### 1단계: Queue에 예약

`setState`를 호출하면 값이 즉시 반영되지 않는다. 다음 렌더에서 처리할 업데이트를 **Queue에 추가**하는 것이다.

```tsx
setCount(1);
// "즉시 count = 1" 이 아니라
// "다음 렌더 때 1로 바꿔줘" 라는 업데이트를 Queue에 추가
```

### 2단계: Batching (일괄 처리)

이벤트 핸들러가 끝나면 Queue에 쌓인 업데이트를 한꺼번에 처리한다.
여러 `setState`를 호출해도 리렌더는 **1번만** 발생한다.

```tsx
function handleClick() {
  setCount(1);   // Queue에 추가
  setName("A");  // Queue에 추가
  // → 함수 종료 → Queue를 한 번에 처리 → 리렌더 1회
}
```

### 3단계: 리렌더링

Queue에 쌓인 업데이트를 순서대로 소화하여 새 state를 계산하고, 컴포넌트 함수를 재실행한 뒤 DOM을 업데이트한다.

```
setState(newValue) 호출
        │
        ▼
   Queue에 추가 (즉시 반영 X)
        │
        ▼
   이벤트 핸들러 종료까지 대기 (Batching)
        │
        ▼
   Queue에서 꺼내 새 state 계산
        │
        ▼
   컴포넌트 함수 재실행 → Virtual DOM 비교 → 실제 DOM 업데이트
```

---

## 주의사항과 패턴

### Stale Closure (오래된 클로저)

`setState(value)` 형태는 **렌더 시점의 스냅샷**을 클로저로 캡처한다.
`setTimeout`, `async` 콜백 등 비동기 컨텍스트에서는 항상 과거 값을 참조하게 된다.

```tsx
// ❌ count가 항상 클로저에 캡처된 구버전 값
setTimeout(() => {
  setCount(count + 1);
}, 1000);

// ✅ 업데이터 함수로 최신 값 보장
setTimeout(() => {
  setCount(prev => prev + 1);
}, 1000);
```

연속 호출 시에도 업데이터 함수가 안전하다:

```tsx
// 값 전달: 결과는 +1 (두 번째 호출도 같은 스냅샷 기준)
setCount(count + 1);
setCount(count + 1);

// 업데이터 함수: 결과는 +2 (Queue에서 순서대로 소화)
setCount(prev => prev + 1);
setCount(prev => prev + 1);
```

<details>
<summary>업데이터 함수가 어떻게 동작하는데여</summary>

값이 아니라 함수를 넘기면 React가 아래처럼 큐를 처리함!

 ```
큐: [c => c+1, c => c+1, c => c+1]

1단계: c=0 → c+1 = 1
2단계: c=1 → c+1 = 2  ← 이전 결과를 다음 함수의 인자로 넘김
3단계: c=2 → c+1 = 3
```

값: 호출 시점에 계산 완료, 결과값을 큐에 넣음
함수: 함수 자체를 큐에 넣음, Fiber가 처리할 때 실행

#### 언제 업데이터 함수를 써야 하나?

```
// 이건 값으로 충분 (단순 할당)
setCount(0);
setName("철수");

// 이건 업데이터 함수 필요 (이전 값 기반 계산)
setCount(c => c + 1);
setItems(prev => [...prev, newItem]);
setTodos(prev => prev.filter(t => t.id !== id));
```

규칙: 새 state가 이전 state에 의존한다면 → 업데이터 함수

</details>

### Object.is 비교와 Bailout 최적화

React는 `Object.is(prevState, nextState)`로 변경 여부를 판단한다. 같은 값이면 리렌더를 건너뛴다 (Bailout).

```tsx
setCount(0); // count가 이미 0이면 → 리렌더 스킵
```

객체·배열은 **참조 비교**이므로 내용이 같아도 새 객체면 리렌더가 발생한다:

```tsx
setUser({ name: "kim" }); // 매번 새 객체 → 항상 리렌더
```

### 불변성 (Immutability)

객체·배열 state는 반드시 **새 참조로 교체**해야 한다. 기존 객체를 직접 변경(mutate)하면 참조가 동일하므로 React가 변경을 감지하지 못한다.

```tsx
// ❌ 직접 변경 → 참조 동일 → 리렌더 안 됨
todos.push(newTodo);
setTodos(todos);

// ✅ 새 배열 생성
setTodos([...todos, newTodo]);

// ✅ 객체 일부 필드 업데이트
setUser(prev => ({ ...prev, name: "lee" }));
```

### Lazy Initialization (지연 초기화)

`useState`에 **함수**를 넘기면 초기 렌더 1회만 실행된다. `localStorage` 읽기나 복잡한 계산처럼 비용이 큰 초기값에 유용하다.

```tsx
// ❌ createTodos()가 매 렌더마다 실행됨 (결과는 버려지지만 연산 비용 발생)
const [todos, setTodos] = useState(createTodos());

// ✅ 초기화 함수: 최초 1회만 실행
const [todos, setTodos] = useState(() => createTodos());
```

> 주의: `useState(createTodos)`처럼 함수 자체를 넘기면 된다. `useState(createTodos())`는 함수를 **호출한 결과**를 넘기는 것이므로 매 렌더마다 실행된다.

---

## React 18: Automatic Batching

React 17 이하에서는 **이벤트 핸들러 내부**에서만 Batching이 동작했다. `setTimeout`, `Promise`, `fetch` 콜백 등에서는 `setState`마다 리렌더가 발생했다.

React 18부터는 **모든 컨텍스트**에서 자동 Batching이 적용된다.

```tsx
// React 17: 리렌더 2번
// React 18: 리렌더 1번
setTimeout(() => {
  setCount(c => c + 1);
  setName("kim");
}, 1000);
```

Batching을 원하지 않는 경우 `flushSync`를 사용할 수 있다:

```tsx
import { flushSync } from 'react-dom';

flushSync(() => {
  setCount(c => c + 1);
});
// 여기서 이미 DOM이 업데이트됨

flushSync(() => {
  setName("kim");
});
// 여기서 다시 DOM이 업데이트됨
```

> `flushSync`는 성능에 부정적이므로 꼭 필요한 경우에만 사용한다.