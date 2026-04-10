# useState

> useState is a React Hook that lets you add a state variable to your component.  
> 상태 변수를 추가할 수 있게 해주는 훅

## class → 함수형으로

React 16.8 이전, 상태를 쓰려면 무조건 class 컴포넌트를 써야 했음

### class 컴포넌트

```javascript
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 }; // 상태 초기화
    this.handleClick = this.handleClick.bind(this); // this 바인딩 지옥
  }

  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return (
      <div>
        <p>{this.state.count}</p>
        <button onClick={this.handleClick}>+1</button>
      </div>
    );
  }
}
```

1. this 바인딩 지옥  
   : this.handleClick.bind(this) 안 하면 this가 undefined  
   JS에서 함수 이벤트 핸들러로 전달하면 this가 잘려나가기 때문

   ```javascript
   const fn = this.handleClick; // 함수만 빼냄
   fn(); // this가 뭔지 모름 → undefined
   // 해결책: bind로 this를 고정
   this.handleClick = this.handleClick.bind(this);
   // ↑ "이 클래스 인스턴스"로 고정
   ```

2. this.setState는 비동기  
   : 연속 호출 시 state가 의도대로 안 쌓임

   ```javascript
   this.setState({ count: this.state.count + 1 });
   this.setState({ count: this.state.count + 1 });
   this.setState({ count: this.state.count + 1 });

   // 이렇게 연속 호출하면 count는 3이 아니라 1 증가
   // ➡️ 세 번 모두 같은 this.state.count를 참조하기 때문
   // 이때 this.state.count는 현재 렌더링된 값(0) 따라서 모두 0 + 1 = 1을 넣은 것과 같음
   ```

3. 상태 로직 재사용 불가  
   : 같은 카운터 로직을 다른 컴포넌트에서 쓰려면? 복붙 또는 HOC, render props 패턴의 지옥

### useState 도입

`useState` 사용으로 this도 없고 바인딩도 사라짐 + 더 선언적 코드

```javascript
function Counter() {
  const [count, setCount] = useState(0); // 초기값 0

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

## useState란?

> **useState의 목적**
>
> 1. this 없이 상태 사용
> 2. 상태 로직을 컴포넌트 밖으로 분리해서 재사용
> 3. 관련 로직을 한 곳에 모아서 응집도 향상

내부적으로 리액트 fiber 노드에 상태를 저장하고, setState 호출 시 리렌더링을 스케줄링함

### 기본 문법

```typescript
// 배열 구조분해: [현재값, setter함수]
const [state, setState] = useState<number>(init); // 초기값은 첫 렌더링에서만 사용됨

// setState 호출 → 리렌더링 스케줄 등록
const handleClick = () => {
  setState((prev) => prev + 1); // 리렌더링 예약
};
```

## 동작 원리

### Fiber Node

리액트는 컴포넌트를 렌더링할 때 내부적으로 Fiber 노드라는 객체를 만듦  
Fiber 노드는 그 컴포넌트에 대한 모든 정보를 담고 있음

```typescript
Fiber Node (Counter 컴포넌트)
Fiber Node (Counter 컴포넌트)
├── type: Counter (함수 자체)
├── props: { ... }
├── memoizedState: → [Hook1: count]   ← 첫 번째 훅만 직접 참조
└── ... 기타 정보

```

### memoizedState

Fiber 노드 안의 `memoizedState`는 훅의 상태값이 실제로 저장되는 곳

```
// Hook 객체
{
  memoizedState: 0,     ← 현재 state 값
  queue: {              ← 업데이트 큐
    pending: null,
    dispatch: setCount, ← 우리가 쓰는 setter 함수
    lastRenderedState: 0
  },
  next: → (다음 훅 노드)
}
```

`memoizedState`는 링크드 리스트 ➡️ 훅 하나가 링크드 리스트의 노드 하나

컴포넌트 함수가 처음 실행될 때, React는 `useState`를 만날 때마다

1. Hook 객체를 하나 새로 만든다
2. 현재 Fiber의 `memoizedState` 체인 끝에 `.next`로 연결한다

리렌더링 때는 새로 만들지 않고, 기존 체인을 앞에서부터 순서대로 순회하며 값을 읽어옴(훅 순서 고정)

```typescript
// 리액트가 Hook 객체 생성, memoizedState 첫 노드로 등록
const [count, setCount] = useState(0);
// 두 번째 Hook 객체 생성, 첫 번째의 next로 연결
const [name, setName] = useState("");
// 세 번째, 두 번째의 next로 연결
const [open, setOpen] = useState(false); // 노드 3
```

위 3줄이 실행되면 Fiber.memoizedState 안에는 이런 체인이 생성됨

```
{ value: 0, queue: {...}, next: →} // Hook1
→ { value: '', queue: {...}, next: →} // Hook2
→ { value: false, queue: {...}, next: null } // Hook3
```

#### 훅 순서 고정 이유

리액트는 이 노드들에 이름을 붙이지 않고 인덱스로 구분함

```
"첫 번째 훅 = count, 두 번째 훅 = name, 세 번째 훅 = open"
```

따라서 인덱스만 보고 값을 가져오기 때문에 링크드 리스트의 순서가 바뀌어도 리액트는 그걸 알 수 없음

```javascript
// 1번 렌더링 (someCondition = true)
const [count, setCount] = useState(0); // 인덱스 0
const [name, setName] = useState(""); // 인덱스 1
const [open, setOpen] = useState(false); // 인덱스 2

