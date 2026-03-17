import { useState, useRef } from "react";

export default function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function handleClick() {
    const nextIsPlaying = !isPlaying;
    setIsPlaying(nextIsPlaying);

    if (videoRef.current) {
      if (nextIsPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }

  return (
    <>
      비디오 재생을 위해선 ref를 사용해서 비디오 요소에 접근해야 함
      <button onClick={handleClick}>{isPlaying ? "Pause" : "Play"}</button>
      <video width="250" ref={videoRef}>
        <source
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          type="video/mp4"
        />
      </video>
    </>
  );
}
