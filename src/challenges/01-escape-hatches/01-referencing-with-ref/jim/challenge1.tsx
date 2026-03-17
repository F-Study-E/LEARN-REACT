import { useState } from "react";
import useTimeout from "@/hooks/useTimeout";

export default function Chat() {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { set, clear } = useTimeout();
  //   const timeoutID = useRef<number | null>(null);

  function handleSend() {
    setIsSending(true);
    // 전송되면서 타이머 시작
    // timeoutID.current = setTimeout(() => {
    //   alert("Sent!");
    //   setIsSending(false);
    // }, 3000);
    set(() => {
      alert("Sent!");
      setIsSending(false);
    }, 3000);
  }

  function handleUndo() {
    setIsSending(false);
    // 되돌리기 버튼 클릭시 타이머 취소
    // if (timeoutID.current) {
    //   clearTimeout(timeoutID.current);
    //   // 취소 후 타이머 ID 초기화
    //   timeoutID.current = null;
    // }
    clear();
  }

  return (
    <>
      undo 버튼 클릭시 타이머 취소가 필요함
      <input
        disabled={isSending}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button disabled={isSending} onClick={handleSend}>
        {isSending ? "Sending..." : "Send"}
      </button>
      {isSending && <button onClick={handleUndo}>Undo</button>}
    </>
  );
}
