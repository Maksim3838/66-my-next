import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import css from "../Modal/Modal.module.css"

interface ModalProps {
   onClose: () => void;
  children: ReactNode;
}

export default function Modal({ onClose, children }: ModalProps) {
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

        return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

    return createPortal(
    <div className={css.backdrop}
      onClick={onClose}
          >
      <div className={css.modal}
        onClick={(e) => e.stopPropagation()}
              >
        {children}
      </div>
    </div>,
    document.body
  );
}


