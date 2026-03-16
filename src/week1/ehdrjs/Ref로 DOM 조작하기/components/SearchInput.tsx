interface Props {
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function SearchInput({ inputRef }: Props) {
  return (
    <input
      placeholder="Looking for something?"
      ref={inputRef}
    />
  );
}
