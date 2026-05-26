// Accordion.jsx
import React, { useState } from "react"; 
export default function Accordion({ title, subhead, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
 
  return (
    <div className="acc-section"> 
        <div className="acc-header" onClick={() => setOpen(!open)}>
            {title && <h3>{title}</h3>}
            {subhead && <span className="status-badge">{subhead}</span>}
            <span className="acc-icon">
    {open ? (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )}
  </span>
        </div>
        {open && <div className="acc-body">{children}</div>}
    </div>
  );
}
