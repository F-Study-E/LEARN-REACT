import { useState, useRef } from 'react';

export default function Chat2() {
  const [text, setText] = useState('');
  // state를 그대로 사용하면 setTimeout 콜백이 만들어질 때의 text를 클로저로 "기억"해서(버튼 클릭 시점 값 고정),
  // 이후에 입력을 바꿔도 콜백 안에서는 옛날 값만 보게 된다.
  // 반대로 ref.current는 렌더 사이에서도 같은 객체를 계속 가리키고, 그 안의 current만 계속 바꾸기 때문에,
  // setTimeout 콜백이 실행되는 시점에 ref.current를 읽으면 "그때그때 최신 입력 값"을 읽을 수 있다.
  const finallText = useRef('');

  function handleSend() {
    setTimeout(() => {
      alert('Sending: ' + finallText.current);
    }, 3000);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
    finallText.current = e.target.value;
  }

  return (
    <>
      <input
        value={text}
        onChange={handleChange}
      />
      <button
        onClick={handleSend}>
        Send
      </button>
    </>
  );
}
