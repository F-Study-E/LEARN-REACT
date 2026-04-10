import { useState, type ChangeEvent } from "react";
import Modal from "./Modal";

// 버전 1. 확인 다이얼로그 — Header + Body + Footer
export function DeleteConfirmModal() {
  return (
    <Modal>
      <Modal.Trigger>
        <Modal.Button variant="danger">계정 삭제</Modal.Button>
      </Modal.Trigger>

      <Modal.Overlay>
        <Modal.Content>
          <Modal.Header>계정을 삭제하시겠어요?</Modal.Header>
          <Modal.Body>
            삭제된 계정은 복구할 수 없습니다. 작성한 게시글과 댓글이 모두
            사라집니다.
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button variant="ghost" close>
              취소
            </Modal.Button>
            <Modal.Button
              variant="danger"
              close
              onClick={() => console.log("삭제!")}
            >
              삭제
            </Modal.Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Overlay>
    </Modal>
  );
}

// 버전 2. 폼 모달 — Header + Body(폼) + Footer 없이 폼 안에 버튼
export function InviteModal() {
  const [form, setForm] = useState({ name: "", email: "" });

  const handleChange =
    (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = () => {
    console.log("초대:", form);
  };

  return (
    <Modal>
      <Modal.Trigger>
        <Modal.Button variant="primary">팀원 초대</Modal.Button>
      </Modal.Trigger>

      <Modal.Overlay>
        <Modal.Content>
          <Modal.Header>팀원 초대</Modal.Header>
          <Modal.Body>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Modal.Input
                label="이름"
                placeholder="홍길동"
                value={form.name}
                onChange={handleChange("name")}
              />
              <Modal.Input
                label="이메일"
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange("email")}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button variant="ghost" close>
              취소
            </Modal.Button>
            <Modal.Button variant="primary" close onClick={handleSubmit}>
              초대 보내기
            </Modal.Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Overlay>
    </Modal>
  );
}
