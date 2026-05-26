import { use, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { deleteCookie, getCookie, setCookie } from "../utills/cookies";
import { parseToken } from "../auth/authService";
import axiosInstance, { setAuthToken } from "../utills/axiosInstance";
// import useRoleTheme from "../hooks/themeHooks/useRoleTheme";
import { applyRoleThemeVars, loadPublicTheme } from "../components/ThemeFunctions";
export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [token, setToken] = useState(null);
const [loading, setLoading] = useState(true);
// const {fetchRoleTheme} = useRoleTheme(applyRoleThemeVars);

const isTokenExpired = (jwt) => {
  try {
    const decoded = parseToken(jwt);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

 
useEffect(() => {
  const hydrateAuth = () => {
    const savedToken = getCookie("authTokenWeb");
    const userDetailsCookie = getCookie("userDetails");

    // if (!savedToken || !userDetailsCookie) {
    //   loadPublicTheme()
    //   setLoading(false);
    //   return;
    // }

    if (isTokenExpired(savedToken)) {
      logout();
      setLoading(false);
      return;
    }
    
    setAuthToken(savedToken);
    setToken(savedToken);
    setUser(JSON.parse(userDetailsCookie));
    setLoading(false);
  };

  hydrateAuth();
}, []);

// useEffect(() => {
//     if(!user) return
//     fetchRoleTheme(user?.role)


//   }, [user,fetchRoleTheme]);
  
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token]);

  
  const login = async (payload) => {
    const { token: authToken, ...userData } = payload;
    // fetchRoleTheme(userData?.role)

    setUser(userData);
    setToken(authToken);
    setAuthToken(authToken);

    setCookie("authTokenWeb", authToken, 90);
    setCookie("userDetails", JSON.stringify(userData), 90);
  };

 
  const logout = () => {
  setUser(null);
  setToken(null);

  setAuthToken(null);

  deleteCookie("authTokenWeb");
  deleteCookie("userDetails");
  localStorage.clear();
  sessionStorage.clear();

  loadPublicTheme();

  if (window.Android) {
    console.log("User logged out");
    Android.postMessage("logout",null);
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token && !isTokenExpired(token),
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
