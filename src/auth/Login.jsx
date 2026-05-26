import React, { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LogoContext } from "../context/LogoContext";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { loginAPI } from "./authService";
import { setCookie } from "../utills/cookies";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { HelpCircle } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const Login = () => {
  const logoCtx = useContext(LogoContext);
  const logoUrl = logoCtx?.logoUrl || "/images/default-logo.png";
const qrRef = useRef();
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    // 🔹 Basic validation
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await loginAPI(form.username, form.password);
      const userDetails = res?.data;

      if (!userDetails) throw new Error("User details missing in response");

      login(userDetails);
      setCookie("userDetails", JSON.stringify(userDetails), 7);
    } catch (err) {
      showNotification({
        message:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Login failed",
        type: "error",
        duration: 2000,
      });

      setErrors({
        global: err?.message || "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginbg">
      <div className="loginsec">
        <form onSubmit={handleLogin}>
          <div className="loghead">
            <div className="loglogo">
              <img src={logoUrl} alt="Logo" onError={(e) => { e.target.onerror = null; e.target.src = "/images/defaultuser.jpg"; }} />
            </div>
            <h2>Login</h2>
          </div> 

          <div className="logsec">
            {message && <p>{message}</p>}
            <div><input type="text" name="username" className="form-control" placeholder="Username" value={form.username} onChange={handleChange} required /></div> 
            <div className="mb-2 position-relative">
          <input type={showPassword ? "text" : "password"} name="password" className="form-control" placeholder="Password" value={form.password} onChange={handleChange} required />

          <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="btn position-absolute end-0 top-50 translate-middle-y">
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>
            <div className="forgots"><label><input type="checkbox"></input> Remember me</label> <Link to="/forget-password"><span>Forgot Password ?</span></Link></div>
            <div><button type="submit" className="loginbtn"> {loading ? "Logging in..." : "Login"}</button></div>
          </div>


          {/* <p className="signac">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
          </p> */}
 
        </form>

         <div className="text-center mt-3">
          {/* <div className="or">OR</div> */}
          <div className="btns">
            {/* <Link to="/student/admission-form" className="btnlink">
              <img src="images/google-logo.png" /> <span>Sign in with Google</span>
            </Link> */}
            <Link to="/admission-enquiry" className="btnlink"><span><HelpCircle size={20} /> Enquiry Form</span></Link>
          </div>
        </div>


        <div className="appdownload">
          <div className="qr" ref={qrRef}>
          <QRCodeCanvas
            value="https://playschoolual.s3.ap-south-1.amazonaws.com/NEEV_28022026.apk"
            size={160}
          />
        </div>
          <div>Scan QR to Download App</div>
        </div>
      </div>
    </div>
  );
};

export default Login;