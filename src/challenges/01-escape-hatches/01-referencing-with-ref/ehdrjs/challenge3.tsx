
/**
 * 전역으로 timeoutID를 사용해서 모든 컴포넌트의 공유가 된 문제가 발생
 * 각 버튼 컴포넌트 내부에서 각각의 timeoutID를 사용하도록 변경
 */
import { useRef } from "react";

function DebouncedButton({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
  const timeoutID = useRef<number | null>(null);
  return (
    <button onClick={() => {
      if (timeoutID.current) {
        clearTimeout(timeoutID.current);
      }
      timeoutID.current = setTimeout(() => {
        onClick();
      }, 1000);
    }}>
      {children}
    </button>
  );
}

export default function Dashboard() {
  return (
    <>
      <DebouncedButton
        onClick={() => alert('Spaceship launched!')}
      >
        Launch the spaceship
      </DebouncedButton>
      <DebouncedButton
        onClick={() => alert('Soup boiled!')}
      >
        Boil the soup
      </DebouncedButton>
      <DebouncedButton
        onClick={() => alert('Lullaby sung!')}
      >
        Sing a lullaby
      </DebouncedButton>
    </>
  )
}
