import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupAPI } from "./authService";
// import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import VerifyEmail from "./VerifyEmail";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
// import { Dialog } from "@headlessui/react";
import ConfirmDialog from "./ConfirmDialog";
// import TermsModal from "./TermsModal";
import { LogoContext } from "../context/LogoContext";
import {
  validateGmail,
  validatePassword,
  validateName,
  validateMobile,
  validateEmail,
  validatePhoneNO,
} from "../utills/validation";
// import { useNotification } from "../../context/NotificationContext ";
import axiosInstance from "../utills/axiosInstance";
import { useNotification } from "../context/NotificationContext";
import Popup from "../components/Popup";

const Signup = () => {

  const logoCtx = useContext(LogoContext);
const logoUrl = logoCtx?.logoUrl || "/images/defaultuser.jpg";

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [Referal, setReferal] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { showNotification } = useNotification();

  const [emailVerified, setEmailVerified] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [showTerms, setShowTerms] = useState(false); 
const [showModal,setShowModal] = useState(false);
const[signUpResponse, setSignUpResponse] = useState({});
//   const { showNotification } = useNotification();
// const [ui, setUi] = useState({
//   showPassword: false,  showConfirmPassword: false,  referal: "",  otpSent: false, emailVerified: false,
//   otpModalOpen: false, showConfirm: false, pendingSubmit: false, selectedRole: "", isChecked: false, showTerms: false,
// });

  const role = selectedRole === "V" ? "Vendor" : "User"; 
  const [form, setForm] = useState({
    userFullName: "", email: "", mobile: "", roleCode:"PARENT" 
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

const handleModalClose =()=>{setShowModal(false)
            navigate("/login", { replace: true }); 
         }

  const handleChange = (e) => {
    const { name, value } = e.target; 
    setForm((prev) => ({ ...prev, [name]: value })); 
    setErrors((prev) => ({ ...prev, [name]: "" })); 
  };

  const verifyPhoneNo = async () => {
 
  if (!form.mobile) return;

  const phoneError = validateMobile(form.mobile);
  if (phoneError) {
    setErrors((prev) => ({ ...prev, mobile: phoneError }));
    return;
  } else {
    setErrors((prev) => ({ ...prev, mobile: "" }));
  }

  try {
    const res = await axiosInstance.get(`/api/v1/auth/verify-phone?phone=${form.mobile}`);
    if (res?.status === 200 && res?.data === true) {
      setErrors((prev) => ({ ...prev, mobile: "Phone No. is already registered" }));
      showNotification({
        message: "Phone No. is already registered",
        type: "info",
        duration: 2000,
      });
    } else {
      
      setErrors((prev) => ({ ...prev, mobile: "" }));
    }
  } catch (err) {
    console.error("Error verifying phone:", err);
    setErrors((prev) => ({ ...prev, mobile: "Failed to verify phone" }));
  }
}; 

  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Validate email first
    const newErrors = {};
    const emailError = validateGmail(form.email);
    if (emailError) {
      newErrors.email = emailError;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true); // start loading
    setErrors({});

    try {
      const res = await axiosInstance.post(
        `/api/v2/auth/generate-email-otp?email=${form.email}`
      );
     
      if (res?.data?.status === "Failed" && res?.data?.error) {
        setErrors({ email: res.data?.data?.msg || "Email already exists" });
        showNotification({
          message: res.data?.data?.msg || "Email already exists",
          type: "info", duration: 2000,
        });
        return;
      }
 
      setOtpSent(true);
      setOtpModalOpen(true); 

    } catch (err) {
      console.error(err); 
      const apiError =
        err?.response?.data?.data?.msg || "Failed to send OTP. Try again.";
      setErrors({ email: apiError });
      showNotification({
        message: apiError || "Email already exists",
        type: "info", duration: 2000,
      });
    } finally {
      setLoading(false);  
    }
  };

  const handleVerified = () => { 

    setOtpSent(false);
    setEmailVerified(true);
    setOtpModalOpen(false); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {}; 
    const nameError = validateName(form.userFullName);
    if (nameError) {
      newErrors.userFullName = nameError;
    }

    const emailError = validateEmail(form.email);
    if (emailError) {
      newErrors.email = emailError;
    }
    const phoneError = validatePhoneNO(form.mobile);
    if (phoneError) {
      newErrors.mobile = phoneError;
    } 
    if (errors.mobile) {
    newErrors.mobile = errors.mobile;
  }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return; 

    try { 
      const response = await signupAPI(form); 
      const result = response.data?.data;
   
      setSignUpResponse(result)
         setShowModal(true)

      if (result.status === "Failed" && result.error === true) { 
        showNotification({
        message:"You are already registered.",
        type: "info", duration: 2000,
      });
      }
      else if (result.status === "Success" && result.error === false) { 
        // navigate("/login", { replace: true }); 
      }
      else {
        setErrors("Unexpected response from server.");
      }
    } catch (err) {
         showNotification({
      message: err.message, type: "error" 
    });
      setErrors({
        global:
          err?.response?.data?.message || "Signup failed. Please try again.",
      });
    } finally {
      setPendingSubmit(false);
    }
  };

  const handleConfirmSignup = async () => {
    setShowConfirm(false);
    setPendingSubmit(true);

    try {
      const { confirmPassword, ...payload } = form;
      const response = await signupAPI(payload);

      const result = response.data;
      console.log("Signup result:", response);
      // setSignUpResponse(result)

      if (result.status === "Failed" && result.error === true) { 
        showNotification({
        message:"You are already registered.",
        type: "info",  duration: 2000,
      });
      }
      else if (result.status === "Success" && result.error === false) { 
        // setShowModal(true)
        // navigate("/login", { replace: true }); 
      }
      else {
        setErrors("Unexpected response from server.");
      }
    } catch (err) {
      setErrors({
        global:
          err?.response?.data?.message || "Signup failed. Please try again.",
      });
    } finally {
      setPendingSubmit(false);
    }
  };
const copyCredentials = async () => {
  const text = `Username: ${signUpResponse?.userName}
Password: ${signUpResponse?.userPassword}`;

  // ✅ SAFE CHECK
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
      return;
    } catch (err) {
      console.error("Clipboard API failed, using fallback", err);
    }
  }

  // 🔁 FALLBACK (always works)
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);

  alert("Copied to clipboard");
};

  return ( 
    <div className="loginbg">
      <div className="loginsec"> 
          <form onSubmit={handleSubmit} className="" noValidate>
            <div className="loghead">
            <div className="loglogo">
              <img src={logoUrl || "/images/defaultuser.jpg"} onError={(e) => { e.target.onerror = null; e.target.src = "/images/defaultuser.jpg"; }} alt="Logo" />
            </div>
            <h2>Sign Up</h2>
          </div>
            <div className="logsec">   
              <div><input id="name" name="userFullName" type="text" placeholder="Enter Full Name" required className={`form-control ${errors.userFullName ? "is-invalid" : ""}`}
                value={form.userFullName} onChange={handleChange} autoComplete="name" /></div>
              {errors.userFullName && (
                <div className="invalid-feedback">{errors.userFullName}</div>
              )} 
             <div><input id="email" name="email" type="email" placeholder="Enter Email" required className={`form-control ${errors.email ? "is-invalid" : ""}`} value={form.email} onChange={handleChange} />
              {loading && (
                <div className="position-absolute" style={{ right: "10px", top: "50%", transform: "translateY(-50%)" }} >
                  <div className="spinner-border spinner-border-sm text-primary" role="status" >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              {emailVerified && !loading && (
                <FontAwesomeIcon icon={faCheckCircle} className="position-absolute text-success" style={{ right: "10px", top: "50%", transform: "translateY(-50%)" }} />
              )}
              {errors.email && (
                <div className="invalid-feedback d-block">{errors.email}</div>
              )}
            </div> 

            <div> 
            <input id="phone" name="mobile" type="tel" placeholder="Enter Phone" required className={`form-control ${errors.mobile ? "is-invalid" : ""}`} value={form.mobile} onChange={handleChange} autoComplete="tel" />
            {errors.mobile && (
              <div className="invalid-feedback d-block">{errors.mobile}</div>
            )}
          </div> 
          {errors.global && (
            <div className="text-center">
              <p className="text-danger small mb-2">{errors.global}</p>
            </div>
          )}
          <div><button type="submit" disabled={pendingSubmit} className="loginbtn">
            {pendingSubmit ? "Creating account..." : "Sign Up"}
          </button> </div> 
          <ConfirmDialog open={showConfirm} title="Confirm Signup" message={`Are you sure you want to sign up as a ${role}?`} onConfirm={handleConfirmSignup} onCancel={() => setShowConfirm(false)} />
          {showTerms && (<TermsModal showTerms={showTerms} setShowTerms={setShowTerms} setIsChecked={setIsChecked} role={role} />
          )}
          <p className="signac">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
          </p>
           </div> 
          </form>
        </div>
        {/* {showModal && <Popup
         onClose={handleModalClose}
            title="Your Credentials"
            closeOnOutsideClick={false}
        >
          <div className="logindetails">
            <div><label>User Name</label> <span>{signUpResponse?.userName}</span></div>
            <div><label>User Password</label> <span>{signUpResponse?.userPassword}</span></div>
          </div>
         
          </Popup>} */}
          {showModal && (
  <div
    className="modalOverlay"
    onClick={() => {
      // prevent outside close if you want
      // or just call handleModalClose()
    }}
  >
    <div
      className="modalBox"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="closeBtn"
        onClick={handleModalClose}
      >
        ✖
      </button>

      <h3>Your Credentials</h3>

      <div className="popupContent logindetails">
        <div>
          <label>User Name</label>
          <span>{signUpResponse?.userName}</span>
        </div>

        <div>
          <label>User Password</label>
          <span>{signUpResponse?.userPassword}</span>
        </div>
      </div>

      <div className="popupActions"> 
        <button
          className="saveBtn"
           onClick={copyCredentials}

        >
          Copy Credentials
        </button>
      </div>
    </div>
  </div>
)}

      </div>  
  );
};

export default Signup;
