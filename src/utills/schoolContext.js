// src/utils/schoolContext.js
import { SCHOOL_DEFAULT, SCHOOL_KEYS } from "../context/themeRoles";

export const getSchoolContext = () => ({
  schoolId:
    localStorage.getItem(SCHOOL_KEYS.ID) || SCHOOL_DEFAULT.ID,
  schoolName:
    localStorage.getItem(SCHOOL_KEYS.NAME) || SCHOOL_DEFAULT.NAME,
});
