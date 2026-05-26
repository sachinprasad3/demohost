import React, { useState } from "react";
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

const Signup = () => {
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

  const role = selectedRole === "V" ? "Vendor" : "User";

  const [form, setForm] = useState({
    userFullName: "",
    email: "",
    mobile: "",
    roleCode:"PARENT"
    // password: "",
    // referrerCode: null,
    // confirmPassword: "",
    // signupType: "U", // Default: User
    // vatNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);



  const handleChange = (e) => {
    const { name, value } = e.target;

    
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear errors for the specific field
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // If role is being changed, update selectedRole too
    // if (name === "signupType") {
    //   setSelectedRole(value);
    // }
    // if (name === "terms") {
    //   setIsChecked(e.target.checked);
    // }
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
      
      // Check API response for errors
      if (res?.data?.status === "Failed" && res?.data?.error) {
        setErrors({ email: res.data?.data?.msg || "Email already exists" });
        showNotification({
          message: res.data?.data?.msg || "Email already exists",
          type: "info", // success | error | info | warning
          duration: 2000,
        });
        return;
      }

      // OTP sent successfully
      setOtpSent(true);
      setOtpModalOpen(true); // open modal

    } catch (err) {
      console.error(err);

      // Handle axios errors
      const apiError =
        err?.response?.data?.data?.msg || "Failed to send OTP. Try again.";
      setErrors({ email: apiError });
      showNotification({
        message: apiError || "Email already exists",
        type: "info", // success | error | info | warning
        duration: 2000,
      });
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleVerified = () => {
    // 👇 Called when OTP is successfully verified
  
    setOtpSent(false);
    setEmailVerified(true);
    setOtpModalOpen(false);
    // continue normal signup submission flow...
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Form validations
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

    // const passwordError = validatePassword(form.password);
    // if (passwordError) {
    //   newErrors.password = passwordError;
    // }

    // if (form.password !== form.confirmPassword)
    //   newErrors.confirmPassword = "Passwords do not match";

    // if (!emailVerified) {
    //   newErrors.email = "Please verify your email before signing up";
    // }
    // if (!isChecked) {
    //   newErrors.terms = "You must accept the Terms & Conditions.";
    // }
    if (errors.mobile) {
    newErrors.mobile = errors.mobile;
  }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // setSelectedRole(form.signupType === "V" ? "Vendor" : "User");
    // setShowConfirm(true);

    try {
    //   const { confirmPassword, ...payload } = form;
      const response = await signupAPI(form);

      const result = response.data;
      

      if (result.status === "Failed" && result.error === true) {
        // toast.error("You are already registered.");
        showNotification({
        message:"You are already registered.",
        type: "info", // success | error | info | warning
        duration: 2000,
      });
      }
      else if (result.status === "Success" && result.error === false) {
        // toast.success(`Signup successful as ${role}!`);

        navigate("/login", { replace: true });

      }
      else {
        setErrors("Unexpected response from server.");
      }
    } catch (err) {
         showNotification({
      message: err.message,
      type: "error" // success | error | info | warning
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

      if (result.status === "Failed" && result.error === true) {
        // toast.error("You are already registered.");
        showNotification({
        message:"You are already registered.",
        type: "info", // success | error | info | warning
        duration: 2000,
      });
      }
      else if (result.status === "Success" && result.error === false) {
        // toast.success(`Signup successful as ${role}!`);

        navigate("/login", { replace: true });

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

  return (
    // <AuthFormWrapper title="Create your account">
    <div className="loginbg">
      <div className="loginsec">
            <h2>Sign Up</h2>
          <form onSubmit={handleSubmit} className="" noValidate>
            <div className="mb-3 position-relative">  
              <img  src="images/user.png" alt="" className="position-absolute" style={{ top: "50%", left: "10px", transform: "translateY(-50%)", width: "20px" }} />
              <input id="name" name="userFullName" type="text" placeholder="Enter Full Name" required className={`form-control ps-5 ${errors.userFullName ? "is-invalid" : ""}`}
                value={form.userFullName} onChange={handleChange} autoComplete="name" />
              {errors.userFullName && (
                <div className="invalid-feedback">{errors.userFullName}</div>
              )}
            </div>
            <div>
            <div className="mb-3 position-relative"> 
              <img src="images/mail.png" alt="" className="position-absolute" style={{ top: "50%", left: "10px", transform: "translateY(-50%)", width: "20px" }} />
              <input id="email" name="email" type="email" placeholder="Enter Email" required className={`form-control ps-5 ${errors.email ? "is-invalid" : ""}`} value={form.email} onChange={handleChange} />
              {loading && (
                <div className="position-absolute"
                  style={{ right: "10px", top: "50%", transform: "translateY(-50%)" }} >
                  <div className="spinner-border spinner-border-sm text-primary" role="status" >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {/* Verified Check Icon */}
              {emailVerified && !loading && (
                <FontAwesomeIcon icon={faCheckCircle} className="position-absolute text-success" style={{ right: "10px", top: "50%", transform: "translateY(-50%)" }} />
              )}
              {errors.email && (
                <div className="invalid-feedback d-block">{errors.email}</div>
              )}
            </div> 
          </div>

          <div className="mb-3 position-relative">
            <img src="images/phone.png" alt="" className="position-absolute" style={{ top: "50%", left: "10px", transform: "translateY(-50%)", width: "20px" }} />
            <input id="phone" name="mobile" type="tel" placeholder="Enter Phone" required className={`form-control ps-5 ${errors.mobile ? "is-invalid" : ""}`} value={form.mobile} onChange={handleChange} autoComplete="tel" />
            {errors.mobile && (
              <div className="invalid-feedback d-block">{errors.mobile}</div>
            )}
          </div> 
          {errors.global && (
            <div className="text-center">
              <p className="text-danger small mb-2">{errors.global}</p>
            </div>
          )}
          <button type="submit" disabled={pendingSubmit} className="btn btn-primary w-100">
            {pendingSubmit ? "Creating account..." : "Sign Up"}
          </button> 
          </form>
          <ConfirmDialog open={showConfirm} title="Confirm Signup" message={`Are you sure you want to sign up as a ${role}?`} onConfirm={handleConfirmSignup} onCancel={() => setShowConfirm(false)} />
          {showTerms && (<TermsModal showTerms={showTerms} setShowTerms={setShowTerms} setIsChecked={setIsChecked} role={role} />
          )}
          <p className="signac">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
          </p>
        </div>
      </div> 
    // </AuthFormWrapper>
  );
};

export default Signup;
