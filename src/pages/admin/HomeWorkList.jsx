// HomeWorkList.jsx
import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
import Tesseract from "tesseract.js";
import "../../css/fileReaderAudio.css";
import AudioDayList from "../../components/AudioDayList";

// ✅ DATA PLACEHOLDERS
const studentAudioData = {};
const adminFetchedAudioData = {};
const childAudioData = {};

// ✅ PDF WORKER
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function HomeWorkList() {
  const [text, setText] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedAudioUrl, setSavedAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🔊 PLAY ONLY
  const speakText = (content) => {
    if (!content) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(content);
    speech.lang = "en-IN";
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
  };

  // 💾 PLAY + SAVE (WEBM)
  const speakAndSaveText = async (content) => {
    if (!content) return;

    window.speechSynthesis.cancel();
    audioChunksRef.current = [];

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = "en-IN";
    utterance.rate = 0.9;

    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: false,
    });

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });

    mediaRecorderRef.current.start();

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const url = URL.createObjectURL(blob);
      setSavedAudioUrl(url);

      const a = document.createElement("a");
      a.href = url;
      a.download = `read-audio-${Date.now()}.webm`; // ✅ correct
      a.click();
    };

    utterance.onend = () => {
      mediaRecorderRef.current.stop();
      stream.getTracks().forEach((t) => t.stop());
    };

    window.speechSynthesis.speak(utterance);
  };

  // 📂 FILE UPLOAD
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setText("");
    setPreviewUrl(null);
    setFileType(file.type);
    setLoading(true);

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        setText(reader.result);
        speakText(reader.result);
        setLoading(false);
      };
      reader.readAsText(file);
    } 
    else if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const pdf = await pdfjsLib.getDocument(reader.result).promise;
          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map((i) => i.str).join(" ") + " ";
          }

          setText(fullText);
          setPreviewUrl(URL.createObjectURL(file));
          speakText(fullText);
        } catch {
          alert("Unable to read PDF");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } 
    else if (file.type.startsWith("image/")) {
      try {
        const imgUrl = URL.createObjectURL(file);
        setPreviewUrl(imgUrl);
        const result = await Tesseract.recognize(file, "eng");
        setText(result.data.text);
        speakText(result.data.text);
      } catch {
        alert("Unable to read image");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Unsupported file");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <div className="whitebox">
        <h3>Upload File & Listen</h3>

        <label className="upload-box">
          <input type="file" accept=".txt,.pdf,image/*" onChange={handleFileUpload} hidden />
          Tap / Click to Upload File
        </label>

        {loading && <p className="loading">Processing...</p>}

        {previewUrl && fileType.startsWith("image/") && (
          <img src={previewUrl} alt="Preview" className="preview-image" />
        )}

        {previewUrl && fileType === "application/pdf" && (
          <iframe src={previewUrl} title="PDF Preview" className="preview-pdf" />
        )}

        {text && (
          <>
            <textarea value={text} readOnly className="text-box" />

            <button className="play-btn" onClick={() => speakText(text)}>
              🔊 Play Audio Again
            </button>

            <button className="save-btn" onClick={() => speakAndSaveText(text)}>
              💾 Save Read Audio
            </button>

            {savedAudioUrl && (
              <audio controls src={savedAudioUrl} style={{ marginTop: 10 }} />
            )}
          </>
        )}
      </div>
</div>
      <AudioDayList title="My Daily Audio" data={studentAudioData} />
      {/* <AudioDayList title="Child Audio Recordings" data={childAudioData} />
      <AudioDayList title="Student Audio History" data={adminFetchedAudioData} showDate /> */}
    </>
  );
}
