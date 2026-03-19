# ⚛️ React 스터디

리액트 공식 문서를 보며 기초 복습하기

## 📌 스터디 주제

* **대상:** [react.dev](https://react.dev/learn) (공식 문서)의 모든 챌린지 풀이
* **목표:** 리액트의 핵심 렌더링 원리 및 상태 관리 로직 완벽 이해

---

## 📂 프로젝트 구조

하나의 리액트 앱에서 각자의 풀이를 독립적으로 확인하기 위해 아래와 같이 구성

```text
src/
├── challenges/
│   ├── 01-chapter/     # 챕터명
│   │   ├── _components/          # 공통 컴포넌트 (선택)
│   │   ├── UserA/                # 참여자 폴더
│   │   │   ├── Challenge1.tsx
│   │   │   └── index.tsx         # 본인 풀이의 메인 진입점
│   │   └── UserB/
│   └── ...
├── App.tsx                       # 전체 라우팅 설정
└── main.tsx
```
---

## 🌿 브랜치 규칙

작업 시 브랜치가 꼬이지 않도록 아래 명명 규칙을 준수하자

* **Base Branch:** `main` (언제나 실행 가능한 상태 유지)
* **Working Branch:** `feat/ch{번호}-{이름}`
* 예: `feat/ch01-gildong`, `feat/ch03-asdf`


* **Workflow:** `Working Branch` 작업 → `PR` 생성 → `main` 병합

---

## 💬 커밋 컨벤션

[`Conventional Commits`](https://www.google.com/search?q=%5Bhttps://www.conventionalcommits.org/%5D(https://www.conventionalcommits.org/)) 스타일을 따릅니다.

| 타입 | 설명 | 예시 |
| --- | --- | --- |
| **feat** | 새로운 챌린지 풀이 추가 | `feat: [Ch01] UI 구성하기 챌린지 완료` |
| **fix** | 버그 수정 또는 잘못된 풀이 정정 | `fix: [Ch02] 이벤트 핸들러 로직 수정` |
| **docs** | 리드미 수정 또는 문서 추가 | `docs: 이번 주 학습 내용 요약 추가` |
| **refactor** | 코드 리뷰 반영 및 리팩토링 | `refactor: [Ch01] 컴포넌트 분리 및 가독성 개선` |
| **chore** | 설정 변경 (의존성 추가 등) | `chore: react-router-dom 설치` |

---

## 🚀 Pull Request (PR) 규칙

PR 제출 시 아래 템플릿을 사용하여 본인의 코드 의도를 설명해야 한다.

> **PR 제목:** `[Ch{번호}] {이름} 풀이 제출`

### **PR 내용 (Template)**

```markdown
## 💡 이번 챌린지 핵심 요약
- 챌린지에서 요구한 핵심 개념 (예: Pure Component, State Lifting 등)

## 🧐 고민했던 부분
- 구현하면서 어려웠던 점이나 궁금했던 점

## ✅ 셀프 체크리스트
- [ ] 공식 문서의 요구사항을 모두 충족했는가?
- [ ] 불필요한 State 사용을 지양했는가?
- [ ] 컴포넌트 분리가 적절한가?

```

---

## 📅 커리큘럼

| 주차 | 챕터명 | 주요 개념 | 상태 |
| --- | --- | --- | --- |
| **Week 1** | **Escape Hatches** | Ref로 값 참조하기,Ref로 DOM 조작하기 챌린지 풀기 + useRef 파보기 | ✅ |
| **Week 2** | useEffect 시리즈 | useEffect, useEffectEvent, useLayoutEffect | 🏃 진행중 |
---

