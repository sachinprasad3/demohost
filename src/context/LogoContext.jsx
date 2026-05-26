// LogoContext.jsx
import { createContext, useEffect, useState } from "react";
import { API_URL } from "../config";
import { getSchoolContext } from "../utills/schoolContext";
export const LogoContext = createContext();
export function LogoProvider({ children }) {
  const [logoUrl, setLogoUrl] = useState("");
  const { schoolId, schoolName } = getSchoolContext();
  useEffect(() => {
    if (!schoolId || !schoolName) return;
    setLogoUrl(
      `${API_URL}/api/logo/active/image?schoolId=${schoolId}&schoolName=${schoolName}`
    );
  }, [schoolId, schoolName]);
  const setLogoById = (logoId) => {
    if (!logoId) return;
    setLogoUrl(`${API_URL}/api/logo/image/${logoId}`);
  };

  return (
    <LogoContext.Provider value={{ logoUrl, setLogoById }}>
      {children}
    </LogoContext.Provider>
  ); 
}
