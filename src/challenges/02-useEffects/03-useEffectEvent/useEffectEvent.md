# useEffectEvent

## 왜 필요할까?

기존 `useEffect`는 내부에서 사용하는 모든 변수를 의존성 배열에 넣어야 했음  
근데 로직 중에는 이펙트를 실행시키는 트리거인 변수가 있고 실행될 때 값만 필요한 변수가 섞여 있음

- 반응형 로직  
  값이 바뀌면 이펙트가 처음부터 다시 돌아가야 함(예:채팅방 ID가 바뀌면 재연결)
- 비반응형 로직  
  최신 값이 필요하긴 하지만, 이 값이 바뀐다고 이펙트를 재시작할 필요는 없음(예: 메시지 전송 시 현재 테마나 알림 설정 값 등)

➡️ useEffectEvent는 이 비반응형 로직을 이펙트로부터 분리해내는 역할을 함

## 사용법

```typescript
const onEvent = useEffectEvent(callback);
```

```typescript
import { useEffect, useEffectEvent } from 'react';

function ChatRoom({ roomId, theme }) {
  // 💡 [비반응형 로직] 최신 theme을 읽어오지만, theme이 변해도 반응하지 않음
  const onVisit = useEffectEvent((id) => {
    console.log(`Log: Room ${id} visited with ${theme} theme.`);
  });

  useEffect(() => {
    // ✅ [반응형 트리거] 오직 roomId가 바뀔 때만 실행됨
    onVisit(roomId);
  }, [roomId]); // theme은 의존성 배열에서 제외됨

  return <div>Chat Room: {roomId}</div>;
}
```

## 동작원리

### 특징

#### 1. 함수 자체의 참조값이 절대 변하지 않음 따라서 useEffect의 의존성 배열에 넣을 필요가 없음

🤔 어떻게 참조값이 바뀌지 않을까?  
리액트는 useEffectEvent를 호출할 때마다 새로운 함수를 만드는 게 아니라, 내부적으로 고정된 프록시 함수를 하나 생성해 반환함

> **HOW**  
> 리액트가 컴포넌트를 처음 마운트할 때, 힙 메모리에 주소가 고정된 빈 껍데기 함수를 하나 만듦  
> **WHY**  
> 이 껍데기(Container)의 주소는 컴포넌트 생애 주기 내내 변하지 않음  
> 이걸 사용하는 useEffect 의존성 배열 입장에선 값이 항상 동일(안 바뀌넹)

#### 2. 호출되는 순간 최신 props, state를 항상 읽어옴

1. 렌더링 시점에서 개발자가 작성한 함수가 생성됨

```typescript
(roomId) => {
  log(theme); // 이때 최신 theme을 클로저로 잡고 있음
};
```

2. 리액트는 화면을 그리기 직전, 1번에서 만든 최신 함수를 아까 만든 고정된 껍데기 안에 끼워 넣음(assign)
3. 나중에 useEffect에서 이 껍데기를 호출하면, 그 안에 들어있는 가장 최신 로직이 실행됨

#### 3. 내부에서 참조하는 값이 바뀌어도 이펙트를 다시 실행시키지 않음

이펙트 실행 여부는 오직 의존성 배열에 담긴 객체의 참조 비교에서 결정되기 때문  
`theme`이 바뀌어 리렌더링이 일어날 때

- useEffectEvent 내부를 최신 theme을 가진 함수로 몰래 갈아 끼움(이때 주소값은 그대로)
- 리액트 엔진이 useEffect 의존성 배열을 검사함
- 동일 주소구먼 ➡️ 그냥 지나감

## 주의

사용 규칙이 엄격함(리액트 엔진이 렌더링 일관성을 유지하기 위한 규칙!)

- useEffect 내에서만 호출 가능하다  
  컴포넌트의 일반 이벤트 핸들러에서는 직접 호출 불가
- 동기적으로 호출되어야 함  
  만약 `setTimeout`, `await`이후 호출하면 `오래된 클로저` 문제를 겪을 수 있어 비동기 작업 직전에 필요한 값을 캡처하는 용도로 사용해야 함
