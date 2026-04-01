## useTransition

: 상태 업데이트를 **긴급하지 않은(non-urgent) 전환**으로 표시해서
UI가 입력에 즉각 반응하도록 만드는 훅

```tsx
const [isPending, startTransition] = useTransition();
```

- `isPending` — 전환이 진행 중인지 여부 (`boolean`)
- `startTransition(fn)` — 전환으로 처리할 상태 업데이트를 `fn` 안에서 실행

---

### 문제 배경

React는 기본적으로 모든 state 업데이트를 동등하게 처리한다.
느린 컴포넌트가 포함된 상태를 업데이트하면 **입력·클릭도 함께 블로킹**된다.

```tsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    const filterResult = heavyFilter(value)
    setResults(filterResult); // 🔴 수천 개 필터링 — 무거운 작업
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      <ResultList results={results} />
    </>
  );
}

```

```
사용자: "a" 입력
브라우저: [렌더링 중... 200ms 블로킹] ← input도 멈춤
사용자: "p" 입력하려 했는데 UI가 멈춤
```

---

#### useTransition 으로 개선해보자
```tsx
import { useState, useTransition } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition(); // ✅

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    setQuery(value); // 🟢 긴급(urgent) — 즉시 렌더링

    startTransition(() => {
      const filterResult = heavyFilter(value)
      setResults(filterResult); // 🟡 전환(transition) — 나중에 렌더링
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <span>검색 중...</span>} {/* ✅ 로딩 표시 가능 */}
      <ResultList results={results} />
    </>
  );
}
```


### 동작 원리

`useTransition`은 React의 **Concurrent Mode**와 **Lane 시스템** 위에서 동작한다.


#### Concurrent Mode — "렌더링을 멈출 수 있다"

브라우저의 메인 스레드는 **한 번에 하나**만 처리한다.
React 17(동기 렌더링)은 시작하면 끝날 때까지 메인 스레드를 독점했다.

[동기 렌더링]
████████████████████████  ← 200ms 동안 클릭·입력 전부 블로킹

React 18의 Concurrent Mode는 렌더링을 **Fiber Node(컴포넌트 단위)로 쪼개서**
중간중간 브라우저에게 제어권을 돌려준다.

```
[Concurrent 렌더링]
[렌더]─[양보]─[렌더]─[양보]─[렌더]─[완료]
↑              ↑
브라우저가 입력 처리 가능
```

<details>
<summary>Fiber가 렌더링을 쪼개는 방법</summary>

#### React 15 이전 — Stack Reconciler (클래스 컴포넌트 시절)

React 15까지는 재귀 호출로 렌더링했음

```
App 렌더
└─ Header 렌더
└─ Main 렌더
   └─ List 렌더
      └─ Item 렌더
         └─ ... (깊어질수록 스택 쌓임)
```

재귀는 중간에 멈출 수 없어 콜 스택이 끝날 때까지 계속 실행됨 트리가 깊으면 수백ms 블로킹

#### React 16 — Fiber: "재귀를 반복문으로"

각 컴포넌트가 Fiber Node라는 객체가 됐당.

```
[Fiber Node 구조]
{
  // 컴포넌트 정보
  type: MyComponent,        // 어떤 컴포넌트인지
  pendingProps: { id: 1 },  // 처리할 props
  memoizedState: ...,       // 현재 state (useState 값들이 여기 저장됨)
  memoizedProps: ...,       // 이전 렌더 props

  // 트리 연결 (링크드 리스트)
  child: FiberNode,         // 첫 번째 자식
  sibling: FiberNode,       // 다음 형제
  return: FiberNode,        // 부모 (return인 이유: "작업 끝나면 여기로 돌아가")

  // 스케줄링 정보
  lanes: TransitionLane1,   // 이 노드의 우선순위
  flags: Update,            // 해야 할 작업 (Update, Placement, Deletion...)

  // Double Buffering
  alternate: FiberNode,     // 이전 렌더의 나 자신 (아래에서 설명)
}
```

트리가 아니라 링크드 리스트로 연결됨 그래서 "여기까지 처리했다"는 포인터를 저장하고 언제든 멈췄다가 재개할 수 있음!

