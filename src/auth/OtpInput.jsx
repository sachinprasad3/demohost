import React, { useRef, useState, useEffect } from "react";

const OtpInput = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputsRef = useRef([]);

  // Handle change
  const handleChange = (element, index) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value[0];
    setOtp(newOtp);

    // Move next
    if (index < length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  // Paste handler
  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("text").trim().slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < length; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);

    const nextIndex =
      pastedData.length < length ? pastedData.length : length - 1;
    inputsRef.current[nextIndex].focus();
  };

  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      onComplete(otp.join(""));
    }
  }, [otp]);

  return (
    <div className="d-flex gap-2 otpinput" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => (inputsRef.current[index] = el)}
          className="form-control"
           
        />
      ))}
    </div>
  );
};

export default OtpInput;
