# useContext

React는 기본적으로 부모에서 자식 단방향으로 데이터를 전달함  
데이터를 전달할 땐 `props`를 사용하는데 컴포넌트 게층이 깊어지면 props drilling이 발생, 유지보수가 매우 어려워짐

```
App (theme: 'dark')
 └─ Layout        (theme props 받아서 아래로 전달)
      └─ Sidebar  (theme props 받아서 아래로 전달)
           └─ Button  (드디어 theme 사용)
```

`useContext`는 중간 컴포넌트를 완전히 건너뛰고, 필요한 곳에서 직접 데이터를 꺼내 쓸 수 있게 해줌

## 사용 방법

#### 1. Context 생성

```tsx
// ThemeContext.ts
import { createContext } from "react";

// createContext: Context 객체를 만드는 함수
// 인자로 넘기는 값은 Provider가 없을 때 사용되는 기본값
const ThemeContext = createContext<string>("light");

export default ThemeContext;
```

#### 2. Provider로 값 제공

```tsx
// Provider: 아래 트리 전체에 value를 공급하는 컴포넌트
// value가 바뀌면 이 Provider 아래의 모든 구독자가 리렌더링됨
function App() {
  const [theme, setTheme] = useState("dark");

  return (
    <ThemeContext.Provider value={theme}>
      <Layout />
    </ThemeContext.Provider>
  );
}
```

#### 3. useContext로 값 구독

```tsx
// Layout, Sidebar는 아무것도 안 해도 됨
// Button에서 직접 꺼내 씀
function Button() {
  const theme = useContext(ThemeContext);
  // theme = 'dark'
  return <button className={theme}>클릭</button>;
}
```

> **구독?**  
> Provider의 value가 바뀌면 `useContext`를 호출한 컴포넌트가 자동으로 리렌더링되는 것  
> → "이 값이 바뀌면 나한테 알려줘"라고 등록해두는 것

---

#### 4. Custom Hook으로 감싸기

`useContext`를 컴포넌트에서 직접 호출하는 대신, 커스텀 훅으로 한 번 감싸준다

```tsx
// 직접 호출하는 방식 — 문제 있음
function Button() {
  const theme = useContext(ThemeContext); // ThemeContext가 뭔지 Button이 알아야 함
}
```

```tsx
// 커스텀 훅으로 감싸는 방식
export function useTheme() {
  const ctx = useContext(ThemeContext);

  // Provider 없이 사용하면 명확한 에러 메시지 제공
  if (ctx === undefined) {
    throw new Error("useTheme은 ThemeProvider 안에서만 사용 가능합니다");
  }

  return ctx;
}

// 사용하는 쪽은 Context의 존재 자체를 몰라도 됨
function Button() {
  const theme = useTheme();
}
```

- Provider 바깥에서 실수로 사용했을 때 명확한 에러 메시지를 볼 수 있음
- 나중에 Context 내부 구현이 바뀌어도 사용처 코드는 수정할 필요가 없음

---

## 동작 원리

### fiber 트리

리액트는 모든 컴포넌트를 Fiber Node로 관리  
Context는 이 fiber 트리 구조를 그대로 활용

→ `Provider`가 렌더링되면 해당 fiber 노드에 `value`를 저장  
→ `useContext`를 호출하면 리액트는 현재 컴포넌트의 fiber 노드에서 위쪽으로 트리를 거슬러 올라가며 가장 먼저 만나는 같은 타입의 `Provider`를 찾아 그 value를 반환

```
fiber[App]
  └─ fiber[ThemeContext.Provider]  ← value: 'dark' 저장됨
       └─ fiber[Layout]            ← 탐색 통과
            └─ fiber[Sidebar]      ← 탐색 통과
                 └─ fiber[Button]  ← useContext 호출
                                     위로 탐색 → 'dark' 반환
```

### Provider가 없으면?

`createContext(기본값)`에서 지정한 기본값이 반환  
단, 이 기본값은 Provider가 트리에 아예 없을 때만 사용  
`<Provider value={undefined}>`처럼 value를 명시하지 않는 것과는 다르다

