import React, { useContext } from "react";
import { LogoContext } from "../context/LogoContext";

const Unauthorized = () => {
  const { logoUrl } = useContext(LogoContext) || {};
  const pageStyle = {minHeight: "100vh",  display: "flex",  alignItems: "center",  justifyContent: "center",  background: "#f5f7fb",  padding: "16px", };
  const boxStyle = {width: "100%", maxWidth: 350, background: "#ffffff", borderRadius: 12, padding: 20, textAlign: "center", };
  const logoStyle = { maxWidth:200, marginBottom: 16, };
  const titleStyle = {fontSize: 22, marginBottom: 10, color: "#333", };
  const textStyle = {fontSize: 14,color: "#666", marginBottom: 20,};
  const linkStyle = {display: "inline-block", padding: "10px 20px", borderRadius: 6, background: "#09608f", color: "#fff", textDecoration: "none", fontSize: 14,};
  return (
    <div style={pageStyle}>
      <div style={boxStyle}>
        {logoUrl && <img src={logoUrl} alt="Logo" style={logoStyle} />}
        <h1 style={titleStyle}>Oops! Page Not Found.</h1>
        <p style={textStyle}>The page you are looking for does not exist or you don’t have access.</p>
        <a href="/" style={linkStyle}>Go Home</a>
      </div>
    </div>
  );
};

export default Unauthorized;
