import { useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

/**
 * flushSync 버전: 이벤트 핸들러 안에서 즉시 DOM 반영 후 scrollIntoView
 *
 * [실행 흐름]
 * 1. onClick → flushSync 콜백 실행
 * 2. setIndex 호출 → React가 동기적으로 리렌더 + 커밋 + DOM 반영 (강제 flush)
 * 3. flushSync 반환 후 imgRef.current가 새 DOM을 가리킴
 * 4. scrollIntoView 실행
 *
 * [주의사항]
 * - React 배칭을 깨고 메인 스레드를 블로킹함
 * - 컴포넌트 트리가 크면 클릭 시 UI 지연/멈춤 느낌 가능
 * - DOM 측정·변경이 필요할 땐 useLayoutEffect 사용을 권장
 *
 * @see https://ko.react.dev/reference/react-dom/flushSync
 */
export function CatFriendsFlushSync() {
  const [index, setIndex] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  return (
    <>
      <nav>
        <button onClick={() => {
          flushSync(() => {
            if (index < catList.length - 1) {
              setIndex(index + 1);
            } else {
              setIndex(0);
            }
          });
          imgRef.current?.scrollIntoView({
            behavior: 'smooth', block: 'nearest', inline: 'center'
          });
        }}>
          Next
        </button>
      </nav>
      <CatList index={index} imgRef={imgRef} />
    </>
  );
}

/**
 * useLayoutEffect 버전 (권장): React의 정상 커밋 사이클 안에서 scrollIntoView 실행
 *
 * [실행 흐름]
 * 1. onClick → setIndex 호출
 * 2. React 리렌더 → DOM 커밋 (paint 전)
 * 3. useLayoutEffect 실행 → scrollIntoView
 * 4. 브라우저 paint
 */
export function CatFriendsLayoutEffect() {
  const [index, setIndex] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    imgRef.current?.scrollIntoView({
      behavior: 'smooth', block: 'nearest', inline: 'center'
    });
  }, [index]);

  return (
    <>
      <nav>
        <button onClick={() => {
          if (index < catList.length - 1) {
            setIndex(index + 1);
          } else {
            setIndex(0);
          }
        }}>
          Next
        </button>
      </nav>
      <CatList index={index} imgRef={imgRef} />
    </>
  );
}

function CatList({ index, imgRef }: { index: number; imgRef: React.RefObject<HTMLImageElement | null> }) {
  return (
    <div>
      <ul style={{
        display: 'flex',
        width: '900px',
        overflow: 'hidden',
      }}>
        {catList.map((cat, i) => (
          <li key={cat.id}>
            <img
              ref={index === i ? imgRef : null}
              style={{
                border: index === i ? '4px solid red' : 'none',
              }}
              src={cat.imageUrl}
              alt={'Cat #' + cat.id}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CatFriendsLayoutEffect;

const catCount = 10;
const catList = new Array(catCount);
for (let i = 0; i < catCount; i++) {
  const bucket = Math.floor(Math.random() * catCount) % 2;
  let imageUrl = '';
  switch (bucket) {
    case 0: {
      imageUrl = "https://placecats.com/neo/250/200";
      break;
    }
    case 1: {
      imageUrl = "https://placecats.com/millie/250/200";
      break;
    }
    case 2:
    default: {
      imageUrl = "https://placecats.com/bella/250/200";
      break;
    }
  }
  catList[i] = {
    id: i,
    imageUrl,
  };
}

