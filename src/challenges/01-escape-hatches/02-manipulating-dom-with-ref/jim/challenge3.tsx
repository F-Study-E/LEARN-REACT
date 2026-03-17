import { useEffect, useRef, useState } from "react";

export default function CatFriends() {
  const [index, setIndex] = useState(0);
  const selectedRef = useRef<HTMLLIElement>(null);

  const onClick = () => {
    if (index < catList.length - 1) {
      setIndex(index + 1);
    } else {
      setIndex(0);
    }
    // 여기서 실행하면 아직 index값이 바뀌기 전
    console.log("onClick", selectedRef.current?.id);
  };

  // index가 바뀌고 DOM 업데이트 후 실행
  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [index]);

  return (
    <>
      <nav>
        <button onClick={onClick}>Next</button>
      </nav>
      <div
        style={{
          width: "400px",
          overflow: "hidden",
        }}
      >
        <ul
          style={{
            display: "flex",
          }}
        >
          {catList.map((cat, i) => (
            <li
              id={i.toString()}
              key={cat.id}
              ref={index === i ? selectedRef : null}
              style={{
                padding: "10px",
                background: index === i ? "red" : "transparent",
              }}
            >
              {i}
              <img src={cat.imageUrl} alt={"Cat #" + cat.id} />
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
  let imageUrl = "";
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
