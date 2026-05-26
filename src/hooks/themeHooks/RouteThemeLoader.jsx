import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getRoleIdByLabel } from "../../context/themeRoles";
import { applyRoleThemeVars, loadPublicTheme, resolveTheme } from "../../components/ThemeFunctions";
import { useAuth } from "../../context/AuthContext";
import { useGetDashboardThemeByRole, useGetPageThemeByRole } from "../../services/themeSetting.services";


const DASHBOARD_ROUTE = "dashboard";

export default function RouteThemeLoader() {
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.role?.toLowerCase();
  const roleId = userRole ? getRoleIdByLabel(userRole) : null;

  const parts = location.pathname.split("/");
  const roleIndex = userRole ?userRole ==="parent"?parts.indexOf("student"): parts.indexOf(userRole) : -1;

  const pageName =
    roleIndex !== -1
      ? parts.slice(roleIndex + 1).join("/") || DASHBOARD_ROUTE
      : DASHBOARD_ROUTE;

  const {data: pageResponse,isSuccess:pageSuccess } = useGetPageThemeByRole(roleId, pageName);
 const {data: dashboardTheme,} = useGetDashboardThemeByRole(roleId);
 const pageTheme = pageResponse?.data;
const pageThemeStatusCode = pageResponse?.status;
// console.log("pageTheme",pageTheme)
 
  useEffect(() => {
  if (!user) {
    loadPublicTheme(location.pathname.replace(/^\//, ""));
  }
}, [user, location.pathname]);

 
//   useEffect(() => {
//   if (!pageSuccess) return;

//   if (pageThemeStatusCode === 200 && pageTheme) {
// console.log("pageThemeStatusCode === 200 && pageTheme",pageTheme)

//     applyRoleThemeVars(pageTheme);
//   } 
//   else if (pageThemeStatusCode === 204 && dashboardTheme) {
//     applyRoleThemeVars(dashboardTheme);
//   }else if(dashboardTheme){
//     applyRoleThemeVars(dashboardTheme);

//   }

// }, [pageThemeStatusCode, pageTheme, dashboardTheme, pageSuccess]);

useEffect(() => {
  if (!pageSuccess) return;

  if (pageThemeStatusCode === 200 && pageTheme) {
    const finalTheme = resolveTheme(pageTheme, dashboardTheme);
    // console.log("i am from here finalTheme else if",finalTheme)

    applyRoleThemeVars(finalTheme);
  } else if (dashboardTheme) {


    // console.log("i am from here dashboardTheme else if",dashboardTheme)
    applyRoleThemeVars(dashboardTheme);
  }

}, [pageThemeStatusCode, pageTheme, dashboardTheme, pageSuccess]);

return null;
}
