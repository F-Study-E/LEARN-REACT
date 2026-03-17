import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

interface ModuleType {
  default: React.ComponentType;
}

interface StudyRoute {
  path: string;
  Component: React.ComponentType;
  chapter: string;
  example: string;
  user: string;
}

// eager: true는 빌드 시점에 모든 모듈을 즉시 가져옴
// path 예시: "./challenges/01-chapter/01-example/user/index.tsx"
const modules = import.meta.glob<ModuleType>("./challenges/**/*/index.tsx", {
  eager: true,
});

const routes: StudyRoute[] = Object.keys(modules).map((path) => {
  const pathParts = path.split("/");
  const chapter = pathParts[2];
  const example = pathParts[3];
  const user = pathParts[4];

  return {
    path: `/${chapter}/${example}/${user}`,
    Component: modules[path].default,
    chapter,
    example,
    user,
  };
});

// 4. 스타일 객체 정의 (선택 사항, 가독성을 위해)
const navStyle: React.CSSProperties = {
  width: "250px",
  borderRight: "1px solid #e1e1e1",
  padding: "1.5rem",
  height: "100vh",
  overflowY: "auto",
  backgroundColor: "#f9f9f9",
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: "2rem",
  height: "100vh",
  overflowY: "auto",
};

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", fontFamily: "sans-serif" }}>
        <nav style={navStyle}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>
            ⚛️ React Docs Study
          </h2>
          {routes.length === 0 && <p>챌린지를 찾을 수 없습니다.</p>}
          {routes.map((route) => (
            <div key={route.path} style={{ marginBottom: "12px" }}>
              <Link
                to={route.path}
                style={{
                  textDecoration: "none",
                  color: "#333",
                  fontSize: "0.9rem",
                }}
              >
                <div style={{ fontWeight: "bold", color: "#666" }}>
                  {route.chapter}
                </div>
                <div style={{ marginLeft: "8px", color: "#888" }}>
                  {route.example}
                </div>
                <div style={{ marginLeft: "8px" }}>👤 {route.user}</div>
              </Link>
            </div>
          ))}
        </nav>

        {/* 메인 화면 */}
        <main style={mainStyle}>
          <Routes>
            <Route
              path="/"
              element={
                <div style={{ color: "#888" }}>
                  <h1>Welcome!</h1>
                  <p>왼쪽 사이드바에서 확인하고 싶은 챌린지를 선택하세요.</p>
                </div>
              }
            />
            {routes.map(({ path, Component }) => (
              <Route
                key={path}
                path={path}
                // 컴포넌트가 바뀔 때마다 상태를 초기화하기 위해 key를 부여
                element={<Component key={path} />}
              />
            ))}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
