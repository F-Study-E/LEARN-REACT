import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

export default function CatFriends() {
  const [index, setIndex] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  return (
    <>
      <nav>
        <button onClick={() => {
          // flushSync 안에서 state를 업데이트하면,
          // React가 이 업데이트를 즉시 동기적으로 처리하고 DOM까지 반영한 뒤에
          // 아래의 scrollIntoView가 실행되도록 보장해 준다.
          // (즉, "index 변경 → 새 이미지에 ref 연결 → 그 DOM 기준으로 스크롤" 순서를 강제)
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
    </>
  );
}

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

