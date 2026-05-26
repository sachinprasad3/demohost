// Topbar.jsx
import React, { useContext } from "react";
import { Menu, LogOut } from "lucide-react";
import { API_URL } from "../config";
import { LogoContext } from "../context/LogoContext";
import { useAuth } from "../context/AuthContext";
export default function Topbar({  onMenuClick }) {
const { logoUrl } = useContext(LogoContext);
const{logout, user} = useAuth();
const student = user;
const displayName = user?.userName || student?.userName || "Guest";
const profileImage = student?.image || user?.image || "/images/defaultuser.jpg";
const imageSrc = profileImage.startsWith("/images/") || profileImage.startsWith("http") ? profileImage : `${API_URL.replace("/api", "")}/${profileImage}`;
  return (
    <header className="topbarbox">
      <div className="mobileicon">
        <button className="btn mobileshow" onClick={onMenuClick}><Menu size={22} /></button>
        <div className="mobilelogo mobileshow">
          <img src={logoUrl} alt="Logo" style={{ height: 40 }} onError={(e) => { e.target.onerror = null; e.target.src = "/images/default-logo.png";}} />
        </div> 
        <div className="desktopshow">
          {/* {displayName} */}
        </div>

        <button className="btn" onClick={logout}>
          <LogOut size={18} />{" "}
          <span className="d-sm-inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
