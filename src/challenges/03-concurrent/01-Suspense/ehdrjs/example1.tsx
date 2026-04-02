import { Suspense, useState, use } from "react";

type ProfileData = { name: string; bio: string };

// 데이터 페칭 시뮬레이션 → 1.5초 후 프로필 반환
function fetchProfile(): Promise<ProfileData> {
  return new Promise((resolve) => setTimeout(() => resolve({ name: "홍길동", bio: "React 개발자입니다." }), 1500));
}

// use(promise) → resolve 전까지 suspend 발생 → Suspense fallback 표시
function Profile({ promise }: { promise: Promise<ProfileData> }) {
  const data = use(promise);
  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #4caf50",
        borderRadius: 8,
      }}
    >
      <h5 style={{ margin: "0 0 8px" }}>👤 프로필 컴포넌트</h5>
      <p style={{ margin: 0, color: "#555" }}>
        {data.name} — {data.bio}
      </p>
    </div>
  );
}

export default function Example1() {
  // Promise를 state로 관리 → 버튼 클릭 시 생성, 숨길 때 초기화
  const [promise, setPromise] = useState<Promise<ProfileData> | null>(null);

  function handleToggle() {
    if (promise) {
      setPromise(null);
    } else {
      setPromise(fetchProfile());
    }
  }

  return (
    <section>
      <h4>Example1 - use(promise) + Suspense (데이터 페칭)</h4>
      <p>
        버튼을 누르면 <code>use()</code>로 Promise를 읽는 컴포넌트가 마운트된다.
        <br />
        로딩되는 동안 <code>{"<Suspense fallback={...}>"}</code>의 fallback이 표시된다.
      </p>

      <button onClick={handleToggle}>{promise ? "숨기기" : "프로필 불러오기"}</button>

      {promise && (
        // Suspense boundary: Profile이 suspend 상태일 때 fallback 표시
        <Suspense fallback={<div style={{ color: "#888", marginTop: 12 }}>⏳ 로딩 중...</div>}>
          <Profile promise={promise} />
        </Suspense>
      )}
    </section>
  );
}