```
[Stack Reconciler]     재귀 → 중간에 못 멈춤
App → Header → Main → List → Item → ...
████████████████████████████████████

[Fiber Reconciler]     반복문 → 언제든 멈출 수 있음
[App] → [Header] → [Main] → 멈춤 → [List] → [Item] → ...
 ██        ██        ██      ↑        ██       ██
                          여기서 양보 가능
```

> React 16에서 재조정 엔진을 교체 후 18에서 useTransition 등 훅 업데이트

</details>

<details>
<summary>"양보"가 실제로 어떻게 일어나나</summary>

#### 브라우저의 시간 예산 — 5ms
브라우저는 60fps 를 목표로 합니다. 1프레임 = 약 16ms.

React 스케줄러는 이 중 5ms 를 렌더링 예산으로 씀

```
[16ms 프레임]
├─ React 렌더링: 5ms  ← 예산 소진 시 양보
├─ 브라우저 작업: 나머지
│   ├─ 입력 이벤트 처리
│   ├─ 레이아웃 계산
│   └─ 화면 그리기
```

#### React Scheduler 내부 (실제 코드 단순화)

```tsx
const channel = new MessageChannel();

channel.port1.onmessage = () => {
  // 브라우저가 다른 작업 처리 후 여기로 돌아옴
  workLoop(); // 렌더링 재개
};

function workLoop() {
  while (작업이 남아있음) {
    if (현재시간 - 시작시간 > 5ms) {
      channel.port2.postMessage(null); // 양보 신호
      return; // 일단 멈춤
    }
    performUnitOfWork(); // Fiber Node 하나 처리
  }
}
```

전체 흐름을 보면 아래처럼 진행된당

```
React: "렌더링 시작"
  ↓
Fiber Node 하나 처리 (0.5ms)
Fiber Node 하나 처리 (0.5ms)
...
5ms 경과 → port2.postMessage(null) → "큐 뒤로 갈게"
  ↓
[브라우저: "오 틈났다" → 입력 이벤트 처리, 화면 그리기]
  ↓
port1.onmessage 호출 → React 렌더링 재개
Fiber Node 하나 처리...
5ms 경과 → 또 양보
  ↓
... 반복 ...
  ↓
렌더링 완료
```

참고: https://github.dev/facebook/react/blob/e62a8d754548a490c2a3bcff3b420e5eedaf11c0/packages/scheduler/src/forks/Scheduler.js

</details>

---

#### Lane 시스템 — "어떤 작업을 먼저 처리할지 결정"

React는 모든 상태 업데이트에 **Lane(우선순위 비트 플래그)** 을 붙인다.

```
// https://github.dev/facebook/react/packages/react-reconciler/src/ReactFiberLane.new.js
export const NoLane            = /*        */ 0b0000000000000000000000000000000;
export const SyncLane          = /*        */ 0b0000000000000000000000000000010;
export const InputContinuousLane = /*      */ 0b0000000000000000000000000001000;
export const DefaultLane       = /*        */ 0b0000000000000000000000000100000;
export const TransitionLane1   = /*        */ 0b0000000000000000000000001000000;
export const TransitionLane2   = /*        */ 0b0000000000000000000000010000000;
// ... TransitionLane16까지 있음
export const IdleLane           = /*       */ 0b0100000000000000000000000000000;

```

숫자가 작을수록 우선순위가 높음.

왜 비트 쓴거임?
- 비트 연산 개빠르니까..

여러 업데이트를 동시에 처리할 때 집합 연산이 매우 빠름

```
// "이 업데이트가 처리해야 할 작업에 포함되나?" → 비트 AND 한 번
const includesSomeLane = (set, subset) => (set & subset) !== NoLanes;

// "두 Lane 묶기" → 비트 OR 한 번
const mergeLanes = (a, b) => a | b;

// 예시: SyncLane + TransitionLane1 묶기
mergeLanes(SyncLane, TransitionLane1)
// 0b...0010 | 0b...1000000 = 0b...1000010
```


#### Lane 전체 우선순위 계층

