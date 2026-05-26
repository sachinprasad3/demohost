// components/LogoSelector.jsx
import React, { useState, useEffect } from "react";
import { API_URL } from "../config";
import axiosInstance from "../utills/axiosInstance";
import LogoUpload from "./LogoUpload"; 
import { getSchoolContext } from "../utills/schoolContext";


export default function LogoSelector({ onLogoChange }) {
  const [logos, setLogos] = useState([]);
  const [selected, setSelected] = useState("");

  // ✅ single source of truth
  const { schoolId, schoolName } = getSchoolContext();

  // ✅ load logos on mount / school change
  useEffect(() => {
    if (schoolId && schoolName) {
      loadLogos();
    }
  }, [schoolId, schoolName]);

  // ✅ FETCH ALL LOGOS
  const loadLogos = async () => {
    try {
      const res = await axiosInstance.get("/api/logo/all", {
        params: { schoolId, schoolName },
      });

      console.log("LOGO API RESPONSE:", res.data);

      const data = res.data || [];
      setLogos(data);

      const activeLogo = data.find((l) => l.status === "active");
      if (activeLogo) {
        setSelected(String(activeLogo.id));
        onLogoChange?.(String(activeLogo.id));
      }
    } catch (err) {
      console.error("Error loading logos:", err);
    }
  };

  // ✅ SAVE ACTIVE LOGO
  const saveActiveLogo = async () => {
    if (!selected) {
      alert("Please select a logo first.");
      return;
    }

    try {
      await axiosInstance.put(
        `/api/logo/set-active/${selected}`,
        null,
        { params: { schoolId, schoolName } }
      );

      onLogoChange?.(String(selected));
      loadLogos();
      alert("Logo updated successfully!");
    } catch (error) {
      console.error("Error updating logo:", error);
      alert("Failed to update logo");
    }
    
  };

  // ✅ DELETE LOGO
  const deleteLogo = async (id, status) => {
    if (status === "active") {
      alert("You cannot delete the active logo.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this logo?")) return;

    try {
      await axiosInstance.delete(`/api/logo/delete/${id}`, {
        params: { schoolId, schoolName },
      });
      loadLogos();
    } catch (err) {
      console.error("Error deleting logo:", err);
      alert("Failed to delete logo");
    }
  };

  return (
    <>
      <LogoUpload onUploadSuccess={loadLogos} />

      <div className="logolist">
        <h5 className="mt-3">Select Logo</h5>

        <ul>
          {logos.map((logo) => (
            <li key={logo.id}>
              <label className="logo-toggle">
                <div className="showlogo">
                  <img
                    src={`${API_URL}/api/logo/image/${logo.id}?t=${Date.now()}`}
                    alt="logo"
                    style={{ maxWidth: "120px" }}
                  />
                </div>

                <input
                  type="radio"
                  name="activeLogo"
                  checked={selected === String(logo.id)}
                  onChange={() => setSelected(String(logo.id))}
                />

                <div className="defaultbtn">
                  <span className="toggle-circle">
                    {selected === String(logo.id) ? "✓" : "✕"}
                  </span>
                </div>
              </label>

              <button
                className="deletebtn"
                onClick={() => deleteLogo(logo.id, logo.status)}
              >
                ✖
              </button>
            </li>
          ))}
        </ul>

        <button className="btn btnsave" onClick={saveActiveLogo}>
          Save Logo
        </button>
      </div>
    </>
  );
}
