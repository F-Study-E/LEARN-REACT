React Compiler는 React 앱을 **자동으로 최적화하는 빌드 타임 도구**이다.

> **현재 상태 (2026년 5월 기준)**
> 2024년 말 React 19와 함께 퍼블릭 베타로 공개됐고, 2025년 10월에 **1.0 정식 릴리스**가 나왔다. 메타의 대규모 프로덕션 앱에서 검증을 거쳐 프로덕션에 바로 쓸 수 있는 상태이며, React와 React Native 모두에서 동작한다. Next.js, Vite, Expo는 공식적으로 컴파일러를 지원한다.

### 쓰면 뭐가 좋나요?
리액트 컴파일러가 없었을 땐 개발자가 직접 수동으로 메모이제이션을 해줘야함(`React.memo`, `useMemo`, `useCallback`)

수동으로 하게 되면 실수가 발생하게 될 경우가 종종 생기게 된다

**문제 예시 코드 1**
```tsx
// ❌ 문제: memo로 감쌌지만 매 렌더마다 새 객체가 생성됨
const Parent = ({ userId }) => {
  const [count, setCount] = useState(0)

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      {/* style 객체가 매 렌더마다 새로 만들어짐 → Child의 memo 무력화 */}
      <Child user={{ id: userId }} style={{ padding: 16 }} />
    </>
  )
}

const Child = memo(function Child({ user, style }) {
  return <div style={style}>{user.id}</div>
})
```

Child를 memo로 감쌌지만, 부모에서 내려주는 **user**와 **style**이 매 렌더마다 새 객체 리터럴로 생성된다. memo는 props를 얕은 비교(Object.is)로 검사하는데, 참조가 매번 달라지니 비교 결과는 항상 "변경됨"이 된다. 그래서 count만 바뀌어도 Child는 매번 리렌더되고, 결국 memo의 리렌더 방지 효과가 사라진다.

**문제 예시 코드 2**
```tsx
// ❌ 문제: multiplier를 의존성 배열에서 누락
const PriceList = memo(function PriceList({ data, onClick }) {
  const [multiplier, setMultiplier] = useState(1)

  const handleClick = useCallback((item) => {
    // multiplier를 사용하지만...
    onClick(item.id, item.price * multiplier)
  }, [onClick]) // ⚠️ multiplier가 빠짐 → 항상 초기값 1로 동작 (stale)

  return (
    <>
      <button onClick={() => setMultiplier(m => m + 1)}>
        배율 올리기 (현재 {multiplier})
      </button>
      <ul>
        {data.map(item => (
          <Item key={item.id} item={item} onClick={handleClick} />
        ))}
      </ul>
    </>
  )
})
```

의존성 배열에 multiplier가 빠져, useCallback이 생성 시점의 값(=1)을 클로저에 가둔 채 재사용한다. 화면 텍스트는 갱신되지만 handleClick 내부 계산엔 항상 1이 쓰이는 stale closure 버그다. 참조는 안정적이라 memo는 동작하지만 값이 틀린다.

React Compiler는 이 모든 판단을 자동화해서 개발자는 그냥 코드를 작성하기만 하면 된다. ~~개꿀이네요~~

---

### 동작 원리
컴파일러는 Babel AST를 받아서 자기만의 HIR(CFG 기반 중간 표현)로 낮춘 뒤 여러 패스를 거친다.

대략적인 흐름도
```
AST → HIR → SSA → effect/mutability 분석 → reactive scope → 코드 생성
```

### AST, HIR, SSA 이 뭔가요?

**AST (추상 구문 트리)**
코드를 트리로 바꾼 것. 파서가 만들어내며, 이후 분석·변환 단계의 기준이 되는 구조다.

```ts
const x = "a" + b
// AST로 변환
→ VariableDeclaration (const)
  └ VariableDeclarator
      ├ Identifier (x)              ← 선언되는 변수
      └ BinaryExpression (+)        ← 초기값
          ├ StringLiteral ("a")
          └ Identifier (b)
```


**HIR (고수준 중간 표현)**
컴파일러가 분석하기 편하게 다듬은 중간 형태.
복잡한 코드를 잘게 쪼개고 if/for를 단순한 흐름으로 펼친다.

