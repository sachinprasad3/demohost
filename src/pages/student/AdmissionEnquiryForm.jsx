import React, {useContext, useEffect, useRef, useState } from "react";
import axiosInstance from "../../utills/axiosInstance"; 
import Input from "../../components/AmissionFormComponents/customField/Input";
import Select from "../../components/AmissionFormComponents/customField/Select";
import { sanitizeValue } from "../../components/AmissionFormComponents/hooks/AdmissionHeleperFunction";
import { validateDob, validateMobile } from "../../utills/validation";
import { useNotification } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { LogoContext } from "../../context/LogoContext";
const ENABLE_OTP_VERIFICATION = false;
export default function AdmissionEnquiryForm() {
  const initialFormState = {
    studentName: "",
    motherName: "",
    fatherName: "",
    gender: "",
    dob: "",
    fatherContactNumber: "",
    motherContactNumber: "",
    enquiryClass: [], 
    placeOfBirth: "",
    prevPlaySchool: "",
    residentialAddress: "",
    siblings: "",
    knowAboutUs: "",
    otherSource: "",
    anyEnquiry: "",
  };
    const { showNotification } = useNotification();
  const logoCtx = useContext(LogoContext);
    const logoUrl = logoCtx?.logoUrl || "/images/default-logo.png";
  const [form, setForm] = useState(initialFormState);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [fatherRelationshipCode, setFatherRelationshipCode] = useState(null);
const [errors, setErrors] = useState({});

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [hasResent, setHasResent] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const contactRef = useRef(null);
  const contactRef2 = useRef(null);
  const otpInputRef = useRef(null);
const today = new Date();
const maxDob = new Date(
  today.getFullYear(),
  today.getMonth() - 30,
  today.getDate()
)
  .toISOString()
  .split("T")[0];

const navigate = useNavigate()
  const classOptions = availableClasses.map((cls) => {
  const formattedLabel = cls.className
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bLkg\b/g, "LKG")
    .replace(/\bUkg\b/g, "UKG");

  return {
    label: formattedLabel,
    value: cls.classId,
  };
});
const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  

];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Fetch Academic Years
        const yearRes = await axiosInstance.get("/api/academicYear");
        if (yearRes.data && Array.isArray(yearRes.data)) {
          setAcademicYears(yearRes.data);
          // Find the year marked as current 'Y'
          const current = yearRes.data.find(y => y.isCurrent === "Y") || yearRes.data[0];
          if (current) setSelectedYear(current.academicYear);
        }

        // 2. Fetch Father Relationship Code
        const relRes = await axiosInstance.get(`/api/relationship-master/FATHER`);
        if (relRes.data) {
          setFatherRelationshipCode(relRes.data.relationshipCode);
        }
      } catch (error) {
        console.error("Error fetching initial setup data:", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Fetch Academic Years
        const yearRes = await axiosInstance.get("/api/academicYear");
        if (yearRes.data && Array.isArray(yearRes.data)) {
          setAcademicYears(yearRes.data);
          // Find the year marked as current 'Y'
          const current = yearRes.data.find(y => y.isCurrent === "Y") || yearRes.data[0];
          if (current) setSelectedYear(current.academicYear);
        }

        // 2. Fetch Father Relationship Code
        const relRes = await axiosInstance.get(`/api/relationship-master/FATHER`);
        if (relRes.data) {
          setFatherRelationshipCode(relRes.data.relationshipCode);
        }
      } catch (error) {
        console.error("Error fetching initial setup data:", error);
      }
    };
    fetchInitialData();
  }, []);

  // 3. Separate effect to fetch classes whenever the selectedYear changes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!selectedYear) return;
      try {
        const response = await axiosInstance.get(
          `/api/v1/class/getAllClassesByAcademicYear?academicYear=${selectedYear}`
        );
        if (response.data?.status === "Success" && Array.isArray(response.data.data)) {
          setAvailableClasses(response.data.data);
        } else {
          setAvailableClasses([]);
        }
      } catch (error) {
        console.error("Error fetching class list:", error);
        setAvailableClasses([]);
      }
    };
    fetchClasses();
  }, [selectedYear]);

  const startOtpTimer = (secs = 60) => {
    setSecondsLeft(secs);
  };

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (showOtpModal) {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 120);
    }
  }, [showOtpModal]);

  // const handleChange = (e) => {
  //   const { name, value, checked } = e.target;
  //   if (name === "enquiryClass" || name === "knowAboutUs") {
  //     const valToStore = name === "enquiryClass" ? Number(value) : value;
  //     const updated = checked
  //       ? [...form[name], valToStore]
  //       : form[name].filter((v) => v !== valToStore);
  //     setForm({ ...form, [name]: updated });
  //   } else {
  //     setForm({ ...form, [name]: value });
  //   }
  // };

  const maskedNumber = (num) => {
    if (!num) return "xxxxxx----";
    const digits = num.replace(/\D/g, "");
    const last4 = digits.slice(-4).padStart(4, "----");
    return `xxxxxx${last4}`;
  };

  const validateAll = () => {
  const newErrors = {};

  Object.keys(form).forEach((field) => {
    const error = validateField(field, form[field]);
    if (error) newErrors[field] = error;
  });

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0; // true if no errors
};


  
  const handleSubmit = async (e) => {
  e.preventDefault();

  
  const isValid = validateAll();

  if (!isValid) {
    // scroll to first error
    const firstErrorField = Object.keys(errors)[0];
    document.querySelector(`[name="${firstErrorField}"]`)?.focus();
    return;
  }

  // now safe to proceed
  const digits = (form.fatherContactNumber || "").replace(/\D/g, "");

    setOtpValue("");
    setHasResent(false);

    if (ENABLE_OTP_VERIFICATION) {
      try {
        const payload = { phone: "+91" + digits };
        const response = await axiosInstance.post("/otp/send", payload);

        if (response.data.status === "OTP_SENT") {
          setOtpSessionId(response.data.sessionId);
          startOtpTimer(60);
          setShowOtpModal(true);
        } else {
          alert("Failed to send OTP. Please try again.");
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Error sending OTP. Check console.");
      }
    } else {
      setOtpSessionId(99999);
      startOtpTimer(60);
      setShowOtpModal(true);
    }
  };
  const handleResend = async () => {
    if (ENABLE_OTP_VERIFICATION) {
       if (!otpSessionId) return;
       try {
         const payload = { sessionId: otpSessionId };
         const response = await axiosInstance.post("/otp/resend", payload);
         
         if (response.data.status === "OTP_RESENT") {
           setHasResent(true);
           startOtpTimer(60);
           setOtpValue("");
         }
       } catch (error) {
         console.error("Error resending OTP:", error);
       }
    } else {
       setHasResent(true);
       startOtpTimer(60);
       setOtpValue("");
    }
  };
  const handleVerifyAndSubmit = async () => {
    if (!otpValue || otpValue.trim().length < 4) {
      alert("Please enter valid OTP (4-6 digits).");
      otpInputRef.current?.focus();
      return;
    }

    if (ENABLE_OTP_VERIFICATION) {
      try {
        const verifyPayload = {
          sessionId: otpSessionId,
          otp: otpValue
        };
        const verifyResponse = await axiosInstance.post("/otp/verify", verifyPayload);

        if (verifyResponse.data.status === "SUCCESS") {
          await createEnquiryRecord(); 
        } else {
          alert("Invalid OTP. Please try again.");
          setOtpValue("");
        }
      } catch (error) {
        console.error("Error during verification:", error);
        alert("Verification failed.");
      }
    } else {
      await createEnquiryRecord(); 
    }
  };

  const createEnquiryRecord = async (e) => {
    // if (!fatherRelationshipCode) {
    //     alert("System Error: Could not fetch Relationship Code for 'Father'. Please refresh the page.");
    //     return;
    // }
    e.preventDefault();

  
  const isValid = validateAll();

  if (!isValid) {
    // scroll to first error
    const firstErrorField = Object.keys(errors)[0];
    document.querySelector(`[name="${firstErrorField}"]`)?.focus();
    return;
  }

    try {
      const nameParts = form.studentName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      // const allSources = [...form.knowAboutUs];
      // if (form.otherSource) allSources.push(form.otherSource);
      // const sourceString = allSources.join(", ");
      const sourceString = form.otherSource
  ? `${form.knowAboutUs}, ${form.otherSource}`
  : form.knowAboutUs;

      const enquiryPayload = {
        academicYear: selectedYear,
        classId: form.enquiryClass[0],
        inquirySource: sourceString,
        inquiryBy: form.fatherName,        
        relationshipCode: fatherRelationshipCode,         
        studentFirstName: firstName,
        studentMiddleName: "",
        studentLastName: lastName,
        gender: form.gender ? form.gender.toUpperCase() : null,
        dateOfBirth: form.dob,
        placeOfBirth: form.placeOfBirth,
        previousSchoolAttended: form.prevPlaySchool,        
        siblingName: form.siblings,        
        fatherName: form.fatherName,
        motherName: form.motherName,
        phonePrimary: form.fatherContactNumber,
        phoneSecondary: form.motherContactNumber,
        mobileValidated: true,        
        addressLine1: form.residentialAddress,
        country: "India",
        inquiryStatus: "ENQUIRY",        
        enquiryDetails: form.anyEnquiry ? [
          {
            parentEnquiry: form.anyEnquiry,
            schoolResponse: "",
            responseBy: "" 
          }
        ] : []
      };

      const response = await axiosInstance.post("/api/enquiry/createEnquiry", enquiryPayload);
      if (response.status === 200 || response.status === 201) {
        setShowOtpModal(false);
       
         showNotification({
        message: `Enquiry Submitted Successfully`,
        type: "success",
        duration: 2000
      });
        setForm(initialFormState);
        setOtpValue("");
        setOtpSessionId(null);
      }
      navigate("/login")

    } catch (error) {
      console.error("Error creating enquiry:", error);
      
       showNotification({
        message: "failed to save enquiry data",
        type: "error",
        duration: 2000
      });
    }
  };

  const handleOtpModalClose = () => setShowOtpModal(false);
  const handleChangeNumber = () => {
    setShowOtpModal(false);
    setTimeout(() => { contactRef.current?.focus(); }, 80);
  };

  const validateField = (name, value) => {
  switch (name) {
    case "studentName":
      if (!value) return "Student name is required";
      if (value.length < 2) return "Enter full name";
      break;

    case "dob":
  if (!value) return "Date of birth is required";
  return validateDob(value);


    case "motherName":
      if (!value) return "Mother's name is required";
      break;

    case "fatherName":
      if (!value) return "Father's name is required";
      break;

    case "fatherContactNumber":
      if (!value) return "Phone number is required";
      if (!validateMobile(value)) return "Starts with 6–9, 10 digits total";
      break;

    case "motherContactNumber":
      if (value && !validateMobile(value)) return "Starts with 6–9, 10 digits total";
      break;
       case "gender":
      if (!value) return "Child's gender is required";
      break;
    case "enquiryClass":
      if (!value) return "Child's class is required";
      break;
    // case "knowAboutUs":
    //   if (!value ) return "Please enter this field";
    //   break;

    default:
      return "";
  }

  return "";
};

const handleBlur = (name, value) => {
  const error = validateField(name, value);

  setErrors(prev => ({
    ...prev,
    [name]: error
  }));
};

  const handleChange = (e, allow, maxLength) => {
    const { name, value } = e.target;
    if (!name) return;

    let cleanValue = value;

    if (allow) {
      cleanValue = sanitizeValue(value, allow, maxLength);
    }

    setForm(prev => ({
      ...prev,
      [name]: cleanValue,
    }));
  };



  return (
    <>
      <header className="topbarbox fullwidth">
        <div className="mobilelogo">
           <img src={logoUrl} alt="Logo" onError={(e) => { e.target.onerror = null; e.target.src = "/images/defaultuser.jpg"; }} style={{ height: 35 }}/>
          
        </div>
        <a href="/login" className="btn lognbtn btnbg"><span>Login</span></a>
      </header>

      <div className="formsec container">
        <form onSubmit={createEnquiryRecord} className="admitionform" autoComplete="off">
          <h2>Admission Enquiry Form</h2>
          {/* {!ENABLE_OTP_VERIFICATION && (
            <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ffeeba' }}>
              <strong>Developer Mode:</strong> OTP Verification is <u>BYPASSED</u>. Any 4-digit code will work.
            </div>
          )} */}

          <div className="whitebox mb-3">
            <h4>Session Details</h4>
            <div className="row">
              <div className="col-md-4">
                <Select
                  name="academicYear"
                  label="Select Academic Year"
                  value={selectedYear}
                  options={academicYears.map(y => ({ label: y.academicYear, value: y.academicYear }))}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="whitebox ">
            <h4>Student Details</h4>
            <div className="formbox">

              <Input
                name="studentName"
                label="Name of the Child"
                value={form.studentName}
                placeholder="Enter Child Name"
                required
                error={errors?.studentName}
                onChange={(e) => handleChange(e, "alpha", 25)}

                onBlur={() => handleBlur("studentName", form.studentName)}
              />
<Select
  name="gender"
  label="Gender"
  value={form.gender}
  options={genderOptions}
  placeholder="Select Gender"
  required
  error={errors.gender}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      gender: e.target.value,
    }))
  }
  onBlur={() => handleBlur("gender", form.gender)}
  className="col-md-6 mb-1"
