// ThemeSetting.jsx
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utills/axiosInstance";
import GradientPicker from "../../components/GradientPicker";
import {  hexToRgb, applyOpacityToGradient, applyRoleThemeVars } from "../../components/ThemeFunctions"; 
import Select from "../../components/AmissionFormComponents/customField/Select"; 
import { ROLE_IDS, ROLE_LABELS, ROLE_OPTIONS } from "../../context/themeRoles";

export default function ThemeSetting() {
  
const [openIndex, setOpenIndex] = useState(0);
const toggleAccordion = (index) => setOpenIndex(openIndex === index ? null : index);
const ToggleDefault = ({ active, onClick }) => (
  <div className={`defaultbtn ${active ? "on" : "off"}`} onClick={onClick}>
    <div className="toggle-circle">{active ? "✓" : "✕"}</div>
  </div> 
);


const [theme, setTheme] = useState({
  id: ROLE_IDS.ADMIN,
  designType: "Admin",
    bodyBgColor: "#ffffff",
    bodyBgOpacity: 1,
    bodyGradient: "",
    bodyImage: "",
    bodyText: "",
    bodyHeading1: "",
    bodyHeading2: "",
    bodyHeading3: "",
    bodyHeading4: "",
    bodyHeading5: "",

    sidebarBg: "#ffffff",
    sidebarBgOpacity: 1,
    sidebarGradientBg: "",
    sidebarImage: "",
    menuText: "#000000",
    menuTextActive: "#ffffff",
    menuActiveBg: "#2a5298",
    menuHoverText: "#2a5298",
    menuHoverBg: "#cfe2ff",

    headerBgColor: "#ffffff",
    headerBgOpacity: 1,
    headerGradient: "",
    headerImage: "",
    headerTextColor: "#ffffff",

    contentBg: "#ffffff",
    contentBgOpacity: 1,
    contentGradientBg: "",
    contentImage: "",
    contentText: "#000000",
    contentTextActive: "#ffffff",
    contentActiveBg: "#2a5298",
    contentHoverText: "#2a5298",
    contentHoverBg: "#cfe2ff",
    contentButton: "#cfe2ff",
    contentButton2: "#2a5298",
    contentButton3: "#000000",

    loginBgColor: "#09608f",
    loginBgOpacity: 1,
    loginGradientBg: "",
    loginImage: "",

    loginText: "#000000",
    loginButtonBg: "#378aca",
    loginButtonText: "#ffffff",
    loginInputBg: "#ffffff",
    loginInputBorder: "#cccccc",
  });
const roleOption = ROLE_OPTIONS;
const themeRole = ROLE_LABELS[theme.id] || "Admin";

const fetchRoleTheme = useCallback(async (id) => {
  try {
    const finalId = id || ROLE_IDS.ADMIN;
    const res = await axiosInstance.get(`/api/theme/id?id=${finalId}`);
    const data = res?.data;

    setTheme(prev => ({ ...prev, ...data }));

    if (finalId === ROLE_IDS.ADMIN) {
      applyRoleThemeVars(data);
       console.log("error in fetching RoleTheme", data);
    }
  } catch (error) {
    console.error("error in fetching RoleTheme", error);
  }
}, []);


    useEffect(() => {
    fetchRoleTheme() 
  }, [fetchRoleTheme]); 
const handleChange = (key, value) => {
  setTheme((prev) => ({ ...prev, [key]: value }));
};



const saveTheme = () => {
  axiosInstance.put("/api/theme", theme) .then((res) => {if(theme.id === ROLE_IDS.ADMIN) {applyRoleThemeVars(res.data);}
      alert("Theme saved!");
    })
    .catch(() => alert("Failed to save"));
};

const deactivate = (fields) => {
  const updated = { ...theme };  fields.forEach((f) => (updated[f] = "")); setTheme(updated);
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

  const renderImage = (label, key) => (
    <div className="imageurl">
      <div className="colorname">{label}</div>
      <div className="imginput">
        <img src={theme[key] || "/images/default.jpg"} alt="" style={{ width: 28, height: 28, objectFit: "cover" }} /> 
        <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => handleChange(key, reader.result); reader.readAsDataURL(file); }} />
      </div>
    </div>
  );

  const renderOpacity = (label, key) => (
    <div className="opacity">
      <label>{label}: {theme[key]}</label>
      <input type="range" min="0" max="1"  step="0.05"  value={theme[key] ?? 0}  onChange={(e) => handleChange(key, Number(e.target.value))}/> 
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
    <div className="flexbox">  
      <div>
        <ul> 
          <li>
            <div className="mb-3" onClick={(e)=> e.stopPropagation()}>
                <Select placeholder="Enter Role" name="id" value={theme.id} options={roleOption} onChange={(e) => {
                  const { name, value } = e.target;
                  const roleId = Number(value);
                  const roleLabel = ROLE_LABELS[roleId];

                  setTheme(prev => ({ ...prev, [name]: roleId, designType: roleLabel, }));
                  fetchRoleTheme(roleId);
                }} />
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
                <GradientPicker label="Gradient" value={theme.bodyGradient} onChange={(val) => { handleChange("bodyGradient", val); handleChange("bodyBgColor", "");}}/>
                <BgPreview color={theme.bodyBgColor} gradient={theme.bodyGradient} image={theme.bodyImage} opacity={theme.bodyBgOpacity} />
                <div className="backgroundsec">{renderImage("Image URL", "bodyImage")}</div>
                {/* <div className="cflex">
                  {renderColor("Text", "bodyText")}
                  {renderColor("H1", "bodyHeading1")}
                  {renderColor("H2", "bodyHeading2")}
                  {renderColor("H3", "bodyHeading3")}
                  {renderColor("H4", "bodyHeading4")}
                  {renderColor("H5", "bodyHeading5")}
                </div> */}
              </div>
            </div>
          </li>
           
        </ul>
        <button className="btnsave btn" onClick={saveTheme}>Save Theme Color</button>
      </div>
    </div>
  </div>
</div>
  );
}
