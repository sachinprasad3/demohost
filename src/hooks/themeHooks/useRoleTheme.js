// import { useState, useCallback } from "react";
// import axiosInstance from "../../utills/axiosInstance";
// import { getRoleIdByLabel} from "../../context/themeRoles";
// const useRoleTheme = (applyTheme) => {
//   const [roleTheme, setRoleTheme] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const fetchRoleTheme = useCallback(
//     async (role) => {
//       console.log("role",role)
//       try {
//         setLoading(true);
//         setError(null);
//         const finalId = getRoleIdByLabel(role);
//         const res = await axiosInstance.get(`/api/theme/${finalId}`);
//         const data = res?.data; 
//         setRoleTheme((prev) => ({...prev, ...data,   }));
//         if (applyTheme) { applyTheme(data) }
//         return data
//       } catch (err) {
//         console.error("error in fetching RoleTheme", err);
//         setError(err);
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   return {roleTheme, loading, error, fetchRoleTheme, };
// };

// export default useRoleTheme;


import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getRoleIdByLabel } from "../../context/themeRoles";
import { applyRoleThemeVars, loadPublicTheme } from "../../components/ThemeFunctions";
import { useAuth } from "../../context/AuthContext";
import {
  useGetDashboardThemeByRole,
  useGetPageThemeByRole,
} from "../../services/themeSetting.services";

const DASHBOARD_ROUTE = "dashboard";

export default function useRoleTheme() {
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.role?.toLowerCase();
  const roleId = userRole ? getRoleIdByLabel(userRole) : null;

  // ? Resolve pageName
  const parts = location.pathname.split("/");
  const roleIndex = userRole ? parts.indexOf(userRole) : -1;

  const pageName =
    roleIndex !== -1
      ? parts.slice(roleIndex + 1).join("/") || DASHBOARD_ROUTE
      : DASHBOARD_ROUTE;

  // ? Queries (always run, React Query handles enabled)
  const { data: pageTheme, isSuccess: pageSuccess } =
    useGetPageThemeByRole(roleId, pageName);

  const { data: dashboardTheme } =
    useGetDashboardThemeByRole(roleId);

  // ? Public theme
  useEffect(() => {
  if (!user && pageName) {
    loadPublicTheme(pageName);
  }
}, [user, pageName]);

  // ? Theme resolution
  useEffect(() => {
    if (!pageSuccess) return;

    if (pageTheme) {
      applyRoleThemeVars(pageTheme);
    } else if (dashboardTheme) {
      applyRoleThemeVars(dashboardTheme);
    }
  }, [pageTheme, dashboardTheme, pageSuccess]);

  return { roleId, pageName };
}
