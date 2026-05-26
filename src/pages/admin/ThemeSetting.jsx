
// ThemeSetting.jsx
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utills/axiosInstance";
import GradientPicker from "../../components/GradientPicker";
import {
  hexToRgb,
  applyOpacityToGradient,
  applyRoleThemeVars,
} from "../../components/ThemeFunctions";
import LogoSelector from "../../components/LogoSelector";
import Select from "../../components/AmissionFormComponents/customField/Select";
import { ROLE_IDS, ROLE_LABELS, ROLE_OPTIONS, SCHOOL_DEFAULT } from "../../context/themeRoles";
import { ROLE_PAGES } from "../../context/generatePages";
import { useGetPageThemeByRole } from "../../services/themeSetting.services";
import { useNotification } from "../../context/NotificationContext";


export default function ThemeSetting() { 
  const [openIndex, setOpenIndex] = useState(0);
  const { showNotification } = useNotification();

  const toggleAccordion = (index) =>
    setOpenIndex(openIndex === index ? null : index);

  const ToggleDefault = ({ active, onClick }) => (
    <div
      className={`defaultbtn ${active ? "on" : "off"}`}
      onClick={onClick}
    >
      <div className="toggle-circle">
        {active ? "✓" : "✕"}
      </div>
    </div>
  );

 console.log("schoolName",SCHOOL_DEFAULT.NAME)
 const createDefaultTheme = (roleId, pageName) => ({
    roleId,
    pageName,
    schoolName:localStorage.getItem("schoolName") ||SCHOOL_DEFAULT.NAME,
    schoolId: localStorage.getItem("schoolId") || SCHOOL_DEFAULT.ID,
    designType: ROLE_LABELS[roleId] || "Admin",
    bodyBgColor: "",
  bodyBgOpacity: 1,
  bodyGradient: "",
  bodyImage: "",
  bodyHeading1: "",
  bodyHeading2: "",
  bodyHeading3: "",
  bodyHeading4: "",
  bodyHeading5: "",
  bodyText: "",

  sidebarBg: "",
  sidebarBgOpacity: 1,
  sidebarGradientBg: "",
  sidebarImage: "",
  menuText: "",
  menuTextActive: "",
  menuActiveBg: "",
  menuHoverText: "",
  menuHoverBg: "",

  headerBgColor: "",
  headerBgOpacity: 1,
  headerGradient: "",
  headerImage: "",
  headerTextColor: "",

  contentBg: "",
  contentBgOpacity: 1,
  contentGradientBg: "",
  contentImage: "",
  contentText: "",
  contentTextActive: "",
  contentActiveBg: "",
  contentHoverText: "",
  contentHoverBg: "",
  contentButton: "",
  contentButton2: "",
  contentButton3: "",
  contentButtonText: "",
  contentButtonText2: "",
  contentButtonText3: "",

  loginBgColor: "",
  loginBgOpacity: 1,
  loginGradientBg: "",
  loginImage: "",
  loginText: "",
  loginButtonBg: "",
  loginButtonText: "",
  loginInputBg: "",
  loginInputBorder: "",
  });








  const [theme, setTheme] = useState(() =>
    createDefaultTheme(ROLE_IDS.ADMIN, "dashboard")
  );
  const {
    data: pageResponse,
    isLoading,

    isSuccess,
  } = useGetPageThemeByRole(theme.roleId, theme.pageName);
  const pageTheme = pageResponse?.data;
  const pageThemeStatusCode = pageResponse?.status;
  // console.log("Theme pageTheme:", pageTheme);
  const roleOptions = ROLE_OPTIONS;
  const pageOptions = ROLE_PAGES[theme.roleId] || [];
  const themeRole = ROLE_LABELS[theme.roleId] || "Admin";
  useEffect(() => {
    if (!isSuccess) return;
    const schoolId =
      localStorage.getItem("schoolId") || SCHOOL_DEFAULT.ID;
      const schoolName = SCHOOL_DEFAULT.NAME;

    const { id, ...restTheme } = pageTheme || {};

    const finalTheme = {
      ...createDefaultTheme(theme.roleId, theme.pageName), // reset everything
      ...restTheme,      // override if API provides
      schoolId,
      schoolName

    };

    setTheme(finalTheme);

    // if (finalTheme.roleId === ROLE_IDS.ADMIN) {
    applyRoleThemeVars(finalTheme);
    // }

  }, [pageTheme,isSuccess]);



  /* ================= SAVE ================= */

  const saveTheme = () => {
    axiosInstance
      .put("/api/theme", theme)
      .then((res) => {
        // if (theme.roleId === ROLE_IDS.ADMIN) {
          applyRoleThemeVars(res.data);
        // }
        // alert("Theme saved successfully!");
        showNotification({
        message:
          "Theme saved successfully!",
        type: "success",
        duration: 2000,
      });
      })
      .catch(() => alert("Failed to save theme"));
  };

  

  const handleChange = (key, value) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };


  const deactivate = (fields) => {
    const updated = { ...theme }; fields.forEach((f) => (updated[f] = "")); setTheme(updated);
  };

  const renderColor = (label, key, gradientKey) => {
    const disabled = theme[gradientKey] && theme[gradientKey] !== "";
    return (
      <div className={`colorb ${disabled ? "disabled" : ""}`}>
        <div className="colorpic">
          <input type="color" disabled={disabled} value={theme[key] || "#000000"} onChange={(e) => handleChange(key, e.target.value)} />
        </div>
        <div className="colorname">{label}</div>
      </div>
    );
  };
