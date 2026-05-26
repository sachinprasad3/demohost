import React, { useState } from "react";
import "../css/popup.css";

export default function AdmissionAmount({ open, onClose, student }) {
  if (!open) return null;

  const total =
    student.admissionForm +
    student.admissionFees +
    student.feeAmount +
    student.transportAmount;

  const [showLogin, setShowLogin] = useState(false);

  return ( 
      
        <div className="popup-overlay beforepop">
            {!showLogin && (
          <div className="popup-box">
            <button className="close-btn" onClick={onClose}>✖</button>

            <div className="additional-section">
              <h4>{student.firstName} {student.surname}</h4>

              <div className="detail-row">
                <span>Admission Form</span>
                <span>₹{student.admissionForm}</span>
              </div>

              <div className="detail-row">
                <span>Admission Fees</span>
                <span>₹{student.admissionFees}</span>
              </div>

              <div className="detail-row text-muted">
                <span>Fee Type</span>
                <span>{student.feeType ? student.feeType : "-"}</span>
              </div>

              <div className="detail-row">
                <span>Fee Amount</span>
                <span>₹{student.feeAmount || "0"}</span>
              </div>

              {student.transportType === "transport" && (
                <div className="detail-row">
                  <span>Transport Fee</span>
                  <span>₹{student.transportAmount}</span>
                </div>
              )}

              <div className="total-row">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              <button className="btn btnbg" onClick={() => setShowLogin(true)}>
                Pay Now For Addmision
              </button>
            </div>
          </div>
             )}

              {showLogin && (
        <div className="popup-box">
            {/* <button className="close-btn" onClick={() => setShowLogin(false)}>✖</button>  */}
            <div className="newpopup">
              <h3>Login Information</h3>
              <p>Use the credentials below to Login. Save this information.</p>

              <div className="total-row">
                <span>Username : </span>
                <span>student1</span>
              </div>

              <div className="total-row">
                <span>Password : </span>
                <span>12345</span>
              </div>
              <a href="/login" className="btn lognbtn btnbg">
          <span>Go to Login</span>
        </a>
            </div>
          </div>
      )}
        </div> 
  );
}
