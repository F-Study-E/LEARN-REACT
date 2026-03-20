import { useEffect, useEffectEvent } from "react";
/**
 * 채팅 소켓을 연결할 때 사용자의 알림 설정(isMuted)에 따라 소리가 나게 해야하는 경우
 * - 소켓은 url이 바뀔 때만 새로 연결
 * - 기존 방식이면 isMuted가 바뀔 때마다 소켓을 끊고 다시 연결
 * - useEffectEvent를 사용하면 소켓 연결 상태를 유지하며 최신 설정값만 참조
 */
const playSound = () => {
  console.log("Playing sound");
};

const createConnection = (url: string) => {
  return {
    on: (event: string, callback: (msg: string) => void) => {
      console.log(`Listening to ${event}`);
    },
    disconnect: () => {
      console.log("Disconnecting");
    },
  };
};

export default function SocketConnection({
  url,
  isMuted,
}: {
  url: string;
  isMuted: boolean;
}) {
  // 💡 [비반응형 로직] 메시지 수신 시 현재의 mute 설정을 확인
  const onMessage = useEffectEvent((msg: string) => {
    if (!isMuted) {
      playSound();
    }
    console.log("New message:", msg);
  });

  useEffect(() => {
    const socket = createConnection(url);

    socket.on("message", (msg) => {
      onMessage(msg); // 항상 최신의 isMuted 값을 참조하여 동작
    });

    return () => socket.disconnect();
  }, [url]); // ✅ isMuted가 바뀌어도 소켓은 끊기지 않음

  return (
    <div>
      <div>
        채팅 소켓을 연결할 때 사용자의 알림 설정(isMuted)에 따라 소리가 나게
        해야하는 경우
      </div>
      Connected to {url}
    </div>
  );
}