**원본 코드**
```tsx
// 원본
{count > 0 ? <p>{count}번 클릭됨</p> : <p>아직 안 누름</p>}
```

**HIR**
```ts
// HIR (타입 표기는 걷어낸 버전)
bb2: $21 = count > 0
     Branch ($21) then:bb3 else:bb4   ← 삼항이 "조건 + 분기 점프"로 분해됨
bb3: $14 = JSX <p>{count}번 클릭됨</p>
     $11 = $14                      ← 결과를 $11에 저장
     Goto bb1
bb4: $17 = JSX <p>아직 안 누름</p>
     $11 = $17                      ← 여기도 $11에 저장
     Goto bb1
bb1: ... <div>...{$11}...</div>      ← $11을 가져다 씀 (두 경로가 합쳐짐)
```

각 명령어가 고유 식별자(`$0`, `$1`, ...)를 가진 값을 생성하고, 조건문이 있으면 여러 블록으로 분기된다.

> React Compiler의 HIR은 코드를 제어 흐름 그래프(Control Flow Graph - 코드의 실행 경로를 블록과 화살표로 표현한 그래프)로 나타내되, JSX나 논리 연산 같은 고수준 구조를 보존한다.


**SSA (단일 정적 할당)**
변수 하나에 값을 딱 한 번만. 재할당하면 새 이름을 붙인다.
이러면 "이 값이 어디서 왔는지"가 딱 보여서 분석이 쉬워진다.

```
let x = 1     →   x1 = 1
x = x + 1     →   x2 = x1 + 1
```

이 과정으로 컴파일러는 "어떤 값이 무엇에 의존하고 언제 바뀌는가"를 자동으로 알아낸다. 사람이 의존성 배열로 손수 적던 걸 데이터 흐름 분석으로 계산하는 것이다.

위 과정을 진행하고 나면 아래와 같이 코드가 생성된다.


```tsx
// 컴파일 전 (내가 쓴 코드)
function Greeting({ name }) {
  const greeting = "Hello, " + name
  return <h1>{greeting}</h1>
}

// 컴파일 후
function Greeting(t0) {
  const $ = _c(2);            // 캐시 슬롯 확보
  const { name } = t0;
  const greeting = "Hello, " + name;
  let t1;
  if ($[0] !== name) {        // 입력값(name)이 이전 렌더와 다를 때만
    t1 = <h1>{greeting}</h1>; //   새로 계산
    $[0] = name;
    $[1] = t1;                //   결과 캐싱
  } else {
    t1 = $[1];                // 같으면 캐시된 값 재사용
  }
  return t1;
}
```
<br/>

