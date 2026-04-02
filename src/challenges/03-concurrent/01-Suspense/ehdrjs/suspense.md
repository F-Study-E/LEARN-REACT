## Suspense

React Suspense는 비동기 작업(데이터 로딩, 코드 분할 등)이 완료될 때까지 컴포넌트 렌더링을 "대기"시키는 컴포넌트이다.

```tsx
<Suspense fallback={<Loading />}>
  <SomeAsyncComponent  />
</Suspense>
```

> 자식 컴포넌트가 준비되지 않으면 → fallback을 보여줌
>
> 준비 완료되면 → 실제 컴포넌트로 교체

---

### 주요 사용 사례

#### 1. 코드 분할 (Code Splitting)

```tsx
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

<details>
<summary>React.lazy() 란?</summary>

`React.lazy()`는 컴포넌트를 **처음 렌더링될 때** 동적으로 import한다.
번들을 미리 다 불러오지 않고 필요할 때만 로드하므로 초기 로딩 속도가 빨라진다.

- 일반 import: 앱 시작 시 **모든 코드** 를 한 번에 번들에 포함
- lazy import: 해당 컴포넌트가 **실제로 필요한 순간** 에 청크를 별도로 불러옴

```
일반:  [앱 시작] → 전체 번들 로드 (무거움)
lazy:  [앱 시작] → 핵심 번들만 로드
                → HeavyComponent 렌더링 시점에 → 해당 lazy 청크 추가 로드
```

</details>

#### 2. 데이터 페칭 (React 18+)

```tsx
// React Query, SWR, Relay 등과 함께 사용
<Suspense fallback={<Skeleton />}>
  <UserProfile userId={1} />
</Suspense>
```

---

### 동작 원리

컴포넌트가 아직 준비 안 됐을 때 Promise를 throw 함

가장 가까운 Suspense가 이 Promise를 잡아서 → fallback 렌더링 → Promise 완료 후 → 재렌더링

```
컴포넌트 렌더 시도
  → Promise throw
    → Suspense가 캐치
      → fallback 표시
        → Promise resolve
          → 컴포넌트 재렌더
```


<details>
<summary>가장 가까운 경계는 어떻게 찾나요?</summary>

throw가 work loop의 catch에 잡힌 다음, React는 Fiber 트리를 위로 탐색해서 가장 가까운 Suspense를 찾습니다.

```tsx
<App>
  <Suspense fallback={<Loading/>}>   ← 여기서 잡힘
    <Layout>
      <UserProfile>                  ← 여기서 throw
      </UserProfile>
    </Layout>
  </Suspense>
</App>
```

throw가 어떻게 catch에 잡히는 거임?

**throw는 JS 언어 레벨에서 콜 스택을 타고 올라가는 메커니즘**

```js
function 손자() {
  throw "나 여기서 던진다!";
}

function 아들() {
  손자(); // catch 없음 → 그냥 통과
}

function 아버지() {
  아들(); // catch 없음 → 그냥 통과
}

try {
  아버지();
} catch (e) {
  console.log(e); // "나 여기서 던진다!" ← 여기서 잡힘
}
```

catch 만날 때까지 catch 없으면 무조건 통과해버림

이 동작 방식을 React에서 활용해서 만듦
```tsx
<Suspense>          ← React가 여기에 catch를 심어뒀음
  <A>               ← catch 없음, 통과
    <B>             ← catch 없음, 통과
      <C>           ← throw Promise 발생!
```

`<C>`에서 throw promise → `<B>` 통과 → `<A>` 통과 → `<Suspense>` catch!

Suspense는 결국 "Promise를 잡는 catch 블록"이다.

ErrorBoundary도 똑같이 "Error를 잡는 catch 블록"!

</details>

### Error Boundary와 함께 사용

```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <Suspense fallback={<LoadingSpinner />}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>
```
Suspense → 로딩 상태 처리

ErrorBoundary → 에러 상태 처리

---

### Suspense와 호환되는 데이터 소스

Suspense는 아래 경우에만 활성화된다. **Effect나 이벤트 핸들러 안에서의 데이터 패칭은 감지하지 못한다.**

- `React.lazy()`로 지연 로딩된 컴포넌트 코드
- `use(promise)`로 캐시된 Promise 값 읽기
- Suspense-compatible 데이터 패칭 라이브러리 (Next.js, React Query, SWR 등)

```tsx
// ❌ useEffect — Suspense 감지 못함
function Albums() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/albums')
      .then(res => res.json())
      .then(setData);  // Promise throw가 render 중에 일어나지 않음
  }, []);

  if (!data) return <div>로딩중...</div>; // 직접 처리해야함
  return <div>{data}</div>;
}


<Suspense fallback={<BigSpinner />}> // Suspense 작동 X
  <Albums />
</Suspense>
```
>  useEffect는 렌더링이 끝난 뒤 실행되기 때문에, 렌더링 중 Promise throw를 감지하는 Suspense 입장에서는 "이미 지나간 일"이라 잡을 수 없음!!

---

### key prop으로 Suspense boundary 초기화

라우트가 바뀔 때 같은 Suspense boundary를 재사용하면 이전 상태가 남을 수 있다.
`key`를 다르게 주면 React가 완전히 새 경계로 인식해 처음부터 다시 로딩한다.

```tsx
import { useParams } from 'react-router-dom';

function ArtistRoute() {
  const { artistId } = useParams();

  return (
    <Suspense fallback={<BigSpinner />}>
      {/* key 없으면 라우트 변경 시 이전 컴포넌트 재사용 */}
      <ProfilePage key={artistId} artistId={artistId} />
    </Suspense>
  );
}

```
### Tanstack Query와 사용법

`useSuspenseQuery` 훅을 사용하여 데이터를 패치하면 된당

```tsx
import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Fetcher />
    </Suspense>
  )
}

export default function Fetcher() {
  const { data } = useSuspenseQuery({
    queryFn: async () => {
      const response = await fetch('https://api.example.com/data');
      return response.json();
    },
    queryKey: ['query', 'key'],
  })

  const { a, b, c } = data; // 데이터가 항상 존재

  return <div>{...SomeThing}</div>
}
```

그냥 **useQuery** 쓰는 거 보다 좋은 점이 뭐임?
- `useQuery` 훅의 반환 타입은 항상 기대하는 타입의 데이터 혹은 undefined 이기 때문에 data가 존재하지 않는 경우에 대한 폴백 데이터 처리가 필요한 반면, `useSuspenseQuery` 훅의 반환 타입은 항상 기대하는 타입의 데이터이기 때문에 폴백 데이터 처리가 필요하지 않음.

아래와 같은 `undefined` 처리가 필요 없어짐 (개꿀인듯..)

```tsx
export default function Fetcher() {
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await fetch('https://api.example.com/data');
      return response.json();
    },
    queryKey: ['query', 'key'],
  })

  if(isLoading) {
    return <Spinner />
  }

  const { a, b, c } = data ?? {};

  return <div>{...SomeThing}</div>
}
```

#### 네트워크 요청하다 에러났을땐?

`ErrorBoundary`로 처리 가능

```tsx
import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

export default function Page() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <Fetcher />
      </Suspense>
    </ErrorBoundary>
  )
}
```