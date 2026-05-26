
import { useState, useEffect } from "react";
import axiosInstance from "../utills/axiosInstance";
// import OtpInput from "./OtpInput"; 
// import { toast } from "react-toastify";

const VerifyEmail = ({ email, onVerified }) => {
  const [otp, setOtp] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30); 
  const [canResend, setCanResend] = useState(false);


useEffect(() => {
    if (!canResend && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);


  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.post(
        "/api/v2/auth/verify-email-otp",
        null,
        { params: { email, otp } }
      );

      if (res?.data?.status === "Success" && !res?.data?.error) {
        // toast.success(res?.data?.msg || "Email verified successfully!");
        onVerified();
      } else {
        setError(res?.data?.data?.error || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setCanResend(false);
      setResendTimer(30); // reset timer
      await axiosInstance.post(`/api/v2/auth/generate-email-otp?email=${email}`);
    //   toast.success("OTP resent successfully!");
    } catch (err) {
    //   toast.error("Failed to resend OTP");
      setCanResend(true); 
    }
  };

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-lg font-semibold">Verify your email</h2>
      <p className="text-sm text-gray-600">
        Enter the OTP sent to <b>{email}</b>
      </p>

      {/* Custom OTP Input */}
      <div className="flex justify-center mt-4">
        {/* <OtpInput length={6} onComplete={setOtp} /> */}
      </div>

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={loading || otp.length !== 6}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

    {/* Resend OTP button */}
      <div className="mt-4">
        {canResend ? (
          <button
            onClick={handleResendOtp}
            className="text-indigo-600 hover:underline text-sm"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-gray-500 text-sm">
            Resend OTP in {resendTimer}s
          </p>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default VerifyEmail;
