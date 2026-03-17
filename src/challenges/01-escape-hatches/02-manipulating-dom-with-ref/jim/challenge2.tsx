import { useRef } from "react";

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null);

  const onClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      <nav>
        <button onClick={onClick}>Search</button>
      </nav>
      <input ref={inputRef} placeholder="Looking for something?" />
    </>
  );
}
