import { useRef } from "react";

function SearchButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Search</button>;
}

function SearchInput({
  inputRef,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return <input placeholder="Looking for something?" ref={inputRef} />;
}

export default function Page2() {
  const inputRef = useRef<HTMLInputElement>(null);

  const onClick = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <nav>
        <SearchButton onClick={onClick} />
      </nav>
      <SearchInput inputRef={inputRef} />
    </>
  );
}
