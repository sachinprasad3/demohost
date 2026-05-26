import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import axiosInstance from "../../utills/axiosInstance";
import { useAuth } from "../../context/AuthContext";

export default function StudentDiscountForm({ mode = "ADD" }) {
    const { user } = useAuth();
    const isOwner = user?.role === "OWNER";
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const isView = mode === "VIEW";

    const getLocalDate = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalDate();

    // Requirement: Candidate should be at least 2.5 years old
    const maxDobDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 30); 
    d.setDate(d.getDate() - 1); 
    
    return getLocalDate(d);
})();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        studentFirstName: "",
        studentMiddleName: "",
        studentLastName: "",
        gender: "",
        dateOfBirth: "",
        guardianName: "",
        mobileNo: "",
        contactEmail: "",
        guardianRelationCode: "",
        discountAmount: "",
        discountPerc: "",
        validFrom: mode === "ADD" ? todayStr : "",
        validTo: "",
        discStatus: mode === "ADD" ? "FORWARDED" : "DRAFT",
    });

    const [errors, setErrors] = useState({});
    const [otpStep, setOtpStep] = useState("IDLE");
    const [otpValue, setOtpValue] = useState("");
    const [emailVerified, setEmailVerified] = useState(mode === "EDIT");

    useEffect(() => {
        if ((mode === "EDIT" || mode === "VIEW") && id) {
            fetchDiscountDetails();
        }
    }, [mode, id]);

    const fetchDiscountDetails = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/v1/student-discounts/getById/${id}`);
            if (response.data.status === "Success") {
                const s = response.data.data;

                // Use a safe mapping for the relation code
                const mappedRelation = s.guardianRelationCode || s.relationCode || "";

                const sanitizedData = {
                    ...s,
                    studentMiddleName: s.studentMiddleName ?? "",
                    studentLastName: s.studentLastName ?? "",
                    contactEmail: s.contactEmail ?? "",
                    // Use ?? "" to ensure numbers 0 or null become strings for the input
                    discountAmount: s.discountAmount ?? "",
                    discountPerc: s.discountPerc ?? "",
                    validTo: s.validTo ?? "",
                    relationCode: mappedRelation,
                    discStatus: s.discStatus ?? "DRAFT"
                };

                setFormData(sanitizedData);
            } else {
                showNotification({ message: response.data.message || "Failed to load details", type: "error" });
            }
        } catch (error) {
            console.error("Fetch Error:", error); // Helpful for debugging in console
            showNotification({ message: "Error fetching data", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!formData.contactEmail || errors.contactEmail) {
            showNotification({ message: "Please enter a valid email first", type: "error" });
            return;
        }
        setOtpStep("SENDING");
        try {
            const res = await axiosInstance.post(`/api/v1/user/verify-email-discount?email=${formData.contactEmail}`);
            if (res.data.status === "Success") {
                showNotification({ message: res.data.data.msg, type: "success" });
                setOtpStep("SENT");
            }
        } catch (err) {
            if (err.response && err.response.status === 409) {
            showNotification({ 
                message: "This email is already registered. Please use a different email.", 
                type: "error" 
            });
        } else {
            // Handle other errors (500, 404, network, etc.)
            const errorMsg = err.response?.data?.message || "Failed to send OTP. Please try again.";
            showNotification({ message: errorMsg, type: "error" });
        }
            setOtpStep("IDLE");
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpValue || otpValue.length < 4) return;
        setOtpStep("VERIFYING");
        try {
            const res = await axiosInstance.post(`/api/v1/user/verify-otp-registration?email=${formData.contactEmail}&otp=${otpValue}`);
            if (res.data.status === "Success" && res.data.data.error === "false") {
                showNotification({ message: "Email verified successfully!", type: "success" });
                setEmailVerified(true);
                setOtpStep("VERIFIED");
            } else {
                showNotification({ message: res.data.data.msg || "Invalid OTP", type: "error" });
                setOtpStep("SENT");
            }
        } catch (err) {
            showNotification({ message: "Invalid or expired OTP", type: "error" });
            setOtpStep("SENT");
        }
    };

    const handleInputChange = (e) => {
        if (isView) return;
        let { name, value } = e.target;

        // 1. Phone validation: Only numbers
        if (name === "mobileNo") {
            value = value.replace(/[^0-9]/g, "");
        }

        // 2. Name validation: Only letters and spaces
        if (["studentFirstName", "studentMiddleName", "studentLastName", "guardianName"].includes(name)) {
            value = value.replace(/[^a-zA-Z\s]/g, "");
        }

        if (name === "discountAmount" && value !== "") {
            setFormData(prev => ({ ...prev, [name]: value, discountPerc: "" }));
        } else if (name === "discountPerc" && value !== "") {
            setFormData(prev => ({ ...prev, [name]: value, discountAmount: "" }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        if (name === "discountAmount" || name === "discountPerc") {
            setErrors(prev => ({ ...prev, discountAmount: null }));
        }
    };

    const validateForm = () => {
        let newErrors = {};
        const nameRegex = /^[A-Za-z\s]+$/;
        const phoneRegex = /^[6-9]\d{9}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Name Validations
        if (!formData.studentFirstName.trim()) {
            newErrors.studentFirstName = "First Name is required";
        } else if (!nameRegex.test(formData.studentFirstName)) {
            newErrors.studentFirstName = "Only letters allowed";
        }

        if (formData.studentLastName && !nameRegex.test(formData.studentLastName)) {
            newErrors.studentLastName = "Only letters allowed";
        }

        if (!formData.guardianName.trim()) {
            newErrors.guardianName = "Guardian Name is required";
        } else if (!nameRegex.test(formData.guardianName)) {
            newErrors.guardianName = "Only letters allowed";
        }

        // Phone Validation
        if (!phoneRegex.test(formData.mobileNo)) {
            newErrors.mobileNo = "Must be 10 digits starting with 6-9";
        }

        // Email Validation
        if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
            newErrors.contactEmail = "Invalid email format";
        }

        // Dropdowns and DOB
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "DOB is required";
        if (!formData.guardianRelationCode) newErrors.guardianRelationCode = "Relationship is required";
        if (!formData.discStatus) newErrors.discStatus = "Status is required";

        // Discount Values
        if (formData.discountAmount && parseFloat(formData.discountAmount) <= 0) {
            newErrors.discountAmount = "Amount must be greater than 0";
        }
        if (formData.discountPerc && parseFloat(formData.discountPerc) <= 0) {
            newErrors.discountAmount = "Percentage must be greater than 0";
        }
        if (!formData.discountAmount && !formData.discountPerc) {
            newErrors.discountAmount = "Either Amount or Percentage is required";
        }

        // Date Validations
        if (!formData.validFrom) {
            newErrors.validFrom = "Required";
        } else if (mode === "ADD" && formData.validFrom < todayStr) {
            newErrors.validFrom = "Cannot be a past date";
        }

        if (formData.validTo && formData.validTo < formData.validFrom) {
            newErrors.validTo = "Cannot be before Effective From date";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (mode === "ADD" && !emailVerified) {
            showNotification({ message: "Please verify your email address before submitting", type: "error" });
            return;
        }
        if (!validateForm()) return;
        setLoading(true);

        try {
            // Use the single upsert endpoint as requested
            const url = `/api/v1/student-discounts/apply`;

            // Prepare payload: Include 'id' only if in EDIT mode
            const payload = {
                ...formData,
                active: "Y"
            };

            if (mode === "EDIT") {
                payload.discountId = id;
            }

            const response = await axiosInstance.post(url, payload);

            if (response.data.status === "Success") {
                showNotification({
                    message: `Discount successfully ${mode === "EDIT" ? "updated" : "saved"}!`,
                    type: "success"
                });
                navigate("/admin/student-discounts");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to save record";
            showNotification({ message: errorMsg, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="addfee-head">
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => navigate("/admin/student-discounts")}>
                    <ArrowLeft size={18} /> Discount List
                </button>
            </div>

            <div className="whitebox">

                <div className="formbox stapform">
                    <h5 className="text-primary mb-3">1. Student Information</h5>
                    <ul>
                        <li>
                            <div className="form-group">
                                <label>First Name <span className="text-danger">*</span></label>
                                <input type="text" name="studentFirstName" disabled={isView} className="form-control" value={formData.studentFirstName} onChange={handleInputChange} placeholder="Letters only" />
                                {errors.studentFirstName && <div className="text-danger mt-1 small">{errors.studentFirstName}</div>}
                            </div>
                        </li>
                        <li>
                            <div className="form-group">
                                <label>Middle Name</label>
                                <input type="text" name="studentMiddleName" disabled={isView} className="form-control" value={formData.studentMiddleName} onChange={handleInputChange} />
                            </div>
                        </li>
                        <li>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" name="studentLastName" disabled={isView} className="form-control" value={formData.studentLastName} onChange={handleInputChange} />
                                {errors.studentLastName && <div className="text-danger mt-1 small">{errors.studentLastName}</div>}
                            </div>
                        </li>
                        <li>
                            <div className="form-group">
                                <label>Gender <span className="text-danger">*</span></label>
                                <select name="gender" disabled={isView} className="form-control" value={formData.gender} onChange={handleInputChange}>
                                    <option value="">Select</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                </select>
                                {errors.gender && <div className="text-danger mt-1 small">{errors.gender}</div>}
                            </div>
                        </li>
                        <li>
                            <div className="form-group">
                                <label>Date of Birth <span className="text-danger">*</span></label>
                                <input type="date" name="dateOfBirth" disabled={isView} className="form-control" value={formData.dateOfBirth} onChange={handleInputChange} max={maxDobDate} />
                                {errors.dateOfBirth && <div className="text-danger mt-1 small">{errors.dateOfBirth}</div>}
                            </div>
                        </li>
                    </ul>

                    <h5 className="text-primary mt-4 mb-3">2. Guardian Information</h5>
                    <ul>
                        <li className="fullsec">
                            <div className="form-group">
                                <label>Guardian Name <span className="text-danger">*</span></label>
                                <input type="text" name="guardianName" disabled={isView} className="form-control" value={formData.guardianName} onChange={handleInputChange} />
                                {errors.guardianName && <div className="text-danger mt-1 small">{errors.guardianName}</div>}
                            </div>
                        </li>
                        <li>
                            <div className="form-group">
                                <label>Relationship <span className="text-danger">*</span></label>
                                <select name="guardianRelationCode" disabled={isView} className="form-control" value={formData.guardianRelationCode} onChange={handleInputChange}>
                                    <option value="">Select Relation</option>
                                    <option value="FATHER">Father</option>
                                    <option value="MOTHER">Mother</option>
                                    <option value="GUARDIAN">Guardian</option>
                                </select>
                                {errors.guardianRelationCode && <div className="text-danger mt-1 small">{errors.guardianRelationCode}</div>}
                            </div>
                        </li>
                        <li>
                            <div className="form-group">
                                <label>Mobile No <span className="text-danger">*</span></label>
                                <input type="text" name="mobileNo" disabled={isView} className="form-control" value={formData.mobileNo} onChange={handleInputChange} maxLength={10} placeholder="Starts with 6-9" />
                                {errors.mobileNo && <div className="text-danger mt-1 small">{errors.mobileNo}</div>}
                            </div>
                        </li>
                        <li className="fullsec">
                            <div className="form-group">
                                <label>Email {mode === "ADD" && <span className="text-danger">*</span>}</label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        disabled={isView || mode === "EDIT" || emailVerified}
                                        className="form-control"
                                        value={formData.contactEmail}
                                        onChange={handleInputChange}
                                        placeholder="example@email.com"
                                    />

                                    {mode === "ADD" && !emailVerified && otpStep === "IDLE" && (
                                        <button type="button" className="btn btn-outline-primary btn-sm px-3" onClick={handleSendOtp}>
                                            Verify
                                        </button>
                                    )}

                                    {emailVerified && (
                                        <span className="badge bg-success d-flex align-items-center px-3">
                                            <CheckCircle size={14} className="me-1" /> Verified
                                        </span>
                                    )}
                                </div>
                                {errors.contactEmail && <div className="text-danger mt-1 small">{errors.contactEmail}</div>}
                            </div>
                        </li>

                        {/* OTP Input Field - Appears only after OTP is sent */}
                        {otpStep === "SENT" || otpStep === "VERIFYING" ? (
                            <li className="fullsec">
                                <div className="form-group bg-light p-3 rounded border">
                                    <label className="fw-bold">Enter OTP sent to your email</label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="text"
                                            className="form-control w-50"
                                            placeholder="6-digit OTP"
                                            value={otpValue}
                                            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                                            maxLength={6}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            onClick={handleVerifyOtp}
                                            disabled={otpStep === "VERIFYING"}
                                        >
                                            {otpStep === "VERIFYING" ? <Loader2 className="animate-spin" size={18} /> : "Submit OTP"}
                                        </button>
                                        <button type="button" className="btn btn-link text-muted btn-sm" onClick={() => setOtpStep("IDLE")}>
                                            Change Email
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ) : null}
                    </ul>

                    <h5 className="text-primary mt-4 mb-3">3. Discount Configuration</h5>
                    <ul>
                        <li>
                            <div className="form-group">
                                <label>Discount Amount (₹)</label>
                                <input type="number" name="discountAmount" disabled={isView || !!formData.discountPerc} className="form-control" value={formData.discountAmount} onChange={handleInputChange} min="1" />
                                {errors.discountAmount && <div className="text-danger mt-1 small">{errors.discountAmount}</div>}
                            </div>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>OR</li>
                        <li>
                            <div className="form-group">
                                <label>Discount Percentage (%)</label>
                                <input type="number" name="discountPerc" disabled={isView || !!formData.discountAmount} className="form-control" value={formData.discountPerc} onChange={handleInputChange} min="1" />
                            </div>
                        </li>
                        <li>
                            <div className="form-group">
                                <label>Valid From <span className="text-danger">*</span></label>
                                <input type="date" name="validFrom" disabled={isView} className="form-control" value={formData.validFrom} onChange={handleInputChange} min={mode === "ADD" ? todayStr : ""} />
                                {errors.validFrom && <div className="text-danger mt-1 small">{errors.validFrom}</div>}
                            </div>
                        </li>
                        <li>
                            <div className="form-group">
                                <label>Valid To</label>
                                <input type="date" name="validTo" disabled={isView} className="form-control" value={formData.validTo} onChange={handleInputChange} min={formData.validFrom} />
                                {errors.validTo && <div className="text-danger mt-1 small">{errors.validTo}</div>}
                            </div>
                        </li>
                        <li>
                            <div className="form-group">
                                <label>Status</label>
                                <select name="discStatus" disabled={isView} className="form-control" value={formData.discStatus} onChange={handleInputChange}>
                                    <option value="DRAFT">DRAFT</option>
                                    <option value="FORWARDED">FORWARDED</option>
                                    {isOwner && (
                                        <option value="APPROVED">APPROVED</option>
                                    )}
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                                {errors.discStatus && <div className="text-danger mt-1 small">{errors.discStatus}</div>}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="btn-inline d-flex gap-3 justify-content-center mt-4">
                <button type="button" className="btn lightbtn" onClick={() => navigate(-1)} style={{ padding: "10px 32px" }}>
                    {isView ? "Back" : "Cancel"}
                </button>
                {!isView && (
                    <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ padding: "10px 32px" }}>
                        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                        {mode === "EDIT" ? "Update Record" : "Submit"}
                    </button>
                )}
            </div>
        </div>
    );
}