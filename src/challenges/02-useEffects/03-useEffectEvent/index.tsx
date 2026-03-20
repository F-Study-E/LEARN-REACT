import MdRenderer from "@/components/MdRenderer";
import useEffectEventMd from "./useEffectEvent.md?raw";
import SocketConnection from "./example";

export default function index() {
  return (
    <div>
      <SocketConnection url="ws://localhost:8080" isMuted={false} />
      <br />
      <MdRenderer markdown={useEffectEventMd} title="useEffectEvent" />
    </div>
  );
}