```tsx
const ThemeContext = createContext("light"); // 기본값: 'light'

function Button() {
  const theme = useContext(ThemeContext);
  // Provider가 없으면 → 'light'
  // <Provider value={undefined}>면 → undefined
}
```

### Provider 중첩 — 가장 가까운 것이 우선

같은 Context를 중첩하면 안쪽 Provider가 우선  
→ fiber 트리를 위로 탐색하다 가장 먼저 만나는 Provider를 반환하는 원리

```tsx
<ThemeContext.Provider value="light">
  <Header /> {/* "light" */}
  <ThemeContext.Provider value="dark">
    <Modal /> {/* "dark" — 더 가까운 Provider */}
  </ThemeContext.Provider>
</ThemeContext.Provider>
```

### value가 바뀌면 어떻게 전파되나

Provider의 value가 변경되면 리액트는 해당 Provider 아래의 fiber 트리를 탐색하면서 이 Context를 구독 중인 컴포넌트를 전부 찾아 리렌더링을 예약  
중간에 `React.memo`로 감싸진 컴포넌트도 Context를 구독하고 있으면 리렌더링됨(`React.memo`는 props 변경만 막아주기 때문)

---

### 성능 주의점

#### value에 객체를 직접 넘기면 안 된다

```tsx
// 문제 — App이 리렌더링될 때마다 새 객체 생성
// { user, settings }는 매번 다른 참조 → 모든 구독자 리렌더링
function App() {
  return (
    <MyContext.Provider value={{ user, settings }}>
      <Children />
    </MyContext.Provider>
  );
}
```

리액트는 이전 value와 새 value를 `Object.is`로 비교  
`{ user, settings }`는 내용이 같아도 매 렌더링마다 새 객체가 만들어지므로 항상 다른 값으로 판단

```tsx
// 해결 — useMemo로 참조 안정화
// user나 settings가 실제로 바뀔 때만 새 객체 생성
function App() {
  const value = useMemo(() => ({ user, settings }), [user, settings]);

  return (
    <MyContext.Provider value={value}>
      <Children />
    </MyContext.Provider>
  );
}
```

#### Context를 잘게 나누기

하나의 Context에 모든 걸 담으면 어느 값 하나만 바뀌어도 전체 구독자가 리렌더링

```tsx
// 나쁜 예 — user가 바뀌면 theme 구독자도 리렌더링
const AppContext = createContext({ user, theme, language });

// 좋은 예 — 각자 관련된 변경에만 반응
const UserContext = createContext(user);
const ThemeContext = createContext(theme);
const LanguageContext = createContext(language);
```

#### 상태와 dispatch 분리

값을 읽기만 하는 컴포넌트와 값을 변경하는 컴포넌트가 같은 Context를 구독하면 불필요한 리렌더링이 생김

```tsx
// 읽기 전용 Context
const UserStateContext = createContext(null);
// 변경 전용 Context — dispatch는 참조가 바뀌지 않아 안정적
const UserDispatchContext = createContext(null);

function UserProvider({ children }) {
  const [user, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserStateContext.Provider value={user}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

// user만 읽는 컴포넌트 — dispatch 변경 시 리렌더링 안 됨
const user = useContext(UserStateContext);

// 액션만 발생시키는 컴포넌트 — user 변경 시 리렌더링 안 됨
const dispatch = useContext(UserDispatchContext);
```

---

### 언제 Context를 쓰고 언제 쓰지 말아야 하나

Context는 변경이 드물고 앱 전반에서 필요한 데이터에 적합합니다.

| 적합한 경우        | 부적합한 경우                         |
| ------------------ | ------------------------------------- |
| 테마, 다국어(i18n) | 자주 바뀌는 서버 데이터 → React Query |
| 로그인 유저 정보   | 복잡한 클라이언트 상태 → Zustand      |
| 앱 전역 설정값     | 특정 컴포넌트 트리 내부 상태 → props  |
