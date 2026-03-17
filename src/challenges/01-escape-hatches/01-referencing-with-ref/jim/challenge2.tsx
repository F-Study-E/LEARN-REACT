import { useState } from "react";

export default function Toggle() {
  const [isOn, setIsOn] = useState(false);

  return (
    <>
      ref는 리렌더링을 트리거하지 않음
      <button
        onClick={() => {
          setIsOn(!isOn);
        }}
      >
        {isOn ? "On" : "Off"}
      </button>{" "}
    </>
  );
}