// console.log("theme",theme)
  const renderImage = (label, key) => (
    <div className="imageurl">
      <div className="colorname">{label}</div>
      <div className="imginput">
        <img src={theme[key] || "/images/default.jpg"} alt="" style={{ width: 28, height: 28, objectFit: "cover" }} />
        <input type="file" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onloadend = () => handleChange(key, reader.result); reader.readAsDataURL(file);
        }} />
      </div>
    </div>
  );

  const renderOpacity = (label, key) => (
    <div className="opacity">
      <label>{label}: {theme[key]}</label>
      <input type="range" min="0" max="1" step="0.05" value={theme[key] ?? 0} onChange={(e) => handleChange(key, Number(e.target.value))} />
    </div>
  );

  const BgPreview = ({ color, gradient, image, opacity }) => {
    const bg = gradient
      ? applyOpacityToGradient(gradient, opacity)
      : `rgba(${hexToRgb(color)}, ${opacity})`;
    const final = image ? `${bg}, url(${image})` : bg;

    return (
      <div className="gradient">
        <div>
          <div className="colorname">Preview:</div>
          <div style={{ width: 150, height: 30, borderRadius: 6, border: "1px solid #ccc", background: final, backgroundSize: "cover", }} />
        </div>
      </div>
    );
  };
 
  return (
    <div className="mainpro">
      <div className="container">
        <h2>Theme Settings</h2>
        <div className="flexbox"> 
          <div className="box"><LogoSelector onLogoChange={() => { }} /></div>
          <div>
            <ul>
              <li>
                <div className="mb-3">
                  <Select
                    label="Select Role"
                    name="roleId"
                    value={theme.roleId}
                    options={roleOptions}
                    onChange={(e) => {
                      const roleId = Number(e.target.value);
                      const firstPage =
                        ROLE_PAGES[roleId]?.[0]?.value || "";

                      setTheme(
                        createDefaultTheme(roleId, "dashBoard")
                      );
                    }}
                  />



                  {/* ================= PAGE DROPDOWN ================= */}
                  <Select
                    label="Select Page"
                    name="pageName"
                    value={theme.pageName}
                    options={pageOptions}
                    onChange={(e) => {
                      const pageName = e.target.value;

                      setTheme((prev) => ({
                        ...prev,
                        pageName,
                      }));


                    }}
                  />
 
                </div>




                <div className="colorbox">
                  <div className="acheading" onClick={() => toggleAccordion(0)}>
                    <h3>BODY</h3>
                  </div>

                  <div className={`accordian ${openIndex === 0 ? "show" : ""}`}>
                    <div className="backgroundsec">
                      {renderColor("Background", "bodyBgColor", "bodyGradient")}
                      {renderOpacity("Opacity", "bodyBgOpacity")}
                      <ToggleDefault active={Boolean(theme.bodyBgColor || theme.bodyGradient || theme.bodyImage)}
                        onClick={() => deactivate(["bodyBgColor", "bodyGradient", "bodyImage"])} />
                    </div>
                    <GradientPicker label="Gradient" value={theme.bodyGradient} onChange={(val) => { handleChange("bodyGradient", val); handleChange("bodyBgColor", ""); }} />
                    <BgPreview color={theme.bodyBgColor} gradient={theme.bodyGradient} image={theme.bodyImage} opacity={theme.bodyBgOpacity} />
                    <div className="backgroundsec">{renderImage("Image URL", "bodyImage")}</div>
                    <div className="cflex">
                      {renderColor("Text", "bodyText")}
                      {renderColor("H1", "bodyHeading1")}
                      {renderColor("H2", "bodyHeading2")}
                      {renderColor("H3", "bodyHeading3")}
                      {renderColor("H4", "bodyHeading4")}
                      {renderColor("H5", "bodyHeading5")}
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="colorbox">
                  <div className="acheading" onClick={() => toggleAccordion(1)}><h3>HEADER</h3></div>
                  <div className={`accordian ${openIndex === 1 ? "show" : ""}`}>
                    <div className="backgroundsec">
                      {renderColor("Background", "headerBgColor", "headerGradient")}
                      {renderOpacity("Opacity", "headerBgOpacity")}
                      <ToggleDefault active={Boolean(theme.headerBgColor || theme.headerGradient || theme.headerImage)}
                        onClick={() => deactivate(["headerBgColor", "headerGradient", "headerImage"])} />
                    </div>

                    <GradientPicker label="Gradient" value={theme.headerGradient} onChange={(val) => { handleChange("headerGradient", val); handleChange("headerBgColor", ""); }} />
                    <BgPreview color={theme.headerBgColor} gradient={theme.headerGradient} image={theme.headerImage} opacity={theme.headerBgOpacity} />
                    <div className="backgroundsec">{renderImage("Header Image", "headerImage")}</div>
                    <div className="cflex">{renderColor("Header Text", "headerTextColor")}</div>
                  </div>
                </div>
              </li>
              <li>
                <div className="colorbox">
                  <div className="acheading" onClick={() => toggleAccordion(2)}><h3>SIDEBAR</h3></div>
                  <div className={`accordian ${openIndex === 2 ? "show" : ""}`}>
                    <div className="backgroundsec">
                      {renderColor("Background", "sidebarBg", "sidebarGradientBg")}
                      {renderOpacity("Opacity", "sidebarBgOpacity")}
                      <ToggleDefault active={Boolean(theme.sidebarBg || theme.sidebarGradientBg || theme.sidebarImage)}
                        onClick={() => deactivate(["sidebarBg", "sidebarGradientBg", "sidebarImage"])} />
                    </div>
                    <GradientPicker label="Gradient" value={theme.sidebarGradientBg} onChange={(val) => { handleChange("sidebarGradientBg", val); handleChange("sidebarBg", ""); }} />
                    <BgPreview color={theme.sidebarBg} gradient={theme.sidebarGradientBg} image={theme.sidebarImage} opacity={theme.sidebarBgOpacity} />
                    <div className="backgroundsec">{renderImage("Image URL", "sidebarImage")}</div>
                    <div className="cflex">
                      {renderColor("Menu Text", "menuText")}
                      {renderColor("Active Text", "menuTextActive")}
                      {renderColor("Active BG", "menuActiveBg")}
                      {renderColor("Hover Text", "menuHoverText")}
                      {renderColor("Hover BG", "menuHoverBg")}
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="colorbox">
                  <div className="acheading" onClick={() => toggleAccordion(3)}><h3>CONTENT</h3></div>
                  <div className={`accordian ${openIndex === 3 ? "show" : ""}`}>
                    <div className="backgroundsec">
                      {renderColor("Background", "contentBg", "contentGradientBg")}
                      {renderOpacity("Opacity", "contentBgOpacity")}
                      <ToggleDefault active={Boolean(theme.contentBg || theme.contentGradientBg || theme.contentImage)}
                        onClick={() => deactivate(["contentBg", "contentGradientBg", "contentImage"])} />
                    </div>
                    <GradientPicker label="Gradient" value={theme.contentGradientBg} onChange={(val) => { handleChange("contentGradientBg", val); handleChange("contentBg", ""); }} />
                    <BgPreview color={theme.contentBg} gradient={theme.contentGradientBg} image={theme.contentImage} opacity={theme.contentBgOpacity} />
                    <div className="backgroundsec">{renderImage("Image URL", "contentImage")}</div>
                    <div className=" cflex">
                    {renderColor("Button 1", "contentButton")}
                      {renderColor("Button Text 1", "contentButtonText")}
                      {renderColor("Button 2", "contentButton2")}
                      {renderColor("Button Text 2", "contentButtonText2")}
                  {renderColor("Button 3", "contentButton3")}

                      {renderColor("Button Text 3", "contentButtonText3")}
                    
                      {renderColor("Text", "contentText")}
                      {renderColor("Active Text", "contentTextActive")}
                      {renderColor("Active BG", "contentActiveBg")}
                      {renderColor("Hover Text", "contentHoverText")}
                      {renderColor("Hover BG", "contentHoverBg")}
                      
                    </div>
                  </div>
                </div>
              </li>
              {themeRole === "ADMIN" && theme?.pageName === "dashboard" && <li>
                <div className="colorbox">
                  <div className="acheading" onClick={() => toggleAccordion(4)}><h3>LOGIN</h3></div>
                  <div className={`accordian ${openIndex === 4 ? "show" : ""}`}>
                    <div className="backgroundsec">
                      {renderColor("Background", "loginBgColor", "loginGradientBg")}
                      {renderOpacity("Opacity", "loginBgOpacity")}
                      <ToggleDefault active={Boolean(theme.loginBgColor || theme.loginGradientBg || theme.loginImage)}
                        onClick={() => deactivate(["loginBgColor", "loginGradientBg", "loginImage"])} />
                    </div>
                    <GradientPicker label="Gradient" value={theme.loginGradientBg} onChange={(val) => { handleChange("loginGradientBg", val); handleChange("loginBgColor", ""); }} />
                    <BgPreview color={theme.loginBgColor} gradient={theme.loginGradientBg} image={theme.loginImage} opacity={theme.loginBgOpacity} />
                    <div className="backgroundsec">{renderImage("Image URL", "loginImage")}</div>
                    <div className="cflex">
                      {renderColor("Text", "loginText")}
                      {renderColor("Button BG", "loginButtonBg")}
                      {renderColor("Button Text", "loginButtonText")}
                      {renderColor("Input BG", "loginInputBg")}
                      {renderColor("Input Border", "loginInputBorder")}
                    </div>
                  </div>
                </div>
              </li>}
            </ul>
            <button className="btnsave btn" onClick={saveTheme}>Save Theme Color</button>
          </div>
        </div>
      </div>
    </div>
  );
}
