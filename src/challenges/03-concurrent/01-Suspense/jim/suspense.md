# Suspense

: 비동기 처리 로직을 선언적으로 분리하여 로딩 중일 때 보여줄 화면을 부모 컴포넌트에서 결정할 수 있게 하는 리액트 내장 컴포넌트

- 비동기 작업의 성공 상태와 로딩 상태를 분리해 관리 가능
- 여러 컴포넌트가 동시에 로딩될 때 레이아웃이 깨지는 현상 방지, 일관된 로딩 화면 제공

과거 (Imperative): 각 컴포넌트 내부에서 isLoading 상태를 직접 관리하며 분기 처리

```tsx
// ❌ 과거 방식 — isLoading 상태를 모든 컴포넌트가 직접 관리
function UserCard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUser(1).then((data) => {
      setUser(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <div>로딩 중...</div>;
  return <div>{user.name}</div>;
}
```

Suspense → "이 컴포넌트 뭉치는 준비될 때까지 기다려, 그동안은 이 fallback을 보여줘"라고 리액트에게 위임

## 동작 원리

Throwing a Promise

1. 렌더링 시도: 리액트가 컴포넌트를 그리려고 시도
2. Promise 던지기 (Throwing): 컴포넌트 내부에서 아직 데이터가 준비되지 않았다면, 리액트에게 Promise를 던짐 (에러를 던지는 것과 유사한 방식)
3. 가까운 경계 찾기: 리액트는 상위 트리로 올라가며 가장 가까운 <Suspense> 경계(Boundary)를 찾음
4. Fallback 노출: 데이터를 기다리는 동안 fallback 속성에 전달된 UI를 화면에 그림
5. 재시도: 던져진 Promise가 해결(Resolved)되면, 리액트는 컴포넌트를 다시 렌더링

## 주요 활용 사례 (React 19.2 기준)

### ① 데이터 페칭 (with `use` Hook)

```javascript
import { use, Suspense } from "react";

// 데이터를 가져오는 Promise를 생성
const userPromise = fetchUser(1);

function UserCard() {
  // use가 Promise를 받아서 '실제 데이터'로 변환
  // 데이터가 아직 안 왔다면? 여기서 렌더링이 일시 중단(Suspend)
  const user = use(userPromise);

  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <UserCard />
    </Suspense>
  );
}
```

<details>
  <summary>use?</summary>

: 외부 리소스를 읽는 표준 방식을 통합한 것

- 리액트 훅 중 유일하게 `if`문이나 `for`루프와 같은 조건문 및 반복문 안에서 호출할 수 있음
- 단순히 값을 반환하는 역할을 하며, 상태를 직접 업데이트하는 기능은 없음 → 읽기 전용

1. Promise를 처리할 때
   : 데이터가 없으면 리액트 엔진에 Throw Promise → Suspense가 이 신호를 받고 로딩을 띄움
2. Context를 처리할 때
   : 데이터 꺼내줘 요청(useContext와 역할은 같지만, if문 안에서도 사용 가능)

</details>

최신 라이브러리들은 내부적으로 Suspense 기능을 지원함

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';

function UserProfile() {
  // 데이터를 불러오는 동안 상위 Suspense로 제어권이 넘어감
  const { data } = useSuspenseQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  });

  return <div>사용자 이름: {data.name}</div>;
}

function Main() {
  return (
    <Suspense fallback={<Skeleton screen />}>
      <UserProfile />
    </Suspense>
  );
}
```

### ② 코드 분할 (Code Splitting)

`React.lazy`와 함께 사용하여 초기 번들 크기를 줄인다.

```javascript
import React, { Suspense, lazy } from "react";

// 컴포넌트를 동적으로 불러옴
const HeavyComponent = lazy(() => import("./HeavyComponent"));

function App() {
  return (
    <div>
      <h1>나의 앱</h1>
      {/* HeavyComponent가 로드될 때까지 <div>로딩 중...</div> 노출 */}
      <Suspense fallback={<div>로딩 중...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

<details>
  <summary>React.lazy?</summary>

: 일반적인 `import`는 빌드 시점 모든 코드를 하나의 덩어리(Bundle)로 합치지만, `React.lazy`를 사용하면 해당 컴포넌트가 실제로 화면에 그려질 때만 서버에서 해당 코드를 다운로드함.  
→ 초기 로딩 시 다운로드할 자바스크립트 파일 크기가 줄기 때문에 번들 크기가 줆(번들러가 코드를 별도의 파일(Chunk)로 분리)

1. 사용자는 당장 필요한 최소한의 코드가 담긴 메인 번들을 받음
2. LazyComponent가 렌더링되는 순간, 브라우저가 네트워크를 통해 해당 컴포넌트의 chunk.js 파일을 요청
3. 다운로드되는 짧은 시간동안 fallback 노출

단, `React.lazy`로 불러온 컴포넌트는 반드시 `<Suspense>` 컴포넌트 하위에서 렌더링되어야 함 → 코드를 불러오는 동안 보여줄 UI가 필요하기 때문

→ 초기 번들 크기를 줄여 LCP 지표를 개선하고 사용자 이탈률을 낮춤

</details>

1. 여러 비동기 요청이 얽힐 때 발생하는 UI 불일치를 리액트가 엔진 레벨에서 관리
   : 기존 여러 컴포넌트가 각각 데이터를 호출할 때, 응답 속도에 따라 UI가 제각각 나타나는 워터폴 현상 발생
   - 여러 비동기 요청이 발생했을 때, 모든 데이터가 준비될 때까지 브라우저에 화면을 그리는 것을 커밋하지 않고 메모리 상 대기
   - 여러 컴포넌트가 서로 다른 시점에 데이터를 받아오더라도, 리액트가 이를 조율해 하나의 완성된 상태로 묶어(Batching) 화면에 한번에 업데이트 → 사용자는 중간 단계의 불완전한 UI를 보지 않아도 됨
2. 데이터를 기다리는 동안 다른 작업을 멈추지 않고, 가능한 부분부터 먼저 그리는 스트리밍이 가능해짐
   - 준비된 부분을 먼저 클라이언트로 보내고, 로딩 중인 부분은 Suspense와 fallback으로 대체해 보냄 → 준비되면 해당 부분만 추가로 스트리밍해 화면을 채움
   - 모든 JS 번들이 로드될 때까지 기다리지 않고, 먼저 도착한 부분부터 상호작용 가능, 개별적 활성화
3. `if(loading)`이 사라지고, 비즈니스 로직에만 집중할 수 있음

---

## 에러 처리

`Suspense`가 **로딩**을 잡는다면, **에러**는 `ErrorBoundary`가 처리  
 보통 이 둘을 함께 사용하여 비동기 작업의 '성공-대기-실패'를 완벽하게 선언적으로 관리함

```javascript
<ErrorBoundary fallback={<ErrorUI />}>
  <Suspense fallback={<LoadingUI />}>
    <AsyncContent />
  </Suspense>
</ErrorBoundary>
```

## 레퍼런스

- https://react.dev/reference/react/Suspense
- https://react.dev/reference/react/use
