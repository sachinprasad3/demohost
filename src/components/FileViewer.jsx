import { useEffect, useRef, useState } from "react";
import { useNotification } from "../context/NotificationContext";
import Popup from "./Popup";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import axiosInstance from "../utills/axiosInstance";
import { APIs } from "../utills/apis";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ---------- helpers ----------
const isAndroidWebView = () =>
  window?.AndroidDownloader &&
  typeof window?.AndroidDownloader.downloadFile === "function";

const getMimeType = (url, isPdf) => {
  if (isPdf || url.toLowerCase().endsWith(".pdf")) return "application/pdf";
  const ext = url.split(".").pop().toLowerCase().split("?")[0];
  const map = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return map[ext] || "application/octet-stream";
};

const getBlobFromUrl = async (url) => {
  try {
    let blob;

    // If already blob URL
    if (url.startsWith("blob:")) {
      const res = await fetch(url);
      blob = await res.blob();
    } else {
      // Normal remote URL → use backend
      const res = await axiosInstance.get(APIs.VIEW__FILE, {
        params: { url },
        responseType: "blob",
      });

      blob = res.data;
    }

    return blob;
  } catch (error) {
    console.error("Blob fetch error:", error);
    throw error;
  }
};

const getBase64AndMime = async (url, isPdf) => {
  const blob = await getBlobFromUrl(url);

  const base64Data = await new Promise((resolve) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result.split(",")[1]);
    r.readAsDataURL(blob);
  });

  return {
    base64Data,
    mimeType: getMimeType(url, isPdf) || blob.type,
  };
};

// ---------- component ----------
const FileViewer = ({ file, open, onClose, title = "File/Documents" }) => {
  if (!open) return null;

  const { fileName, filePath, isPdf = false, isDownloadable = false } = file;

  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const pdfContainerRef = useRef(null);
  const [enablePan, setEnablePan] = useState(false);

  if (!filePath) {
    showNotification({
      message: "No file URL provided",
      type: "error",
      duration: 2000,
    });
    return null;
  }

  const isPdfFile = isPdf || filePath.toLowerCase().endsWith(".pdf");

  // ---------- PDF render (ALL pages) ----------
  useEffect(() => {
    if (!isPdfFile) return;

    let cancelled = false;

    const renderAllPages = async () => {
      try {
        setLoading(true);
        pdfContainerRef.current.innerHTML = "";

        const pdf = await pdfjsLib.getDocument(filePath).promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.4 });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.display = "block";
          canvas.style.margin = "0 auto 20px";
          canvas.style.maxWidth = "100%";

          pdfContainerRef.current.appendChild(canvas);

          await page.render({
            canvasContext: ctx,
            viewport,
          }).promise;
        }

        if (!cancelled) setLoading(false);
      } catch (err) {
        console.error(err);
        showNotification({
          message: "Unable to load PDF",
          type: "error",
          duration: 2000,
        });
        setLoading(false);
      }
    };

    renderAllPages();
    return () => (cancelled = true);
  }, [filePath, isPdfFile, showNotification]);

  // ---------- Download handler ----------
  const handleDownload = async () => {
    try {
      if (isAndroidWebView()) {
        // ANDROID: base64 + mime
        const { base64Data, mimeType } = await getBase64AndMime(
          filePath,
          isPdfFile,
        );
        window.AndroidDownloader.downloadFile(base64Data, fileName, mimeType);
      } else {
        // WEB: direct download
        const link = document.createElement("a");
        link.href = filePath;
        link.download = fileName || "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification({
          message: "Downloaded",
          type: "success",
          duration: 2000,
        });
      }
    } catch (err) {
      console.error(err);
      showNotification({
        message: "Download failed",
        type: "error",
        duration: 2000,
      });
    }
  };

  return (
    <Popup
      title={title || fileName}
      closeOnOutsideClick={false}
      onClose={onClose}
    >
      {/* Download button */}


      <div className="pdfviews" style={{ textAlign: "center" }}>
        {loading && (
          <div style={{ padding: 20 }}>
            <span>Loading…</span>
          </div>
        )}

        {isPdfFile ? (
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={4}
            panning={{ disabled: !enablePan }}
            wheel={{ step: 0.15 }}
            pinch={{ step: 0.15 }}
            doubleClick={{ disabled: true }}
            onTransformed={({ state }) => {
              setEnablePan(state.scale > 1);
            }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="viewer-controls">
                  <div className="zoom-controls">
                    <button onClick={() => zoomOut()}>−</button>
                    <button onClick={() => resetTransform()}>Reset</button>
                    <button onClick={() => zoomIn()}>+</button>
                  </div>
                  {isDownloadable && (
                    <div>
                      <button type="button" onClick={handleDownload}>
                        ⬇ Download
                      </button>
                    </div>
                  )}
                </div>

                <TransformComponent>
                  <div ref={pdfContainerRef} />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        ) : (
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={5}
            panning={{ disabled: !enablePan }}
            wheel={{ step: 0.2 }}
            onTransformed={({ state }) => {
              setEnablePan(state.scale > 1);
            }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="viewer-controls">
                  <div className="zoom-controls">
                    <button onClick={() => zoomOut()}>−</button>
                    <button onClick={() => resetTransform()}>Reset</button>
                    <button onClick={() => zoomIn()}>+</button>
                  </div>
                  {isDownloadable && (
                    <div>
                      <button type="button" onClick={handleDownload}>
                        ⬇ Download
                      </button>
                    </div>
                  )}
                </div>

                <TransformComponent>

                  <img
                    src={filePath}
                    alt="File"
                    style={{
                      width: "100%",
                      height: "auto",
                      userSelect: "none",
                    }}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                      setLoading(false);
                      showNotification({
                        message: "Unable to load image",
                        type: "error",
                        duration: 2000,
                      });
                    }}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        )}

      </div>
    </Popup >
  );
};

export default FileViewer;
