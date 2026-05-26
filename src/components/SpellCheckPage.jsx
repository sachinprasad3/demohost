import { useState, useEffect, useRef } from "react";

export default function SpellCheckPage() {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState([]);
  const [menu, setMenu] = useState(null);

  const controllerRef = useRef(null);
  const debounceRef = useRef(null);
  const lastCheckedText = useRef("");

  // Only check when word completed (space / dot / enter)
  useEffect(() => {
    if (!text.trim()) return; 
    const lastChar = text.slice(-1); 
    if (![" ", ".", ",", "!", "?", "\n"].includes(lastChar)) {
      return;
    }

    if (text === lastCheckedText.current) return; 
    clearTimeout(debounceRef.current); 
    debounceRef.current = setTimeout(() => {
      checkSpelling(text);
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [text]);

  const checkSpelling = async (currentText) => {
    try { 
      if (controllerRef.current) { controllerRef.current.abort(); } 
      controllerRef.current = new AbortController(); 
      const response = await fetch( "https://api.languagetool.org/v2/check",
        { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded",   },
          body: new URLSearchParams({ text: currentText, language: "en-US",  }),  signal: controllerRef.current.signal,
        }
      );

      const data = await response.json(); 
      lastCheckedText.current = currentText;
      setErrors(data.matches || []);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.log("Spell check error:", err);
      }
    }
  };

  const applySuggestion = (error, suggestion) => {
    const newText =
      text.substring(0, error.offset) +
      suggestion +
      text.substring(error.offset + error.length);

    setText(newText);
    setMenu(null);
    setErrors([]);
  };

const openMenu = (e, err) => {
  e.preventDefault();
  e.stopPropagation();   // 🔥 important

  const rect = e.target.getBoundingClientRect();

  setMenu({
    ...err,
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
  });
};


  const renderHighlightedText = () => {
    if (!errors.length) return text;

    let parts = [];
    let lastIndex = 0;

    errors.forEach((err, index) => {
      const before = text.substring(lastIndex, err.offset);
      const wrongWord = text.substr(err.offset, err.length);

      parts.push(before);

      parts.push(
        <span
          key={index}
          className="error-word"
          onContextMenu={(e) => openMenu(e, err)}
          onTouchStart={(e) => {
            const timeout = setTimeout(() => openMenu(e, err), 500);
            e.target.dataset.longpress = timeout;
          }}
          onTouchEnd={(e) =>
            clearTimeout(e.target.dataset.longpress)
          }
        >
          {wrongWord}
        </span>
      );

      lastIndex = err.offset + err.length;
    });

    parts.push(text.substring(lastIndex));
    return parts;
  };

  return (
    <div className="mainpro" onClick={(e) => { if (!e.target.closest(".context-menu")) { setMenu(null); } }} >
      <div className="container">
        <div className="whitebox">
          <div className="editor-wrapper">
            <div className="editor">{renderHighlightedText()}</div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="hidden-textarea"/>
          </div>
        </div>

        {menu && (
          <div className="context-menu" style={{ top: menu.top, left: menu.left }} >
            {menu.replacements.slice(0, 5).map((rep, i) => (
              <div key={i} className="menu-item" onClick={() => applySuggestion(menu, rep.value)} >{rep.value}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
