// GradientPicker.jsx
import React, { useState, useEffect } from "react";
export default function GradientPicker({ label, value, onChange }) {
  const parseGradient = (val) => {
    if (!val || !val.startsWith("linear-gradient")) {
      return { angle: 90, colors: ["#8651ff", "#0862c8"] };
    }
    const inside = val.replace("linear-gradient(", "").replace(")", "");
    const parts = inside.split(",");
    let angle = parseInt(parts[0]);
    if (isNaN(angle)) angle = 90;
    const colors = parts.slice(1).map((c) => c.trim());
    return { angle, colors };
  };

  const initial = parseGradient(value);
  const [angle, setAngle] = useState(initial.angle);
  const [colors, setColors] = useState(initial.colors);

   useEffect(() => {
    const parsed = parseGradient(value);
    setAngle(parsed.angle);
    setColors(parsed.colors);
  }, [value]);
 
  const updateGradient = (newColors = colors, newAngle = angle) => {
    const gradient = `linear-gradient(${newAngle}deg, ${newColors.join(", ")})`;
    onChange(gradient);
  };

  const handleColorChange = (index, newColor) => {
    const updated = [...colors];
    updated[index] = newColor;
    setColors(updated);
    updateGradient(updated);
  };

  const addColor = () => {
    const updated = [...colors, "#ffffff"];
    setColors(updated);
    updateGradient(updated);
  };

  const removeColor = (i) => {
    if (colors.length <= 2) return;
    const updated = colors.filter((_, index) => index !== i);
    setColors(updated);
    updateGradient(updated);
  };

  return (
    <>
    <div className="gradient">
      <div>
        <div className="colorname">{label}</div> 
        <div className="gcolor"style={{background: `linear-gradient(${angle}deg, ${colors.join(", ")})`,  }} ></div>
      </div>
 
      <div className="angles">
        <label>Angle: {angle}°</label>
        <input
          type="range"
          min="0"
          max="360"
          value={angle}
          onChange={(e) => {
            const newAngle = parseInt(e.target.value);
            setAngle(newAngle);
            updateGradient(colors, newAngle);
          }}
        />
      </div>
   </div>
    <div className="colorlist"> 
      {colors.map((c, i) => (
        <div key={i}>
          <input type="color" value={c}  onChange={(e) => handleColorChange(i, e.target.value)} />
          {colors.length > 2 && (
            <button className="deletebtn" onClick={() => removeColor(i)}>✖</button>
          )}
        </div>
      ))}
      <button onClick={addColor}>+</button> 
      {/* <input type="text" value={`linear-gradient(${angle}deg, ${colors.join(", ")})`} readOnly style={{ width: "100%", marginTop: "6px" }} /> */}
    </div>
    </>
  );
}
