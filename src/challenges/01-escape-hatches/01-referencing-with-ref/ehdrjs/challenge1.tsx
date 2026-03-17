/**
 * 기존에 timeoutId를 let으로 관리하던 것을 useRef로 관리하도록 변경
 * 기존 문제점: state 업데이트시 timeoutID가 다시 초기화 되면서  
 * setTimeout 안에서 저장했던 ID와, 이후에 버튼에서 사용하는 timeoutID가 다를 수 있음
 * 
 * useRef 리렌더 사이에서도 같은 객체를 유지해 주기 때문에 값을 유지할 수 있음
 * 
 */

import { useRef, useState } from 'react';

export default function Chat1() {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const timeoutID = useRef<number | null>(null);

  function handleSend() {
    setIsSending(true);
    timeoutID.current = setTimeout(() => {
      alert('Sent!');
      setIsSending(false);
    }, 3000);
  }

  function handleUndo() {
    setIsSending(false);
    if (timeoutID.current) {
      clearTimeout(timeoutID.current);
    }
  }

  return (
    <>
      <input
        disabled={isSending}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        disabled={isSending}
        onClick={handleSend}>
        {isSending ? 'Sending...' : 'Send'}
      </button>
      {isSending &&
        <button onClick={handleUndo}>
          Undo
        </button>
      }
    </>
  );
}
