
import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import OtpInput from "./OtpInput";
import { Dialog, DialogTitle } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../utills/axiosInstance";
import { validateEmail, validatePassword } from "../utills/validation";
import { useAuth } from "../context/AuthContext";
import { LogoContext } from "../context/LogoContext";
import { useNotification } from "../context/NotificationContext";
const ForgotPassword = () => {
   const logoCtx = useContext(LogoContext);
  const logoUrl = logoCtx?.logoUrl || "/images/defaultuser.jpg";
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState({});
  const navigate = useNavigate();
  const [username, setUsername] = useState("")
const {user} = useAuth()
      
  const { showNotification } = useNotification();

  const handleSendEmail = async (e) => {


    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailError = validateEmail(email);
      if (emailError) newErrors.email = emailError;
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(`/api/v1/forget-password/verify-email?email=${email}`); 
      setStep(2);
      setIsOpen(true);
    } catch (err) { 
    console.error("failed to send otp",err)
    showNotification({
        message:
          err?.response?.data?.data?.msg ||   "Failed to send Otp",
        type: "error",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };
 
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError({ otp: "Enter the 6-digit OTP" });
      return;
    }

    try {
      const res = await axiosInstance.post(`/api/v1/forget-password/verify-otp`, null, {
        params: { email, otp },
      });
console.log("res",res)
      if (res.data.data?.error === "false") { 
        setStep(3);
         showNotification({
        message:
          res?.data?.data?.message ||   "Otp is verified",
        type: "success",
        duration: 2000,
      });
      } else {
        setError({ otp: "Invalid or expired OTP" });
      }
    } catch (err) {
      setError({ otp: err.response?.data?.msg || "Invalid OTP" });
      console.error("error in verifying otp",err)
    }
  };

  //  Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      setError({ password: passwordError });
      return;
    }

    if (newPassword !== confirmPassword) {
      setError({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
     await axiosInstance.post(`/api/v1/forget-password/reset-password`, null, {
        params: { email, newPassword },
      }); 
      setIsOpen(false);
      navigate("/login");
      showNotification({
        message:"Password Reset SuccessFull",
        type: "success",
        duration: 2000,
      });
    } catch (err) {
        console.error("error in setting new password",err); 
    } finally {
      setLoading(false);
    }
  };

  return (
 <div className="loginbg">
    <div className="loginsec"> 
      <form onSubmit={handleSendEmail} >
         <div className="loghead">
            <div className="loglogo">
              <img src={logoUrl || "/images/defaultuser.jpg"} onError={(e) => { e.target.onerror = null; e.target.src = "/images/defaultuser.jpg"; }} alt="Logo" />
            </div>
            <h2>Forgot Password</h2>
          </div>
          <div className="logsec">    
            <label className="form-label">Email Address</label> 
            <div><input  type="email" className="form-control" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} required /> </div>
            {error.email && (
              <p className="text-danger small mt-1">{error.email}</p>
            )} 
          <div><button type="submit" disabled={loading} className="loginbtn"  >
            {loading ? "Sending..." : "Send OTP"}
          </button></div>
          <p className="signac">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline"> Log in </Link>
        </p>
        </div>
    </form> 
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50"> 
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" /> 
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4 bg-light bg-opacity-75">
        <div className="w-100" style={{ maxWidth: "420px" }}>
          <div className="bg-white p-4 rounded-4 shadow forgotbox"> 
            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>           
                {/* <div><input type="text" className="form-control" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)}  required /></div> */}
                <h5 className="fw-bold mb-3">Enter OTP</h5> 
                <OtpInput length={6} onComplete={(code) => setOtp(code)} /> 
                {error.otp && (
                  <p className="text-danger small mt-2">{error.otp}</p>
                )} 
                <div className="d-flex mt-1">
                   <button type="button" onClick={() => setIsOpen(false)} className="loginbtn cancelbtn">Cancel</button> 
                  <button type="submit" className="loginbtn"  disabled={loading} >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                </div> 
               
              </form>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <h5 className="fw-bold mb-3">Reset Password</h5>
                {/* New Password */}
                <div className="mb-3 position-relative">
                  <input type={showPassword ? "text" : "password"}  placeholder="New Password" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} className={`form-control pe-5 ${error.password ? "is-invalid" : ""}`} required  />

                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary" >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>

                  {error.password && (
                    <div className="invalid-feedback d-block">{error.password}</div>
                  )}
                </div>
      
                <div className="mb-3 position-relative">
                  <input  type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`form-control pe-5 ${error.confirmPassword ? "is-invalid" : ""}`}  required />

                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary" >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>

                  {error.confirmPassword && (
                    <div className="invalid-feedback d-block">{error.confirmPassword}</div>
                  )}
                </div>

                <button type="submit" className="loginbtn"  disabled={loading} >
                  {loading ? "Processing..." : "Reset Password"}
                </button>

                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline-secondary w-100 mt-3 py-2" >
                  Cancel
                </button>
              </form>
            )}

          </div>
        </div>
      </div>

    </Dialog> 

  </div>  
  </div>
  );
};

export default ForgotPassword;
