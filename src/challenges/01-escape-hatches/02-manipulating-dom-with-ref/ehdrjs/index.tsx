import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/github.css";
import VideoPlayer from "./challenge1";
import Page from "./challenge2";
import CatFriends from "./challenge3";
import Page2 from "./challenge4";

export default function Ehdrjs() {
  return (
    <div>
      <h4>challenge1</h4>
      <VideoPlayer />
      <h4>challenge2</h4>
      <Page />
      <h4>challenge3</h4>
      <CatFriends />
      <h4>challenge4</h4>
      <Page2 />
    </div >
  );
}