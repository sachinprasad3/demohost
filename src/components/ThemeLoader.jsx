// // src/components/ThemeLoader.jsx
// import { useEffect } from "react";
// import axiosInstance from "../utills/axiosInstance";
// import { applyPublicTheme, applyRoleThemeVars } from "./ThemeFunctions";
// import { ROLE_IDS } from "../context/themeRoles";

// export default function ThemeLoader() {
//   useEffect(() => {
//     let mounted = true;

//     const fetchTheme = async () => {
//       try {
//         const user = JSON.parse(localStorage.getItem("userDetails"));

//         // 🔹 If not logged in → public theme
//         const roleId = user?.roleId ?? ROLE_IDS.ADMIN;

//         const res = await axiosInstance.get(`/api/theme/id?id=${roleId}`);
//         const data = res?.data;
//         const theme = data?.theme ?? data?.data ?? data;

//         if (!mounted || !theme) return;

//         if (user) {
//           applyRoleThemeVars(theme);   // Admin / Teacher / Parent
//         } else {
//           applyPublicTheme(theme);     // Login / Public
//         }
//       } catch (error) {
//         console.error("Failed to load theme:", error);
//       }
//     };

//     fetchTheme();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   return null;
// }
