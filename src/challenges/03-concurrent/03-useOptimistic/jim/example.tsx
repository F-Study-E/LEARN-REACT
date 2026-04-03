import { useOptimistic, useState } from "react";

interface Message {
  text: string;
  sending: boolean;
}

/**
 * [가짜 서버 요청 함수]
 * @param shouldFail - 에러 발생 여부 플래그
 */
const deliverMessage = async (message: string, shouldFail: boolean) => {
  await new Promise((res) => setTimeout(res, 1000));

  if (shouldFail) {
    throw new Error("서버 전송 실패!");
  }

  return message;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "안녕하세요!", sending: false },
  ]);

  // 낙관적 상태 정의
  const [optimisticMessages, addOptimisticMessage] = useOptimistic<
    Message[],
    string
  >(messages, (state, newMessage) => [
    ...state,
    { text: newMessage, sending: true },
  ]);

  /**
   * 폼 액션 핸들러
   */
  const handleForm = async (formData: FormData) => {
    const messageText = formData.get("message") as string;
    const intent = formData.get("intent") as string; // 어떤 버튼을 눌렀는지 확인
    const shouldFail = intent === "fail";

    if (!messageText) return;

    // 1. [낙관적 업데이트] 결과와 상관없이 일단 화면에 추가
    addOptimisticMessage(messageText);

    try {
      // 2. 서버 요청 시도
      const sentMessage = await deliverMessage(messageText, shouldFail);

      // 3. [성공 시] 실제 상태 업데이트 (영구 반영)
      setMessages((prev) => [...prev, { text: sentMessage, sending: false }]);
    } catch (e) {
      // 4. [실패 시] 아무것도 하지 않습니다.
      // 액션(handleForm) 함수가 종료되는 순간, useOptimistic이 자동으로
      // 추가했던 메시지를 삭제하고 원래 messages 상태로 롤백합니다.
      console.error(e);
      // alert("전송에 실패했습니다. 목록에서 삭제됩니다.");
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h2>useOptimistic 실습 (성공 vs 실패)</h2>

      <form action={handleForm} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="message"
          placeholder="메시지 입력..."
          style={{ padding: "8px", width: "200px" }}
        />

        {/* 'intent' 값을 다르게 주어 어떤 버튼인지 구분합니다 */}
        <button
          type="submit"
          name="intent"
          value="success"
          style={{ marginLeft: "10px" }}
        >
          보내기
        </button>

        <button
          type="submit"
          name="intent"
          value="fail"
          style={{
            marginLeft: "5px",
            backgroundColor: "#fee2e2",
            border: "1px solid #ef4444",
            color: "#b91c1c",
          }}
        >
          보내기 실패 테스트
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {optimisticMessages.map((m, i) => (
          <div
            key={i}
            style={{
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: m.sending ? "#f3f4f6" : "#dcfce7",
              alignSelf: "flex-start",
              border: m.sending ? "1px dashed #9ca3af" : "1px solid #22c55e",
            }}
          >
            {m.text}
            {m.sending}
          </div>
        ))}
      </div>
    </div>
  );
}
