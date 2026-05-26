// ThemeSetting.jsx
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utills/axiosInstance";
import GradientPicker from "../../components/GradientPicker";
import { applyTheme, hexToRgb, applyOpacityToGradient } from "../../components/ThemeLoader";
import LogoSelector from "../../components/LogoSelector";
import Select from "../../components/AmissionFormComponents/customField/Select";

export default function ThemeSetting() {
  const [openIndex, setOpenIndex] = useState(0);
  const toggleAccordion = (index) => setOpenIndex(openIndex === index ? null : index);

  const ToggleDefault = ({ active, onClick }) => (
    <div className={`defaultbtn ${active ? "on" : "off"}`} onClick={onClick}>
      <div className="toggle-circle">{active ? "✓" : "✕"}</div>
    </div>
  );

  const [theme, setTheme] = useState({
    id:17,
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
const roleOption = [
  {label:"Admin",value:15},
  {label:"Teacher",value:17},
  {label:"Parent",value:16}
]
  
  
    

const fetchRoleTheme = useCallback(async (id) => {
  try {
    const finalId = id || 17;

    const res = await axiosInstance.get(`/api/theme/id?id=${finalId}`);
    const data = res?.data;
console.log("data from ",data)
    setTheme(prev => ({
      ...prev,   // keep id
      ...data    // overwrite theme fields
    }));

    // applyTheme(data);
  } catch (error) {
    console.error("error in fetching RoleTheme", error);
  }
}, [applyTheme]);



    useEffect(() => {
    fetchRoleTheme()
    // axiosInstance .get("/api/theme") .then((res) => { const data = res.data || {}; setTheme(data); applyTheme(data); })
  }, [fetchRoleTheme]);


// useEffect(() => {applyTheme(theme); }, [theme]);

const handleChange = (key, value) => {
  setTheme((prev) => ({ ...prev, [key]: value }));
};

const saveTheme = () => {
  console.log("theme from save",theme)
  axiosInstance .post("/api/theme", theme) .then((res) => {applyTheme(res.data);
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
    <h2>Theme Settings</h2> 
    <div className="flexbox"> 
      <div className="box">
        
<LogoSelector onLogoChange={() => {}} />
        {/* <LogoSelector onLogoChange={(id) => console.log("Active Logo Set:", id)} /> */}
          {/* <LogoSelector onLogoChange={(id) => console.log("Active Logo Set:", id)} /> */}
      </div>

      <div>
        <ul> 
          <li>
            <div class="mb-3" onClick={(e)=> e.stopPropagation()}>
                    <Select
  placeholder="Enter Role"
  name="id"
  value={theme.id || ""}
  options={roleOption}
  onChange={(e) => {
  const { name, value } = e.target;

  setTheme(prev => ({
    ...prev,
    [name]: value
  }));

  fetchRoleTheme(value);
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
                <GradientPicker label="Gradient" value={theme.bodyGradient} onChange={(val) => { handleChange("bodyGradient", val); handleChange("bodyBgColor", "");}}/>
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

                <GradientPicker label="Gradient" value={theme.headerGradient} onChange={(val) => {handleChange("headerGradient", val); handleChange("headerBgColor", "");}}/>
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
                    onClick={() => deactivate(["sidebarBg", "sidebarGradientBg", "sidebarImage"]) } />
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
                  onClick={() => deactivate(["contentBg", "contentGradientBg", "contentImage"]) } />
              </div>
              <GradientPicker label="Gradient" value={theme.contentGradientBg} onChange={(val) => {handleChange("contentGradientBg", val); handleChange("contentBg", ""); }}/>
                <BgPreview color={theme.contentBg} gradient={theme.contentGradientBg}  image={theme.contentImage} opacity={theme.contentBgOpacity} />
                <div className="backgroundsec">{renderImage("Image URL", "contentImage")}</div>
                <div className="cflex">
                  {renderColor("Text", "contentText")}
                  {renderColor("Active Text", "contentTextActive")}
                  {renderColor("Active BG", "contentActiveBg")}
                  {renderColor("Hover Text", "contentHoverText")}
                  {renderColor("Hover BG", "contentHoverBg")}
                  {renderColor("Button 1", "contentButton")}
                  {renderColor("Button 2", "contentButton2")}
                  {renderColor("Button 3", "contentButton3")}
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="colorbox">
              <div className="acheading" onClick={() => toggleAccordion(4)}><h3>LOGIN</h3></div>
              <div className={`accordian ${openIndex === 4 ? "show" : ""}`}>
                <div className="backgroundsec">
                  {renderColor("Background", "loginBgColor", "loginGradientBg")}
                  {renderOpacity("Opacity", "loginBgOpacity")}
                  <ToggleDefault active={Boolean(theme.loginBgColor || theme.loginGradientBg || theme.loginImage)}
                    onClick={() => deactivate(["loginBgColor", "loginGradientBg", "loginImage"]) } />
                </div>
                <GradientPicker label="Gradient" value={theme.loginGradientBg} onChange={(val) => {handleChange("loginGradientBg", val); handleChange("loginBgColor", "");}}/>
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
          </li>
        </ul>
        <button className="btnsave btn" onClick={saveTheme}>Save Theme Color</button>
      </div>
    </div>
  </div>
</div>
  );
}
