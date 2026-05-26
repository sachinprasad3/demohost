// context/LogoContext.jsx
import { createContext, useState, useEffect } from "react";
import { API_URL } from "../config";
import axiosInstance from "../utills/axiosInstance";

export const LogoContext = createContext();
export function LogoProvider({ children }) {
  const savedLogo = localStorage.getItem("selectedLogo") || "active";
  const [selectedLogo, setSelectedLogo] = useState(savedLogo);
  const [logoUrl, setLogoUrl] = useState("/images/default-logo.png");
  useEffect(() => {
    localStorage.setItem("selectedLogo", selectedLogo);
  }, [selectedLogo]);
const STATIC_LOGO_URL = "/images/logo1.png";  
  const loadLogo = async () => {
    try {
      if (selectedLogo === "active") {
        const res = await axiosInstance.get("/api/logo/active-one");
        if (res.status === 200 && res.data) {
          setLogoUrl(`${API_URL}/api/logo/active/image`);
        } else {
          setLogoUrl("/images/default-logo.png");
        }
        return;
      }
 
      if (!isNaN(selectedLogo)) {
        setLogoUrl(`${API_URL}/api/logo/image/${selectedLogo}`);
        return;
      }

      setLogoUrl("/images/default-logo.png");
    } catch (err) {
      console.error("Error loading logo:", err);
      setLogoUrl("/images/default-logo.png");
    }
  };

  useEffect(() => {
    loadLogo();
  }, [selectedLogo]);

  return (
 

<LogoContext.Provider
  value={{
    selectedLogo: null, 
    setSelectedLogo: () => {}, 
    // logoUrl: STATIC_LOGO_URL,
    logoUrl 
  }}
>
  {children}
</LogoContext.Provider>
  );
}
