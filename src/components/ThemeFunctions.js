// ThemeFunctions.js
import React, { useEffect } from "react";
import axiosInstance from "../utills/axiosInstance";
import { ROLE_IDS, SCHOOL_DEFAULT, SCHOOL_KEYS } from "../context/themeRoles";
export const hexToRgb = (hex) => {
  if (!hex) return "255,255,255";
  const clean = hex.replace("#", "").trim(); 
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const r = parseInt(full.substring(0, 2), 16) || 255;
  const g = parseInt(full.substring(2, 4), 16) || 255;
  const b = parseInt(full.substring(4, 6), 16) || 255;
  return `${r},${g},${b}`;
};

export const applyOpacityToGradient = (gradient, opacity) => {
  if (!gradient || !gradient.includes("linear-gradient")) return gradient;
  const start = gradient.indexOf("(");
  const end = gradient.lastIndexOf(")");
  if (start === -1 || end === -1) return gradient;

  const inside = gradient.substring(start + 1, end).trim(); 
  const parts = inside.split(",").map((p) => p.trim());
  const angle = parts[0];
  const colorStops = parts.slice(1);

  const fadedStops = colorStops.map((c) => { 
    const [colorPart, ...posParts] = c.split(/\s+(?=[0-9.%])/); 
    const position = posParts.join(" ");

    if (colorPart.startsWith("#")) {
      return `rgba(${hexToRgb(colorPart)}, ${opacity})${position ? " " + position : ""}`;
    }
    if (/^rgba?\(/i.test(colorPart)) { 
      const rgbaMatch = colorPart.match(/rgba?\(([^)]+)\)/i);
      if (!rgbaMatch) return c;
      const channels = rgbaMatch[1].split(",").map((s) => s.trim()); 
      const [r, g, b] = channels;
      return `rgba(${r},${g},${b},${opacity})${position ? " " + position : ""}`;
    }
 
    return c;
  });

  return `linear-gradient(${angle}, ${fadedStops.join(", ")})`;
};

const buildFinalBg = (color, opacity, gradient, image) => { 
  const imgPart = image ? ` url("${image}")` : "";

  if (gradient) {
    const faded = applyOpacityToGradient(gradient, opacity ?? 1); 
    return image ? `${faded}, url("${image}")` : faded;
  }

  // fallback to color
  const colorPart = `rgba(${hexToRgb(color)}, ${opacity ?? 1})`;
  return image ? `${colorPart}${imgPart}` : colorPart;
};

const ensureStyleTag = () => {
  let tag = document.getElementById("theme-vars");
  if (!tag) {
    tag = document.createElement("style");
    tag.id = "theme-vars";
    document.head.appendChild(tag);
  }
  return tag;
};

const writeVarsToStyleTag = (varsMap) => {
  const tag = ensureStyleTag();
  let css = ":root {";
  Object.keys(varsMap).forEach((k) => {
    css += `--${k}: ${varsMap[k]};`;
  });
  css += "}";
  tag.textContent = css;
};
 

export const applyRoleThemeVars = (t) => {
  if (!t || typeof t !== "object") return;

const roleThemeVars = { 
  "login-bg-final": buildFinalBg(t.loginBgColor, t.loginBgOpacity, t.loginGradientBg, t.loginImage),
  "login-text": t.loginText || "",
  "login-button-bg": t.loginButtonBg || "",
  "login-button-text": t.loginButtonText || "",
  "login-input-bg": t.loginInputBg || "",
  "login-input-border": t.loginInputBorder || "",

  "body-bg-final": buildFinalBg(t.bodyBgColor, t.bodyBgOpacity, t.bodyGradient, t.bodyImage),
  "sidebar-bg-final": buildFinalBg(t.sidebarBg, t.sidebarBgOpacity, t.sidebarGradientBg, t.sidebarImage),
  "header-bg-final": buildFinalBg(t.headerBgColor, t.headerBgOpacity, t.headerGradient, t.headerImage),
  "content-bg-final": buildFinalBg(t.contentBg, t.contentBgOpacity, t.contentGradientBg, t.contentImage),

    "body-text": t.bodyText || "",
    "body-heading1": t.bodyHeading1 || "",
    "body-heading2": t.bodyHeading2 || "",
    "body-heading3": t.bodyHeading3 || "",
    "body-heading4": t.bodyHeading4 || "",
    "body-heading5": t.bodyHeading5 || "",

  "menu-text": t.menuText || "",
  "menu-text-active": t.menuTextActive || "",
  "menu-active-bg": t.menuActiveBg || "",
  "menu-hover-text": t.menuHoverText || "",
  "menu-hover-bg": t.menuHoverBg || "",

  "header-text-color": t.headerTextColor || "",

  "content-text": t.contentText || "",
  "content-text-active": t.contentTextActive || "",
  "content-active-bg": t.contentActiveBg || "",
  "content-hover-text": t.contentHoverText || "",
  "content-hover-bg": t.contentHoverBg || "",
  "content-button": t.contentButton || "",
  "content-button2": t.contentButton2 || "",
  "content-button3": t.contentButton3 || "",
  "content-button-text": t.contentButtonText || "",
    "content-button-text2": t.contentButtonText2 || "",
    "content-button-text3": t.contentButtonText3 || "",
};

  writeVarsToStyleTag(roleThemeVars);

}

