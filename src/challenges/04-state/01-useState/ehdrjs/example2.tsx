import { useState } from "react";

export default function Example2() {
  const [userId, setUserId] = useState(1);
  return (
    <>
      <h2>첫번째: key 없음, 두번째: key=userId</h2>
      <button onClick={() => setUserId(1)}>유저 1</button>
      <button onClick={() => setUserId(2)}>유저 2</button>
      <Profile userId={userId} />
      <Profile key={userId} userId={userId} />
    </>
  );
}

function Profile({ userId }: { userId: number }) {
  const [input, setInput] = useState("");

  return (
    <div>
      <h2>유저 {userId}의 프로필</h2>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
    </div>
  );
}
