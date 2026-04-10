import MdRenderer from "@/components/MdRenderer";
import useContextMd from "./useContext.md?raw";
import { DeleteConfirmModal, InviteModal } from "./ModalExample";

export default function index() {
  return (
    <div>
      <div style={{ display: "flex", gap: "16px", padding: "40px" }}>
        <DeleteConfirmModal />
        <InviteModal />
      </div>
      <br />
      <MdRenderer markdown={useContextMd} title="useContext" />
    </div>
  );
}
