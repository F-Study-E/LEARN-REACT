import VideoPlayer from "./challenge1";
import Page from "./challenge2";
import CatFriends from "./challenge3";
import Page2 from "./challenge4";

export default function Jim() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      <VideoPlayer />
      <hr />
      <Page />
      <hr />
      <CatFriends />
      <hr />
      <Page2 />
    </div>
  );
}
