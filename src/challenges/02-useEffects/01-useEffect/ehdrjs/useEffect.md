## useEffect

### useEffect란

렌더링이 끝나고 DOM이 반영된 뒤 **부수 효과(side effect)**를 실행하는 훅이다.
예: API 호출, 이벤트 등록, 타이머, DOM 접근 등

---

### 왜 useEffect를 쓰냐

- **렌더와 역할 분리**
  - 렌더: UI 계산만
  - Effect: 외부 작업(API, 타이머 등)

- **실행 시점**
  - 화면이 먼저 그려지고 → 그 다음 실행됨
  - 그래서 API가 느려도 UI가 막히지 않음

---

### 동작 순서

1. state / props 변경
2. 리렌더
3. DOM 업데이트
4. 브라우저 페인트
5. **useEffect 실행**

---

### 기본 형태

```tsx
useEffect(() => {
  // 실행 코드

  return () => {
    // cleanup (선택)
  };
}, [deps]);
```

---

### 실행 규칙

- deps 없음 → **매 렌더마다 실행**
- `[]` → **마운트 시 1번만 실행**
- `[a, b]` → **값이 바뀔 때만 실행**

---

### 실행 순서

Effect는 항상 아래 순서로 돈다:

```
마운트     → [본문]
재실행     → [cleanup] → [본문]
언마운트   → [cleanup]
```

예:

```tsx
useEffect(() => {
  console.log("본문", id);

  return () => {
    console.log("cleanup", id);
  };
}, [id]);
```

- 처음: `본문 1`
- id 변경: `cleanup 1 → 본문 2`
- 언마운트: `cleanup 2`

---

### cleanup이 필요한 이유

Effect에서 등록한 작업(이벤트, 타이머 등)은 컴포넌트가 사라져도 자동으로 사라지지 않는다.

→ 직접 정리하지 않으면 계속 남아서 실행됨
→ 그 결과 메모리 누수 + 중복 실행 + 버그 발생

```tsx
// 이벤트
useEffect(() => {
  const handler = () => {};
  window.addEventListener("resize", handler);

  return () => window.removeEventListener("resize", handler); // 언마운트시 cleanup을 통해 이벤트 제거
}, []);

// 타이머
useEffect(() => {
  const handler = () => {
    console.log("resize");
  };

  window.addEventListener("resize", handler);
}, []); // ❌ cleanup 없음
```

---

### 의존성 배열 핵심

React는 deps를 **Object.is**로 비교한다.

#### Object.is란

- 두 값이 "같은지" 판별할 때 쓰는 연산이다. 대략 ===와 비슷하지만 **NaN끼리는 같다**, **+0과 -0은 다르다**는 점이 다르다.
- 객체·배열은 **참조**가 같아야 같다고 본다. 내용이 같아도 새로 만든 객체면 다르다.

- 원시값 → 값 비교
- 객체/배열/함수 → **참조 비교**

```ts
Object.is(1, 1); // true
Object.is(NaN, NaN); // true
Object.is(+0, -0); // false
Object.is({}, {}); // false (서로 다른 객체)
```

---

#### ❌ 객체 넣으면 계속 실행됨

```tsx
function Bad({ page }: { page: number }) {
  const filters = { page };
  // 렌더마다 새 객체 → 이전 렌더와 참조가 다름

  useEffect(() => {
    fetchList(filters);
  }, [filters]);
  // page가 그대로여도 리렌더 발생 시(부모가 변경되거나 할 때)
  // filters 참조가 바뀌어서 fetch가 다시 호출됨

  return null;
}
```

👉 렌더마다 객체 새로 생성 → 계속 실행됨

---

#### 1. 원시값만 넣기 (추천)

```tsx
useEffect(() => {
  fetchList({ page });
}, [page]);
```

#### 2. useMemo로 고정

```tsx
const filters = useMemo(() => ({ page }), [page]);

useEffect(() => {
  fetchList(filters);
}, [filters]);
```

#### 3. 함수는 useCallback

```tsx
const load = useCallback(() => fetchItem(id), [id]);

useEffect(() => {
  load();
}, [load]);
```

---

### 핵심 요약

- useEffect = **렌더 이후 실행되는 부수 작업**
- cleanup = **이전 작업 정리**
- deps = **언제 다시 실행할지 조건**
