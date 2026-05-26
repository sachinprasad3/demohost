import { ADMIN_ROUTES } from "../Routes/AdminRouteConfig";
import { STUDENT_ROUTES } from "../Routes/StudentRoutesConfig";
import { TEACHER_ROUTES } from "../Routes/TeacherRoutesConfig";
import { ROLE_IDS } from "./themeRoles";

const generatePages = (routes) =>
  routes
    .filter((r) => !r.hideInTheme)
    .sort((a, b) => a.label.localeCompare(b.label)) // 🔹 Sort by label (A → Z)
    .map((r) => ({
      label: r.label,
      value: r.path.replace(/^\//, ""),
    }));

    const generatePagesForAdmin = (routes) =>
  routes
    .filter((r) => !r.hideInTheme && !r?.allowedRoles?.includes("OWNER"))
    .sort((a, b) => a.label.localeCompare(b.label)) // 🔹 Sort by label (A → Z)
    .map((r) => ({
      label: r.label,
      value: r.path.replace(/^\//, ""),
    }));

export const ROLE_PAGES = { 
   [ROLE_IDS.OWNER]: generatePages(ADMIN_ROUTES),
    [ROLE_IDS.ADMIN]: generatePagesForAdmin(ADMIN_ROUTES),
  [ROLE_IDS.TEACHER]: generatePages(TEACHER_ROUTES),
   [ROLE_IDS.PARENT]: generatePages(STUDENT_ROUTES),
   
};
