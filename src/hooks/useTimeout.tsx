import { useCallback, useRef } from "react";

export default function useTimeout() {
  const timeoutID = useRef<number | null>(null);

  const set = useCallback((callback: () => void, delay: number) => {
    // 이전 타이머 취소
    clear();
    timeoutID.current = setTimeout(() => {
      callback();
      // 완료 후 종료
      timeoutID.current = null;
    }, delay);
  }, []);

  const clear = useCallback(() => {
    if (timeoutID.current) {
      clearTimeout(timeoutID.current);
      timeoutID.current = null;
    }
  }, []);

  return { set, clear };
}
