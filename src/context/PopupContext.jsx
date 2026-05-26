
// popupContext.jsx
import { createContext, useContext, useState } from "react";

const PopupContext = createContext(null);

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [activeModal, setActiveModal] = useState(null);
const [modalData, setModalData] = useState(null);
  const openPopup = (modalId, data = null) =>{
     setActiveModal(modalId)
    setModalData(data);
    };
  const closePopup = () => {
    setActiveModal(null);
    setModalData(null);
  };

  return (
    <PopupContext.Provider
      value={{
        activeModal,
        modalData,
        openPopup,
        closePopup,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

