import { Upload, Check } from "lucide-react";
import { useState } from "react";
import Popup from "../../Popup";

export default function FileUpload({
  name,
  label,
  required = false,
  file,              
  uploadStatus,      
  error,
  onChange,          
  accept = "image/*",
  className = ""
}) {
  const preview =
    file?.file instanceof File
      ? URL.createObjectURL(file.file)
      : file?.file;
const [showImagePopup, setShowImagePopup] = useState(false);


  return (
    <div className={`msf-upload mb-3 ${className}`}>
      <p className="msf-upload-label">
        {label} {required && <span className="text-danger">*</span>}
      </p>

      <label className={`msf-upload-box ${error ? "msf-upload-error" : ""}`}>
        <div className="msf-upload-icon">
          {!file?.file && <Upload size={20} color="#fff" />}
          {/* {file?.file && <img src={preview} alt="preview" />} */}
          {file?.file && (<img src={preview} alt="preview" className="msf-upload-thumb" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowImagePopup(true);}}/>)}


        </div>

        <div className="msf-upload-info">
          <div className="msf-upload-filename">
            {file?.name || "Choose image"}
          </div>

          {uploadStatus?.status === "uploading" && (
            <div className="msf-upload-status">
              Uploading {uploadStatus.progress}%
            </div>
          )}

          {uploadStatus?.status === "uploaded" && (
            <div className="msf-upload-success">Uploaded</div>
          )}

          {uploadStatus?.status === "uploading" && (
            <div className="msf-upload-progress">
              <div
                className="msf-upload-progress-bar"
                style={{ width: `${uploadStatus.progress}%` }}
              />
            </div>
          )}
        </div>

        {uploadStatus?.status === "uploaded" && (
          <div className="msf-upload-check">
            <Check size={20} color="#4f7cff" />
          </div>
        )}

        <input
          type="file"
          hidden
          accept={accept}
          onChange={(e) => onChange(e)}
        />
      </label>

      {error && <div className="invalid-feedback d-block">{error}</div>}
      {showImagePopup && (
  <Popup
    title="Image Preview"
    onClose={() => setShowImagePopup(false)}
    closeOnOutsideClick={true}
    overlayClass="image-preview-overlay"
  >
    <div className="image-preview-wrapper">
      <img src={preview} alt="Full Preview" />
    </div>
  </Popup>
)}

    </div>
  );
}
