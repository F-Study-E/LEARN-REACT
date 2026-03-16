/*
돔을 제어하기 위해 ref 사용.

React에서는 보통 화면을 "선언적으로" 그리기 때문에
직접 querySelector 등으로 DOM을 찾지 않고,
ref를 통해 특정 DOM 요소(여기서는 <video>)에 대한 "직접 핸들"을 받아온다.

videoRef.current에는 실제 <video> DOM 노드가 들어오므로
videoRef.current.play()/pause()처럼,
브라우저가 제공하는 메서드를 그대로 호출해서
재생/일시정지 같은 "명령형 DOM 조작"을 할 수 있다.
*/


import { useState, useRef } from 'react';

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
      <button onClick={handleClick}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <video width="250" ref={videoRef}>
        <source
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          type="video/mp4"
        />
      </video>
    </>
  )
}