const activeThemeSection = (theme) => {
  return {
    body: Boolean(theme.bodyBgColor || theme.bodyGradient || theme.bodyImage),
    header: Boolean(theme.headerBgColor || theme.headerGradient || theme.headerImage),
    sidebar: Boolean(theme.sidebarBg || theme.sidebarGradientBg || theme.sidebarImage),
    content: Boolean(theme.contentBg || theme.contentGradientBg || theme.contentImage),
  };
};

const pickSection = (theme, section) => {
  const map = {
    body: [
      "bodyBgColor",
      "bodyBgOpacity",
      "bodyGradient",
      "bodyImage",
      "bodyText",
      "bodyHeading1",
      "bodyHeading2",
      "bodyHeading3",
      "bodyHeading4",
      "bodyHeading5",
    ],
    sidebar: [
      "sidebarBg",
      "sidebarBgOpacity",
      "sidebarGradientBg",
      "sidebarImage",
      "menuText",
      "menuTextActive",
      "menuActiveBg",
      "menuHoverText",
      "menuHoverBg",
    ],
    header: [
      "headerBgColor",
      "headerBgOpacity",
      "headerGradient",
      "headerImage",
      "headerTextColor",
    ],
    content: [
      "contentBg",
      "contentBgOpacity",
      "contentGradientBg",
      "contentImage",
      "contentText",
      "contentTextActive",
      "contentActiveBg",
      "contentHoverText",
      "contentHoverBg",
      "contentButton",
      "contentButton2",
      "contentButton3",
      "contentButtonText",
      "contentButtonText2",
      "contentButtonText3",
    ],
  };

  return map[section].reduce((acc, key) => {
    acc[key] = theme[key];
    return acc;
  }, {});
};
export const resolveTheme = (pageTheme, dashboardTheme) => {
  if (!dashboardTheme) return pageTheme;

  const active = activeThemeSection(pageTheme);

  return {
    ...dashboardTheme,   // fallback base
    ...pageTheme,        // override with page
    ...(active.body ? {} : pickSection(dashboardTheme, "body")),
    ...(active.header ? {} : pickSection(dashboardTheme, "header")),
    ...(active.sidebar ? {} : pickSection(dashboardTheme, "sidebar")),
    ...(active.content ? {} : pickSection(dashboardTheme, "content")),
  };
};
export const applyPublicTheme = (t) => {
  if (!t || typeof t !== "object") return;

  applyRoleThemeVars(t);


}



export const loadPublicTheme = async () => {
  try {
    const schoolId =
      localStorage.getItem(SCHOOL_KEYS?.ID) ||
      SCHOOL_DEFAULT?.ID;
    // ?? For public login ? use ADMIN role + login page
    const res = await axiosInstance.get(`/api/theme/page`, {
      params: {
        schoolId,
        roleId: ROLE_IDS.ADMIN,
        pageName: "dashboard",
      },
    });

    const theme = res?.data;
// console.log("theme Id", theme)

    if (theme) {
      applyPublicTheme(theme);
    }
  } catch (error) {
    console.error("Failed to load public theme:", error);
  }
};