// 2번 렌더링 (someCondition = false)
// count 훅이 사라짐!
const [name, setName] = useState(""); // 인덱스 0 ← React는 "count인줄 앎"
const [open, setOpen] = useState(false); // 인덱스 1 ← React는 "name인줄 앎"
```

➡️ 따라서 훅은 반드시 최상위에서, 조건문 없이 동일한 순서로 호출되어야 함

### setState를 호출하면?

호출한다고 바로 렌더링이 일어나는 게 아님 → `setState`는 렌더링을 예약하는 것

> **렌더링?**  
> React에서 "렌더링"이란 컴포넌트 함수를 다시 실행하는 것

**왜 즉시 바꾸지 않을까?**  
현재 렌더링 중인 값을 건드리면 같은 렌더링 안에서 값이 달라지는 불일치가 생김  
그래서 setState는 현재 값은 그대로 두고, queue에만 "다음 렌더링 때 이 값으로 바꿔줘" 요청을 쌓는다

현재 JS 실행이 끝나면 React가 queue를 한 번에 처리 → 여러 setState가 하나의 렌더링으로 묶임 (Batching)

```tsx
setCount(1); // 나중에 렌더링해줘 요청을 넣는 것
```

➡️ setState 호출 시 리렌더링이 바로 일어나지 않고 memoizedState 안의 queue에 업데이트 요청을 등록

```tsx
setCount(1);
setName("jim");
setOpen(true);
```

#### 1. queue에 Update 객체 등록

React는 즉시 상태를 바꾸지 않고 해당 Hook의 `queue.pending`에 Update 객체를 만들어 넣음

```javascript
Hook 객체 (count)
├── memoizedState: 0        ← 아직 0 그대로!
├── queue:
│   ├── pending: → Update { action: 1, next: → 자기 자신 } // 여기 등록됨(나중에 1로 바꿔줘라)
│   └── dispatch: setCount
└── next: ...
```

#### 2. Scheduler에 리렌더링 신호

Update 등록 후 React Scheduler에 이 Fiber 리렌더링이 필요해 신호를 보냄

```javascript
setCount(1) 호출
  └─→ queue.pending에 Update 등록
  └─→ Scheduler: "Counter Fiber 리렌더링 예약"
  └─→ 현재 JS 실행 계속 (이벤트 핸들러 끝날 때까지 대기)
```

#### 3. JS 실행 후 React가 큐 처리

이벤트 핸들러가 끝나면 리액트가 큐를 꺼내 처리함

```javascript
큐 처리 시작
  └─→ Update { action: 1 } 꺼냄
  └─→ 새 memoizedState = 1 확정
  └─→ 컴포넌트 함수 재실행 (리렌더링)
  └─→ useState(0) 호출 시 → 큐에서 1을 꺼내 반환
  └─→ count = 1 로 화면 업데이트
```

### Batching

즉시 렌더링할 경우 setCount, setName, setOpen 할 때마다 총 3번 렌더링이 발생함 따라서 큐에 모아뒀다가 한 번에 처리하는 것

```javascript
const handleClick = () => {
  setCount(1); // 큐에 등록
  setName("hi"); // 큐에 등록
  setOpen(true); // 큐에 등록
  // ↑ JS 끝 → React가 3개 한꺼번에 처리 → 렌더링 1번
};
```

#### auto batching

React 17 이전에는 setTimeout, Promise 안에서 각각 리렌더링이 발생했는데, 18부터는 어디서 호출하든 묶어서 처리(Batching)

```tsx
// React 17: 이 코드에서 렌더링이 2번 발생!
setTimeout(() => {
  setCount(1); // 렌더링 1번
  setName("hi"); // 렌더링 1번
  // 총 2번
}, 1000);
```

```tsx
// React 18: 렌더링 1번만 발생!
setTimeout(() => {
  setCount(1); // 큐에 등록
  setName("hi"); // 큐에 등록
  // → 렌더링 1번
}, 1000);

