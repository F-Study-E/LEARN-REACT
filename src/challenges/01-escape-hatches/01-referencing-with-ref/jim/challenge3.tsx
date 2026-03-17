import { useRef } from "react";

function DebouncedButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  const timeoutID = useRef<number | null>(null);

  const handleClick = () => {
    if (timeoutID.current) {
      clearTimeout(timeoutID.current);
      timeoutID.current = null;
    }
    timeoutID.current = setTimeout(() => {
      onClick();
    }, 1000);
  };

  return <button onClick={handleClick}>{children}</button>;
}

export default function Dashboard() {
  return (
    <>
      모두 같은 timeoutID를 사용하고 있어 마지막으로 클릭한 버튼 메시지만 보이게
      된 것
      <DebouncedButton onClick={() => alert("Spaceship launched!")}>
        Launch the spaceship
      </DebouncedButton>
      <DebouncedButton onClick={() => alert("Soup boiled!")}>
        Boil the soup
      </DebouncedButton>
      <DebouncedButton onClick={() => alert("Lullaby sung!")}>
        Sing a lullaby
      </DebouncedButton>
    </>
  );
}