**첫 렌더와 두번 째 렌더링 때 name이 그대로일 경우 플로우**
![](https://velog.velcdn.com/images/ehdrjs4502/post/158a7f1e-fb61-4ece-8cdd-40407d523bcd/image.png)


새 `<h1>` 객체를 안 만들고 이전 것과 똑같은 참조를 돌려준다.
React가 "오옹 이거 아까랑 같은거네" 하고 DOM을 안 건드림 => 리렌더 스킵

name이 "영희"로 바뀌면? `$[0]`("철수") `!== name`("영희") -> 참 -> 다시 계산


> 실제 출력이 궁금하면 [Playground](https://playground.react.dev/)에 코드 붙여넣으면 진짜 컴파일 결과를 볼 수 있다.

---

### 수동 최적화가 더 나은 경우
컴파일러가 거의 모든 케이스를 커버하지만, 아래 상황에서는 여전히 수동 메모이제이션이 의미가 있다.

**참조 동일성(referential equality)을 의도적으로 보장해야 할 때**
`useEffect`의 의존성 배열에 객체나 함수를 넘기는 경우. 리액트 컴파일러가 그 참조를 메모이제이션해줄 *수도* 있지만, 그건 보장이 아니라 최적화 결과다. 컴파일러의 메모이제이션은 **"렌더 출력 최적화"**가 목적이라, 어떤 조건에서 bailout하거나 버전에 따라 전략이 바뀌어도 리액트 컴파일러 입장에선 버그가 아니다. 렌더 결과는 여전히 정확하니까.

문제는 effect 의존성이라는 맥락이다. 참조가 흔들리면 단순히 재렌더가 한 번 더 도는 수준이 아니라, **effect가 다시 실행**된다(subscribe/unsubscribe 중복, 요청 재발생 등). 즉 성능 문제가 아니라 **동작 정합성 문제**라서, "RC가 알아서 해주겠지"에 맡기지 말고 수동으로 참조를 못 박는 게 안전하다.

> 정리: 렌더에만 쓰이는 객체는 리액트 컴파일러에 맡겨도 무해(수동 메모 불필요). effect 의존성에 들어가는 객체는 참조 안정성이 동작의 정합성을 좌우하므로 수동으로 보장한다.

```tsx
// ❌ 리액트 컴파일러 없으면 매 렌더마다 새 객체 → effect 매번 재실행.
//    리액트 컴파일러 있어도 메모이제이션은 보장이 아니라, effect 트리거를 여기에 맡기면 불안정.
function Search({ query }) {
  const config = { query, pageSize: 20 }
  useEffect(() => {
    subscribe(config)
    return () => unsubscribe(config)
  }, [config])
}

// ✅ query가 바뀔 때만 config 재생성 → effect도 그때만 재실행.
//    참조 안정성을 코드로 보장(우연이 아니라 계약).
function Search({ query }) {
  const config = useMemo(
    () => ({ query, pageSize: 20 }),
    [query]
  )
  useEffect(() => {
    subscribe(config)
    return () => unsubscribe(config)
  }, [config])
}
```

>  "혹시 모르니 useMemo 넣어두자"는 지양하는 게 좋다
컴파일러는 손으로 박은 메모가 자기 추론과 어긋나면, 그 컴포넌트 자동 최적화를 통째로 포기(bail out)한다. 내가 넣은 메모이제이션은 그대로 동작하지만, 컴파일러가 깔아줬을 더 촘촘한 메모를 못 받는 게 손해일 수 있으니 수동 메모는 정말 필요할 때만 사용하도록 하자!

---

### 알아두면 좋은 점

컴파일러가 자동으로 다 해주는 것 같지만, 사실 **컴파일러가 분석할 수 있는 코드 구조는 개발자**가 만들어줘야 한다. **컴파일러는 마법이 아니라 정적 분석 도구**라서, 분석이 통하는 환경을 깔아줘야 일을 한다.

**1. 컴포넌트 경계**

컴파일러는 함수 컴포넌트 경계 단위로만 리렌더를 끊을 수 있다. 리스트 안의 카드 하나만 리렌더되게 하고 싶으면, **카드를 function Card(...)로 분리해야 한다. 분리만 해두면 React.memo 안 붙여도 컴파일러가 알아서 끊어준다.** 반대로 카드 UI를 List 함수 안에 인라인 JSX로 때려박으면 끊을 함수 자체가 없어서 List가 리렌더될 때 카드도 전부 다시 그려진다.

```tsx
// ✅ Card가 별도 컴포넌트 → 한 카드만 바뀌어도 나머지는 스킵
function Card({ item }) {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(!liked)}>{item.name}</button>
}
function List({ items }) {
  return <>{items.map(item => <Card key={item.id} item={item} />)}</>
}
```

**2. Rules of React 준수**

컴파일러의 mutability 분석은 규칙을 지킨 코드에서만 통한다. 렌더 중 mutation, 생성과 변이가 여기저기 흩어진 코드 등은 컴파일러가 "안전하지 않다"고 판단해서 그냥 메모이제이션을 스킵한다(=최적화 안 됨). **1.0부터는 Rules of React가 단순한 권장사항이 아니라 컴파일러가 강제하는 빌드 타임 계약에 가까워졌다.
ESLint 규칙(`eslint-plugin-react-hooks`)이 위반을 잡아주니 ESLint를 잘 활용하도록 하자!**

> 즉 컴파일러는 "잘 짜인 코드를 더 빠르게" 만들어주는 거지, "아무렇게나 짠 코드를 알아서 고쳐주는" 게 아니다.

---

> 참고
https://gitnation.com/contents/react-compiter-internals
https://ko.react.dev/learn/react-compiler/introduction
https://yceffort.kr/2026/02/react-compiler-deep-dive