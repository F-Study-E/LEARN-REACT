import { createContext, useContext } from "react";

type ModalContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined,
);

export function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Modal 컴포넌트 안에서만 사용 가능합니다");
  return ctx;
}
