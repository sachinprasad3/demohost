// LogoUpload.jsx
import React, { useState } from "react";
import { API_URL } from "../config";
import { SCHOOL_DEFAULT, SCHOOL_KEYS } from "../context/themeRoles"; 
import { getSchoolContext } from "../utills/schoolContext";


export default function LogoUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  // ✅ DYNAMIC SCHOOL INFO

const { schoolId, schoolName } = getSchoolContext();
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("schoolId", schoolId);
    formData.append("schoolName", schoolName);

    try {
      const res = await fetch(`${API_URL}/api/logo/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      await res.json();

      setMessage("Logo uploaded successfully!");
      setFile(null);
      setPreview("");

      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error(error);
      setMessage("Error uploading logo");
    }
  };

  return (
    <form onSubmit={handleUpload}>
      {message && <div className="alert alert-info mt-2">{message}</div>}

      <div className="mb-3">
        <h4>Upload Logo Image</h4>
        <div className="uploadlogo">
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button className="btn btnsave" type="submit">
            Upload
          </button>
        </div>
      </div>

      {preview && (
        <div className="mb-3">
          <label className="form-label">Preview:</label>
          <img
            src={preview}
            alt="preview"
            style={{ maxHeight: "70px" }}
          />
        </div>
      )}
    </form>
  );
}
