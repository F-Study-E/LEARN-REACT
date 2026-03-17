import { useState, useRef } from "react";

export default function Chat4() {
  const [text, setText] = useState("");
  const currentText = useRef("");

  function handleSend() {
    setTimeout(() => {
      alert("Sending: " + currentText.current);
    }, 3000);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    currentText.current = e.target.value;
  };

  return (
    <>
      state는 스냅샷 같이 동작함(현재 값을 기억) ref는 실시간으로 동작함(현재
      값을 참조)
      <input value={text} onChange={handleChange} />
      <button onClick={handleSend}>Send</button>
    </>
  );
}
