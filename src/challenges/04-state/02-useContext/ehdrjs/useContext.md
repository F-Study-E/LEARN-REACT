# useContext

useContext는 컴포넌트에서 Context를 읽고 구독할 수 있는 훅

```tsx
const theme = useContext(ThemeContext);
```

---

## 기본 사용법

`createContext`로 만든 Context 객체를 넘기면, 트리 위쪽에서 가장 가까운 Provider의 `value`를 돌려준다. Provider가 없으면 `createContext`의 기본값을 쓴다.

```tsx
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Header />
    </ThemeContext.Provider>
  );
}

function Header() {
  const theme = useContext(ThemeContext); // "dark"
  return <h1 className={theme}>Hello</h1>;
}
```

---

## 리렌더링

### Context 변경 vs 부모 리렌더 — 구분이 중요하다

```tsx
function App() {
  const [count, setCount] = useState(0);
  return (
    <CountContext.Provider value={count}>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <A />  {/* useContext 사용 */}
      <B />  {/* useContext 안 씀 */}
    </CountContext.Provider>
  );
}
```

버튼 클릭하면 A, B **둘 다** 리렌더된다. B는 Context랑 상관없는데? → App(부모)이 리렌더되면 자식도 다 리렌더되는 게 React 기본 동작이니까.

### Object.is 비교

Provider는 `Object.is`로 value 변경을 판단한다.

```tsx
// ❌ 매 렌더마다 새 객체 → 항상 "바뀜" 판정
<UserContext.Provider value={{ user, setUser }}>

// ✅ useMemo로 참조 고정
const ctx = useMemo(() => ({ user, setUser }), [user]);
<UserContext.Provider value={ctx}>
```

---

## 커스텀 Provider 패턴

Context 생성 + Provider + 커스텀 훅을 한 파일로 묶는 패턴.

```tsx
// context/CountContext.tsx
const CountContext = createContext<{
  count: number;
  setCount: (v: SetStateAction<number>) => void;
} | null>(null);

export function CountProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const value = useMemo(() => ({ count, setCount }), [count]);
  return <CountContext.Provider value={value}>{children}</CountContext.Provider>;
}

export function useCount() {
  const ctx = useContext(CountContext);
  if (!ctx) throw new Error("CountProvider 안에서만 사용 가능");
  return ctx;
}
```

```tsx
function App() {
  return (
    <CountProvider>
      <A />
      <B />
    </CountProvider>
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
```

### 왜 B는 리렌더 안 될까?

핵심은 **state가 어디에 있느냐**다.

**커스텀 Provider 쓸 때:** state가 `CountProvider` 안에 있다. 

App에는 state가 없으니 App은 리렌더 안 된다. App이 안 돌면 `<A /><B />`라는 JSX도 새로 안 만들어지고, children 참조가 그대로라서 B는 스킵된다.

**App에 직접 state를 두면:** count 바뀔 때 App이 리렌더 → `<A /><B />` JSX가 새로 생성 → B도 리렌더.

```
                  커스텀 Provider    직접 Provider
state 위치         Provider 내부      App 내부
App 리렌더          ❌                ✅
B 리렌더            ❌                ✅
```

> **요약:** state를 Provider 안으로 격리하면, Context 안 쓰는 자식의 불필요한 리렌더를 막을 수 있다.

---

## Context 분리

하나의 Context에 여러 값을 넣으면, 하나만 바뀌어도 구독자 전부가 리렌더된다.

```tsx
// ❌ theme만 바뀌어도 user 구독자까지 리렌더
const AppContext = createContext({ theme: 'dark', user: null, locale: 'ko' });

// ✅ 분리하면 각자 독립
const ThemeContext = createContext('dark');
const UserContext = createContext(null);
const LocaleContext = createContext('ko');
```

---

## Fiber로 보는 내부 동작

위에서 설명한 동작들이 React 내부에서 실제로 어떻게 돌아가는지, Fiber 구조랑 연결해서 살펴보자.

### Fiber 노드와 Context의 관계

React는 컴포넌트 트리를 **Fiber 노드**의 링크드 리스트로 관리한다. 각 Fiber 노드에는 `dependencies`라는 필드가 있는데, 이게 바로 "이 컴포넌트가 어떤 Context를 구독하고 있는가"를 추적하는 곳이다.

```
Fiber {
  tag: FunctionComponent,
  type: Header,
  memoizedState: ...,       // 훅 체인
  dependencies: {           // Context 구독 목록
    lanes: Lanes,
    firstContext: {
      context: ThemeContext, // 구독 중인 Context 객체
      next: null            // 다음 구독 (링크드 리스트)
    }
  }
}
```

`useContext(ThemeContext)`를 호출하면 React는 이 Fiber의 `dependencies` 리스트에 `ThemeContext`를 추가한다. 이게 "구독 등록"이다.

### Provider가 value를 바꿀 때 벌어지는 일

Provider의 value가 바뀌면 React는 **자식 Fiber 트리를 위에서 아래로 순회(propagation)**하면서 해당 Context를 구독 중인 Fiber를 찾는다. 찾으면 그 Fiber에 리렌더 우선순위(lane)를 직접 꽂아준다.

```
1. Provider의 value가 Object.is로 비교 → 달라졌다!
2. propagateContextChange() 호출
3. 자식 Fiber를 순회하면서 dependencies에 이 Context가 있는 놈을 찾음
4. 찾으면 해당 Fiber에 lane을 마킹 → "너 리렌더 해야 해"
5. 그 Fiber까지의 부모 경로에도 childLanes를 마킹 → 경로 확보
```

### useContext 호출 시점에 일어나는 일

컴포넌트가 렌더링될 때 `useContext`는 내부적으로 `readContext()`를 호출한다. 이 함수가 하는 일은 딱 두 가지:

1. **현재 Fiber에서 트리 위쪽으로 올라가며 가장 가까운 Provider를 찾고**, 그 `value`를 반환
2. **이 Fiber의 `dependencies`에 해당 Context를 등록** (다음 propagation 때 찾을 수 있게)

### 정리: 전체 흐름

```
[Provider 렌더] value 갱신 → context._currentValue = newValue
       ↓
[propagation] 자식 Fiber 순회 → dependencies에 이 Context 있으면 lane 마킹
       ↓
[스케줄러] 마킹된 Fiber를 리렌더 대상에 포함
       ↓
[컴포넌트 렌더] useContext() → readContext() → context._currentValue 읽기
                                             → dependencies에 다시 등록
```

이 구조 덕분에 Context는 props drilling 없이 Fiber 트리 어디서든 값을 읽을 수 있고, Provider가 바뀌면 구독자만 정확히 찾아서 리렌더를 걸 수 있는 거다.