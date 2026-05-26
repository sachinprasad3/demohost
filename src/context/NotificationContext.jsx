

// NotificationContext.js
import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notif, setNotif] = useState({
    visible: false,
    message: "",
    type: "info", // success, danger, warning, info
    duration: 3000,
  });

  const showNotification = useCallback(
    ({ message, type = "info", duration = 3000 }) => {
      setNotif({ visible: true, message, type, duration });

      setTimeout(() => {
        setNotif((n) => ({ ...n, visible: false }));
      }, duration);
    },
    []
  );

  // Bootstrap variant mapping
  const variantClass = {
    success: "alert alert-success d-flex align-items-center shadow-sm fade show",
    error: "alert alert-danger d-flex align-items-center shadow-sm fade show",
    warning: "alert alert-warning d-flex align-items-center shadow-sm fade show",
    info: "alert alert-info d-flex align-items-center shadow-sm fade show",
  };

  // Bootstrap icons
  const variantIcon = {
    success: <i className="bi bi-check-circle-fill me-2 fs-5"></i>,
    error: <i className="bi bi-x-circle-fill me-2 fs-5"></i>,
    warning: <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>,
    info: <i className="bi bi-info-circle-fill me-2 fs-5"></i>,
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      {notif.visible && (
  <div
    className={`${variantClass[notif.type]} slide-down-animation`}
    style={{
      position: "fixed",
      top: "4rem",
      left: "50%",
      transform: "translateX(-50%)",
      maxWidth: "90%",
      zIndex: 1,
    }}
    role="alert"
  >
    {variantIcon[notif.type]}
    <div className="flex-grow-1">{notif?.message}</div>

    <button
      type="button"
      className="btn-close ms-3"
      onClick={() => setNotif((n) => ({ ...n, visible: false }))}
    ></button>
  </div>
)}

    </NotificationContext.Provider>
  );
};
