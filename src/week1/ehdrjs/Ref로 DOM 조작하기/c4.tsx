import SearchButton from './components/SearchButton.tsx';
import SearchInput from './components/SearchInput.tsx';
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