// Promise 안에서도
fetchData().then(() => {
  setCount(1); // 큐에 등록
  setName("hi"); // 큐에 등록
  // → 렌더링 1번
});
```

성능 최적화~~~  
그래서 `setState` 직후 같은 state를 읽으면 이전 값이 나옴 → 리렌더링이 아직 안 일어났으니까

```tsx
const handleClick = () => {
  setCount(count + 1);
  console.log(count); // 아직 0! setState는 즉시 반영 안 됨
};
```

## 💲 Tip

#### state에 의존할 때 직접 참조하면 위험 → 함수형 업데이트

값으로 넣을 때

```tsx
setCount(count + 1); // action: 1 (현재 count=0 기준으로 계산됨)
setCount(count + 1); // action: 1 (같은 클로저 count=0 참조)
// 큐: [1, 1] → 최종 state = 1
```

함수로 넣을 때  
`prev` = React가 최신 큐 값을 주입해줌

```tsx
setCount((prev) => prev + 1); // action: (prev) => prev + 1
setCount((prev) => prev + 1); // action: (prev) => prev + 1
// 큐 처리 시: prev=0 → 1, prev=1 → 2
// 최종 state = 2
```

#### 초기값 지연 평가 (Lazy Initialization)

렌더링마다 무거운 연산 실행

```tsx
const [data, setData] = useState(heavyComputation());
```

JS는 함수를 호출할 때 인자를 먼저 평가함  
→ useState가 실행되기 전 `heavyComputation()`이 먼저 실행되고 결과 값이 전달

그럼 렌더링마다

1. heavyComputation() 실행
2. 결과값을 useState에 전달
3. "어 이미 마운트됐었네" 값을 버림 → 낭비

<details>
  <summary>마운트 vs 리렌더링</summary>

훅을 처음호출하냐 아니냐에 따라 완전 다른 함수를 실행함

React 내부 (간략화)

```javascript
// 마운트 시 — mountState
function mountState(initialState) {
  const hook = createNewHook(); // Hook 객체 새로 생성
  hook.memoizedState =
    typeof initialState === "function"
      ? initialState() // 함수면 호출해서 저장
      : initialState; // 값이면 그대로 저장
  return [hook.memoizedState, dispatch];
}
```

```javascript
// 리렌더링 시 — updateState
function updateState(initialState) {
  // initialState? 쳐다도 안 봄
  const hook = getExistingHook(); // 기존 Hook 객체 가져오기
  // queue 처리해서 최신값 반환
  return [hook.memoizedState, dispatch];
}
```

이미 Fiber에 값이 있기 떄문에 initialState 인자 자체를 읽지 않음

```javascript
useState(heavyComputation());
//        ^^^^^^^^^^^^^^^^
//        이 부분은 JS가 평가 — React 실행 전에 이미 완료됨
```

heavyComputation()은 React가 "버릴지 쓸지"를 결정하기도 전에 JS 엔진이 이미 실행해버립니다. React가 결과를 버리든 말든 연산 비용은 이미 지불됨

</details>

✅ 함수로 전달 → 최초 마운트 시 딱 한 번만 실행

```tsx
const [data, setData] = useState(() => heavyComputation());
```

실행 결과가 아닌 함수 자체를 전달함
따라서 마운트 시

1. `() => heavyComputation()` 실행(한번만)
2. 결과값을 초기값을 저장

리렌더링 시
: 함수가 왔지만 이미 마운트되었으니 호출 안 할게(실행 안 함)

localStorage 읽기나 무거운 초기값 계산 시 반드시 이 패턴을 쓰자

## 사용 예시

```tsx
// 여러 필드를 하나의 객체로 관리
const [form, setForm] = useState({
  email: "",
  password: "",
  remember: false,
});

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  setForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};
```

```tsx
// 분산된 state (동기화 문제 발생 가능)
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// 권장 — status로 명확하게 표현
const [state, setState] = useState({
  status: "idle", // 'idle' | 'loading' | 'success' | 'error'
  data: null,
  error: null,
});
```