/>

              <Input
                name="dob"
                label="Date of Birth"
                placeholder="Enter child Date of Birth"
                type="date"
                
                value={form.dob}
                max={maxDob}
                required
                error={errors?.dob}
                onChange={(e) => handleChange(e)}


                onBlur={() => handleBlur("dob", form.dob)}
              />
              <Input
                name="placeOfBirth"
                placeholder="Enter child place of birth"
                label="Place of Birth"
                value={form.placeOfBirth}
                onChange={(e) => handleChange(e, "alpha", 50)}


                error={errors?.placeOfBirth}
                onBlur={()=> handleBlur("placeOfBirth",form.placeOfBirth)}
                
              />
              <Select
                name="enquiryClass"
                label="Enquiry for Class"
                value={form.enquiryClass}
                options={classOptions}
                placeholder="Select Class"
                required
                disabled={availableClasses.length === 0}
                error={errors.enquiryClass}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    enquiryClass: [Number(e.target.value)],
                  }))
                }
                onBlur={() =>
                  handleBlur("enquiryClass", form.enquiryClass)
                }
              />

              <Input
                name="prevPlaySchool"
                placeholder="Enter previous school attended by child"
                label="Previous Pre-School Attended"
                value={form.prevPlaySchool}
                onChange={(e) => handleChange(e, "alpha", 50)}


                error={errors?.prevPlaySchool}
                onBlur={()=> handleBlur("prevPlaySchool",form.prevPlaySchool)}
              />
              <Input
                name="motherName"
                label="Mother’s Name"
                placeholder="Enter Mother Name"
                value={form.motherName}
                required
                onChange={(e) => handleChange(e, "alpha", 50)}


                error={errors?.motherName}

                onBlur={()=>handleBlur("motherName",form.motherName)}
              />

              <Input
                name="fatherName"
                placeholder="Enter Father Name"
                label="Father’s Name"
                value={form.fatherName}
                required
                onChange={(e) => handleChange(e, "alpha", 50)}


                error={errors?.fatherName}

                onBlur={()=>handleBlur("fatherName",form.motherName)}
              />


              <Input
                name="fatherContactNumber"
                placeholder="Enter Father Phone No."
                label="Father's Phone Number "
                value={form.fatherContactNumber}
                required
                onChange={(e) => handleChange(e, "numeric", 10)}


                onBlur={() =>
    handleBlur("fatherContactNumber", form.fatherContactNumber)
  }
                error={errors?.fatherContactNumber}

              />

              <Input
                name="motherContactNumber"
                placeholder="Enter Mother Phone No."
                label="Mother's Phone Number"
                value={form.motherContactNumber}
                onChange={(e) => handleChange(e, "numeric", 10)}


                onBlur={() => handleBlur("motherContactNumber", form.motherContactNumber)}
                error={errors?.motherContactNumber}

              />



              <div className="mb-1">
                <label className="form-label">Residential Address</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.residentialAddress}
                  onChange={(e) =>
                    setForm(p => ({ ...p, residentialAddress: e.target.value }))
                  }
                  
                />
              </div>

              <Input
                name="siblings"
                placeholder="Enter No. of siblings you have"
                label="Siblings (if any)"
                value={form.siblings}
                onChange={(e) => handleChange(e, "alphanumeric", 50)}


                error={errors?.siblings}

              />

            </div>
          </div>

          <div className="whitebox">
            
            <div className="formbox">



              <div>

                <Select
                  name="knowAboutUs"
                  label="How did you come to know about us?"
                  placeholder="Select how you came to know about us"
                  value={form.knowAboutUs}
                  options={[
                    "Existing Parent Reference",
                    "Newspaper Ad",
                    "Social Media",
                    "Radio / Television",
                    "Pre School",
                    "Hoarding/Banner",
                    "Email / SMS / WhatsApp",
                    "Employee Reference",
                    "Website",
                    "School Bus Display",
                    "Exhibition/Seminar",
                  ].map((source) => ({
                    label: source,
                    value: source,
                  }))}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, knowAboutUs: e.target.value }))
                  }
                   error={errors?.knowAboutUs}

                />

              </div>
              <Input
                name="otherSource"
                label="Any other source, please specify"
                value={form.otherSource}
                onChange={(e) => handleChange(e, "alphanumeric", 50)}


                error={errors?.otherSource}

                
              />


              <div className="mb-2">
                <label className="form-label">Any Enquiry / Additional Notes</label>
                <textarea
                  name="anyEnquiry"
                  rows={5}
                  className="form-control"
                  value={form.anyEnquiry}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, anyEnquiry: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

         

          <div className="mt-4 d-flex justify-content-end">
            <button type="submit" className="btn btnbg px-4">
               {/* {ENABLE_OTP_VERIFICATION ? "Submit Enquiry (Verify OTP)" : "Submit Enquiry (Bypass OTP)"} */}
               Submit Enquiry
            </button>
          </div>
        </form>
      </div>

      {showOtpModal && (
        <div role="dialog" aria-modal="true" className="otp-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div className="otp-card" style={{ width: 420, maxWidth: "94%", background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0 }}>Verify Mobile {ENABLE_OTP_VERIFICATION ? "" : "(Bypassed)"}</h4>
              <button aria-label="close" onClick={handleOtpModalClose} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }}>×</button>
            </div>

            <p style={{ marginTop: 12 }}>
              Please enter the otp sent to mobile number <strong>{maskedNumber(form.fatherContactNumber)}</strong>
              {!ENABLE_OTP_VERIFICATION && <span style={{display:'block', fontSize:'12px', color:'red', marginTop:'5px'}}>(Dev Mode: Enter any 4 digits)</span>}
            </p>

            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <input ref={otpInputRef} type="text" inputMode="numeric" pattern="\d*" maxLength={6} placeholder="Enter OTP" value={otpValue} onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))} style={{ flex: 1, padding: "10px 12px", fontSize: 16, borderRadius: 6, border: "1px solid #ccc" }} />
              <button type="button" onClick={handleVerifyAndSubmit} className="btn btn-primary" style={{ padding: "10px 14px" }}>Verify & Submit</button>
            </div>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                {secondsLeft > 0 ? (
                  <span>Resend OTP in {secondsLeft}s</span>
                ) : (
                  <button type="button" onClick={handleResend} className="btn btn-link" style={{ padding: 0 }}>Resend OTP</button>
                )}
              </div>
              <div><button type="button" onClick={handleChangeNumber} className="btn btn-link">Change Number</button></div>
            </div>

            <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>
              {hasResent ? "OTP resent." : "OTP sent successfully."}
            </div>
          </div>
        </div>
      )}
    </>
  );
}