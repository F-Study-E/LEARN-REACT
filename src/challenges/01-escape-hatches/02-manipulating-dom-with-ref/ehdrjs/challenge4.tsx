import { useRef } from 'react';

export default function Page2() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <nav>
        <SearchButton onClick={() => inputRef.current?.focus()} />
      </nav>
      <SearchInput inputRef={inputRef} />
    </>
  );
}


interface Props {
  inputRef: React.RefObject<HTMLInputElement | null>;
}

function SearchInput({ inputRef }: Props) {
  return (
    <input
      placeholder="Looking for something?"
      ref={inputRef}
    />
  );
}

function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}>
      Search
    </button>
  );
}
