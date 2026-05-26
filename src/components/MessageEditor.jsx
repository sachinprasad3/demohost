import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, Image, Code, Eye } from "lucide-react";
import { useNotification } from "../context/NotificationContext";
export default function MessageEditor({ value = "", onChange, onBlur }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);
  const [isHtmlView, setIsHtmlView] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (editorRef.current && value !== undefined && value !== null) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  useEffect(() => {
  if (!isHtmlView && editorRef.current) {
    editorRef.current.innerHTML = value || "";
  }
}, [isHtmlView]);

  const handleInput = (e) => {
    onChange(e.currentTarget.innerHTML);
  };
  
  const format = (command, value = null) => {
  editorRef.current?.focus(); 
  document.execCommand(command, false, value);
  onChange(editorRef.current.innerHTML);
};
  
  const insertAtCursor = (html) => {
    editorRef.current.focus();
    document.execCommand("insertHTML", false, html);
    onChange(editorRef.current.innerHTML);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showNotification({
        message: "Only image files are allowed (jpg, png, webp, etc.)",
        type: "error",
        duration: 2000,
      });
      e.target.value = "";
      return;
    }

    // File size validation
    if (file.size > MAX_SIZE) {
      showNotification({
        message: "Image size should not exceed 5MB",
        type: "error",
        duration: 2000,
      });
      e.target.value = ""; // reset file input
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      const base64 = event.target.result;
      const tempId = `img-${Date.now()}`;

      const imgHTML = `
      <img
        src="${base64}"
        data-filename="${file.name}"
        data-temp-id="${tempId}"
        style="max-width:200px; height:auto; margin:8px 0; border-radius:6px;"
      />
    `;

      insertAtCursor(imgHTML);
    };

    reader.readAsDataURL(file);
  };

const toggleHtmlView = () => {
  if (isHtmlView) {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  } else {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }

    setIsHtmlView((prev) => !prev);
  };

const handleTextColor = (e) => {
  format("foreColor", e.target.value);
};

  return (
    <div className="message-editor-wrapper"> 
      <div className="toolbar">
        <button type="button" onClick={() => format("bold")}><Bold size={16} /></button>
        <button type="button" onClick={() => format("italic")}><Italic size={16} /></button>
        <button type="button" onClick={() => format("underline")}><Underline size={16} /></button>
        <button type="button" onClick={() => fileInputRef.current.click()}><Image size={16} /></button>
        <div className="textcolor"><input type="color" ref={colorInputRef}  onChange={handleTextColor} title="Text Color" /></div>
        {/* <button type="button" onClick={toggleHtmlView}>{isHtmlView ? <Eye size={16} /> : <Code size={16} />}</button>   */}
        
        
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageUpload} />
      </div> 
      {isHtmlView ? (
        <textarea className="message-box editable" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
      ) : (
      <div ref={editorRef} className="message-box editable" contentEditable={true} suppressContentEditableWarning={true} onInput={handleInput} onBlur={onBlur} />
      )} 
    </div>
  );
}