```
우선순위 높음
    │
    ├─ SyncLane          ← setState (이벤트 핸들러 안)
    ├─ InputContinuousLane ← onChange, onMouseMove (연속 입력)
    ├─ DefaultLane       ← setTimeout, Promise 안 setState
    ├─ TransitionLane1~16 ← startTransition (16개 슬롯!)
    └─ IdleLane          ← 완전 한가할 때만
    │
우선순위 낮음
```

> TransitionLane이 16개인 이유 — 여러 transition이 동시에 진행될 때 각각 독립적으로 추적하기 위해

| 업데이트 방식 | Lane | 처리 방식 |
|---|---|---|
| 일반 `setState` | `SyncLane` (긴급) | 즉시, 동기 처리 |
| `startTransition` 내 `setState` | `TransitionLane` (비긴급) | 여유 시간에 처리, 더 급한 작업 오면 중단 후 재시작 |


```
사용자가 "a" 입력

① setQuery("a")                 → SyncLane 추가
   startTransition(setResults)  → TransitionLane1 추가

   pendingLanes = SyncLane | TransitionLane1
               = 0b...1000010

② React 스케줄러: "가장 높은 우선순위 Lane부터"
   → SyncLane 먼저 처리 → input 즉시 업데이트

③ TransitionLane1 처리 시작...
   Fiber Node 처리 중 (3ms 경과)

④ 사용자가 "p" 입력
   → 새 SyncLane 발생
   pendingLanes = SyncLane | TransitionLane1
   
   → "SyncLane이 생겼다! TransitionLane 멈춰!"
   → TransitionLane 렌더링 폐기(discard) 후 처음부터 재시작 예약

⑤ SyncLane 처리 → TransitionLane 재시작

```


---

### Suspense와 함께 쓰기

Suspense와 useTransition은 역할이 다르다

| | 담당 |
|---|---|
| **Suspense** | 초기 마운트 — 처음 로딩 시 fallback 표시 |
| **startTransition** | 이후 전환 — 탭 클릭 등 전환 시 깜빡임 방지 |

---

#### startTransition 없으면?

탭 클릭 시 suspend 발생 → **즉시 Suspense fallback으로 교체** (깜빡임)

#### startTransition 있으면?

탭 클릭 시 suspend 발생 → **기존 화면 유지**, isPending=true → 준비 완료 시 전환

```
[startTransition 없음]   탭 클릭 → 기존 화면 → fallback → 새 화면
[startTransition 있음]   탭 클릭 → 기존 화면 유지 ──────────→ 새 화면
(isPending=true)
```


> ⚠️ startTransition 안의 suspend는 Suspense fallback을 절대 보여주지 않는다.
> Suspense fallback은 오직 **초기 마운트** 또는 **transition 없는 setState** 에서만 등장한다.

---

#### 예시 코드

```tsx
import { useState, useTransition, Suspense, use } from "react";

function createPromise(ms: number) {
  return new Promise<string>((resolve) =>
    setTimeout(() => resolve(`${ms}ms 탭 내용입니다`), ms)
  );
}

function TabContent({ promise }: { promise: Promise<string> }) {
  const data = use(promise); // pending이면 Suspense로 throw
  return <div>{data}</div>;
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [promise, setPromise] = useState(() => createPromise(300)); // 초기 마운트 → Suspense fallback 담당
  const [isPending, startTransition] = useTransition();

  function handleTabClick(nextTab: string) {
    const ms = nextTab === "slow" ? 3000 : 300;
    startTransition(() => {
      setTab(nextTab);
      setPromise(createPromise(ms)); // 전환 시 → fallback 없이 기존 화면 유지
    });
  }

  return (
    <div>
      <nav style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["home", "about", "slow"].map((t) => (
          <button
            key={t}
            onClick={() => handleTabClick(t)}
            style={{
              opacity: isPending ? 0.5 : 1,
              fontWeight: tab === t ? "bold" : "normal",
            }}
          >
            {t}
          </button>
        ))}
      </nav>
      {/* 초기 마운트 시 안전망 */}
      <Suspense fallback={<div>로딩 중... (Suspense fallback)</div>}>
        <TabContent promise={promise} />
      </Suspense>
    </div>
  );
}
```

Suspense = 초기 로딩 담당

startTransition = 이후 전환 시 깜빡임 방지
