/**
 * useRef는 값이 변경되어도 리렌더링을 발생시키지 않아 리렌더링을 유밣하는 state로 변경
 */
import { useState } from 'react';

export default function Toggle() {
  const [isOn, setIsOn] = useState(false);
  // const isOnRef = useRef(false);

  return (
    <button onClick={() => {
      setIsOn(!isOn);
    }}>
      {isOn ? 'On' : 'Off'}
    </button>
  );
}
