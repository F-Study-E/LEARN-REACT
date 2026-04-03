# useOptimistic

: 서버 응답을 기다리지 않고 **낙관적으로(optimistically) UI를 먼저 업데이트**한 뒤, 실패 시 롤백하는 React 19 훅

비동기 작업이 완료되기 전 UI를 먼저 성공한 것처럼 업데이트하고(임시상태), 작업이 끝나면 결과에 따라 상태를 자동으로 동기화해주는 도구

## 동작 방식

```tsx
const [optimisticState, addOptimistic] = useOptimistic(
  state, // 실제 상태
  (currentState, optimisticValue) => newState, // 낙관적 업데이트 함수
);
```

- `state`: 초기 상태, 진짜 데이터(낙관적 업데이트 후 이 값으로 돌아감)
- `updateFunction`: 낙관적 상태를 어떻게 합칠지 정의하는 순수 함수
  - `currentState`: 베이스 상태
  - `optimisticValue`: `addOptimistic`을 호출할 때 전달한 값
- `optimisticState`: 화면 렌더링에 직접 사용할 값
  - 비동기 작업이 없을 땐 state와 동일하고 작업 중일 땐 업데이트 함수에 의해 계산된 값
- `addOptimistic`: 낙관적 업데이트를 발생시키는 함수, 비동기 액션 내부에서 호출

→ `addOptimistic` 호출 시 즉시 UI 반영  
→ 비동기 작업이 완료되면 실제 `state`로 자동 교체  
→ 실패해도 `state`가 그대로라면 자동 롤백

`useOptimistic`은 반드시 `startTransition` 또는 Server Action 내부에서 사용

## 동작 원리

`useOptimistic`은 단독으로 작동하지 않고, 리액트의 액션(Action/Transition) 생명주기에 기생하여 동작함

1. 사용자가 폼을 제출하거나 버튼을 눌러 비동기 함수가 실행됨
2. 액션 내부에서 `addOptimistic(임시값)`을 호출
3. 리액트는 즉시 업데이트 함수를 가동해 `optimisticState`를 계산하고 홤녀을 다시 그림 → 이때 사용자는 서버 응답 전인데 결과가 반영된 화면을 봄
4. await을 통해 실제 통신 진행 → 이 동안 낙관적 상태 유지
5. 비동기 함수 종료 후 임시 상태를 폐기
6. 실제 상태가 업데이트되었다면 그 값이 state가 되어 화면에 남고, 실패해서 아무것도 안 했으면 원래 state로 자연스럽게 돌아감

### 내부 원리

#### 상태 계산

리액트는 비동기 액션이 진행되는 동안 발생하는 낙관적 업데이트를 내부 큐에 쌓음  
액션이 진행 중일 때 렌더링이 발생하면, 리액트는 state를 시작점으로 큐에 쌓인 모든 updateFn을 순차적으로 적용하여 최종 optimisticState를 도출

#### 자동 롤백

useOptimistic은 자신이 속한 비동기 액션의 Promise가 해결되는 것을 감시  
액션이 활성 상태일 때만 낙관적 레이어를 덧씌우고 액션이 종료되면 해당 레이어를 엔진 레벨에서 삭제

따라서 개발자가 catch 문에서 "상태를 이전으로 되돌리는 코드"를 짤 필요가 없음  
→ '틀리면 되돌리는 것'이 아니라 **'잠시 보여주다 치우는 것'**

## 레퍼런스

- https://react.dev/reference/react/useOptimistic
