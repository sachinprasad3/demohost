
// Popup.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Popup({ title, closeOnOutsideClick = true, children, onClose, onSave, onReset, resetText = "Reset", saveText = "Save", overlayClass = "", submitClass = "" }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  const popupRoot = document.getElementById("popup-root");
  if (!popupRoot) return null;
  return createPortal(
    <div className={`modalOverlay ${overlayClass}`} onClick={() => { if (closeOnOutsideClick) onClose(); }}>
      <div className="modalBox"
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <button className="closeBtn" onClick={onClose}>✖</button>
        {title && <h3>{title}</h3>}
        <div className="popupContent">
          {children}
        </div>
        <div className="popupActions">
          {onReset && (<button className="lightbtn resetBtn" onClick={onReset}>{resetText}</button>)}
          {onSave && (<button className={`saveBtn ${submitClass}`} onClick={onSave}>{saveText}</button>)}
        </div>
      </div>
    </div>,
    popupRoot
  );
}
