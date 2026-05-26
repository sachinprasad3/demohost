import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ArrowLeft, Plus, X } from "lucide-react";
import axiosInstance from "../../utills/axiosInstance";
import Popup from "../../components/Popup";

export default function ClassForm() {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve state passed from List page
    const { classData } = location.state || {};
    const isEditMode = !!classData?.classId;

    // --- Constants ---
    const SCHOOL_ID = "SCH001";

    // --- State ---
    const [academicYearsList, setAcademicYearsList] = useState([]);
    const [teacherList, setTeacherList] = useState([]);
    const [feeHeadsMaster, setFeeHeadsMaster] = useState([]);

    const [statusPopup, setStatusPopup] = useState({
        isOpen: false,
        type: "success",
        title: "",
        message: ""
    });

    const [formData, setFormData] = useState({
        academicYear: "",
        classId: null,
        className: "",
        capacity: "", // Changed default to empty string for validation check
        ageMinMonths: "",
        ageMaxMonths: "",
        active: "Y",
        teacherId: ""
    });

    const [feeRows, setFeeRows] = useState([]);

    // --- NEW: Error State ---
    const [errors, setErrors] = useState({});

    // Helper for filtering dropdowns
    const selectedHeadIds = feeRows.map(r => Number(r.headId));

    // --- Effects ---
    useEffect(() => {
        initializeForm();
    }, []);

    // --- API Calls ---
    const fetchUnassignedTeachers = async (year) => {
        if (!year) return [];
        try {
            const response = await axiosInstance.get("/api/teachers/unassigned", {
                params: { academicYear: year } // Pass selected year
            });
            const result = response.data;
            if (result.status === "Success") return result.data;
            return [];
        } catch (error) {
            console.error("Error fetching teachers:", error);
            return [];
        }
    };

    const initializeForm = async () => {
        try {
            // 1. Fetch Fee Heads
            const feeHeadsResp = await axiosInstance.get("/api/v1/user/fee/getFeeHeads");
            setFeeHeadsMaster(feeHeadsResp.data.data || []);

            // 2. Fetch Academic Years
            const yearsResp = await axiosInstance.get("/api/academicYear");
            const yearsData = yearsResp.data || [];
            setAcademicYearsList(yearsData);

            // Determine Initial Year
            let initialYear = "";
            if (isEditMode) {
                initialYear = location.state?.academicYear || "";
            } else {
                const currentYearObj = yearsData.find(y => y.isCurrent === 'Y');
                initialYear = currentYearObj ? currentYearObj.academicYear : (yearsData[0]?.academicYear || "");
            }

            // 3. Fetch Teachers based on Initial Year
            let availableTeachers = await fetchUnassignedTeachers(initialYear);

            if (isEditMode) {
                if (classData.classTeacherId) {
                    const currentTeacher = {
                        teacherId: classData.classTeacherId,
                        fullName: classData.classTeacherName
                    };
                    if (!availableTeachers.find(t => t.teacherId === classData.classTeacherId)) {
                        availableTeachers = [currentTeacher, ...availableTeachers];
                    }
                }

                setFormData({
                    classId: classData.classId,
                    academicYear: initialYear,
                    className: classData.className,
                    capacity: classData.capacity || "",
                    ageMinMonths: classData.ageMinMonths || "",
                    ageMaxMonths: classData.ageMaxMonths || "",
                    active: "Y",
                    teacherId: classData.classTeacherId || ""
                });

                if (classData.feeStructure && classData.feeStructure.length > 0) {
                    const mappedFees = classData.feeStructure.map((fee, index) => ({
                        tempId: Date.now() + index,
                        headId: fee.headId,
                        amount: fee.amount,
                        isExisting: true
                    }));
                    setFeeRows(mappedFees);
                }
                else {
                    setFeeRows([{
                        tempId: Date.now(),
                        headId: "",
                        amount: "",
                        isExisting: false
                    }]);
                }

            } else {
                const currentYearObj = yearsData.find(y => y.isCurrent === 'Y');
                const defaultYear = currentYearObj ? currentYearObj.academicYear : (yearsData[0]?.academicYear || "");
                setFormData(prev => ({ ...prev, academicYear: initialYear }));

                // --- CHANGE HERE: Initialize with 1 empty row by default ---
                setFeeRows([{
                    tempId: Date.now(),
                    headId: "",
                    amount: "",
                    isExisting: false
                }]);
            }

            setTeacherList(availableTeachers);

        } catch (error) {
            console.error("Error initializing form:", error);
        }
    };

    // --- Validation Logic ---
    const validateForm = () => {
        const newErrors = {};

        // 1. Class Name (Mandatory, no empty space)
        if (!formData.className || !formData.className.trim()) {
            newErrors.className = "Class Name is required.";
        }

        // 2. Capacity (Mandatory, Number > 0)
        if (!formData.capacity) {
            newErrors.capacity = "Capacity is required.";
        } else if (Number(formData.capacity) <= 0) {
            newErrors.capacity = "Capacity must be greater than 0.";
        }

        // 3. Min Age (Mandatory, Number > 0)
        if (!formData.ageMinMonths) {
            newErrors.ageMinMonths = "Min Age is required.";
        } else if (Number(formData.ageMinMonths) <= 0) {
            newErrors.ageMinMonths = "Min Age must be greater than 0.";
        }

        // 4. Max Age (Mandatory, Number > Min Age)
        if (!formData.ageMaxMonths) {
            newErrors.ageMaxMonths = "Max Age is required.";
        } else if (Number(formData.ageMaxMonths) <= Number(formData.ageMinMonths)) {
            newErrors.ageMaxMonths = "Max Age must be greater than Min Age.";
        }

        // --- NEW VALIDATION: At least one fee head ---
        if (feeRows.length === 0) {
            // Set a general error or specific toast. 
            // Since we don't have a specific field for this in errors state usually, 
            // you might want to add a general 'feeStructure' key or handle it in UI.
            newErrors.feeStructure = "At least one Fee Head must be added.";
        }

        // 5. Fee Heads (Amount > 0)
        // We use the tempId to key the error so we know which row has the error
        feeRows.forEach(row => {
            if (!row.amount || Number(row.amount) <= 0) {
                newErrors[`fee_amount_${row.tempId}`] = "Amount must be > 0.";
            }
            if (!row.headId) {
                newErrors[`fee_head_${row.tempId}`] = "Please select a fee head.";
            }
        });

        // Check Teacher
        // if (!formData.teacherId) {
        //     newErrors.teacherId = "Class Teacher is required.";
        // }

        setErrors(newErrors);
        // Return true if no keys in newErrors
        return Object.keys(newErrors).length === 0;
    };

    // --- Handlers ---

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        // --- NEW LOGIC: If Academic Year changes, refetch teachers ---
        if (name === "academicYear") {
            // Reset selected teacher as they might be busy in the new year
            setFormData(prev => ({ ...prev, teacherId: "" }));

            const newTeachers = await fetchUnassignedTeachers(value);
            setTeacherList(newTeachers);
        }
    };

    const addFeeRow = () => {
        setFeeRows(prev => [
            ...prev,
            { tempId: Date.now(), headId: "", amount: "", isExisting: false }
        ]);
    };

    const removeFeeRow = (tempId) => {
        setFeeRows(prev => prev.filter(row => row.tempId !== tempId));
        // Clear potential errors for this deleted row
        setErrors(prev => {
            const newErrs = { ...prev };
            delete newErrs[`fee_amount_${tempId}`];
            delete newErrs[`fee_head_${tempId}`];
            return newErrs;
        });
    };

    const updateFeeRow = (tempId, field, value) => {
        setFeeRows(prev => prev.map(row => {
            if (row.tempId === tempId) {
                return { ...row, [field]: value };
            }
            return row;
        }));

        // Clear error for this row/field
        if (field === "amount" && errors[`fee_amount_${tempId}`]) {
            setErrors(prev => ({ ...prev, [`fee_amount_${tempId}`]: null }));
        }
        if (field === "headId" && errors[`fee_head_${tempId}`]) {
            setErrors(prev => ({ ...prev, [`fee_head_${tempId}`]: null }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // 1. Run Validation
        if (!validateForm()) {
            // Optional: Scroll to top or show a generic toast
            return;
        }

        const getFriendlyMessage = (rawError) => {
        if (!rawError) return "An unexpected error occurred.";
        
        const err = rawError.toLowerCase();

        // Database Constraint Mapping
        
        if (err.includes("violates foreign key constraint")) {
            return "Required reference data is missing. Please check your selections.";
        }

        // Custom PL/pgSQL RAISE message mapping
        if (err.includes("no active section found")) {
            return "This class doesn't have an active section. Please create a section first.";
        }
        if (err.includes("already exists for the academic year")) {
            return "A class with this name already exists for the selected year.";
        }

        // Default: return the server message if it's already somewhat readable
        return "Something went wrong. Please try again or contact support.";
    };

        const validFees = feeRows.filter(row => row.headId && row.amount > 0);

        const payload = {
            schoolId: SCHOOL_ID,
            academicYear: formData.academicYear,
            className: formData.className,
            capacity: Number(formData.capacity),
            ageMinMonths: Number(formData.ageMinMonths),
            ageMaxMonths: Number(formData.ageMaxMonths),
            active: formData.active,
            teacherId: formData.teacherId ? Number(formData.teacherId) : null,
            feeStructure: validFees.map(row => ({
                headId: Number(row.headId),
                amount: Number(row.amount)
            }))
        };

        if (isEditMode) {
            payload.classId = formData.classId;
        }

        try {
            const response = await axiosInstance.post("/api/v1/class/createOrUpdate", payload);
            const result = response.data;

            if (result.status === "Success") {
                setStatusPopup({
                    isOpen: true,
                    type: "success",
                    title: "Success!",
                    message: isEditMode ? "Class updated successfully." : "New class added successfully."
                });
            } else {
                setStatusPopup({
                    isOpen: true,
                    type: "error",
                    title: "Action Failed",
                    message: getFriendlyMessage(result.metadata?.error)
                });
            }
        } catch (error) {
        // --- CATCH BLOCK ---
        console.error("Error saving class:", error);
        
        const errMsgFromServer = error.response?.data?.metadata?.error || error.message;
        
        setStatusPopup({
            isOpen: true,
            type: "error",
            title: "System Error",
            message: getFriendlyMessage(errMsgFromServer)
        });
    }
    };

    const closeStatusPopup = () => {
        setStatusPopup(prev => ({ ...prev, isOpen: false }));
        if (statusPopup.type === "success") {
            navigate(-1);
        }
    };

    // Style for error text
    const errorStyle = { color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" };

    return (
        <div className="mainpro">
            <div className="container">

                <div className="addfee-head" style={{ justifyContent: 'space-between', alignItems: "center", gap: '20px' }}>
                    <div></div>
                    <button className="btn btn-primary" onClick={() => navigate("/admin/class-fees")}>
                        Class List
                    </button>
                </div>

                <div className="whitebox">
                    <form onSubmit={handleSave}>

                        <div className="formbox stapform">
                            <ul>
                                <li>
                                    <div className="form-group">
                                        <label>Academic Year <span className="text-danger">*</span></label>
                                        <select
                                            name="academicYear"
                                            className="form-control"
                                            value={formData.academicYear}
                                            onChange={handleInputChange}
                                            disabled={isEditMode}
                                        >
                                            <option value="">-- Select Year --</option>
                                            {academicYearsList.map(year => (
                                                <option key={year.academicYear} value={year.academicYear}>
                                                    {year.academicYear} {year.isCurrent === 'Y' ? '(Current)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </li>
                                <li>
                                    <div className="form-group">
                                        <label>Class Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            name="className"
                                            className="form-control"
                                            value={formData.className}
                                            onChange={handleInputChange}
                                            style={errors.className ? { borderColor: '#dc3545' } : {}}
                                        />
                                        {errors.className && <div className="invalid-feedback d-block">{errors.className}</div>}
                                    </div>
                                </li>
                                <li>
                                    <div className="form-group">
                                        <label>Class Teacher </label>
                                        <select
                                            name="teacherId"
                                            className="form-control"
                                            value={formData.teacherId}
                                            onChange={handleInputChange}
                                            style={errors.teacherId ? { borderColor: '#dc3545' } : {}}
                                        >
                                            <option value="">-- Select Teacher --</option>
                                            {teacherList.map(t => (<option key={t.teacherId} value={t.teacherId}>{t.fullName}</option>))}
                                        </select>
                                        {errors.teacherId && <div className="invalid-feedback d-block">{errors.teacherId}</div>}
                                    </div>
                                </li>
                                <li>
                                    <div className="form-group">
                                        <label>Capacity <span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            name="capacity"
                                            className="form-control"
                                            value={formData.capacity}
                                            onChange={handleInputChange}
                                            style={errors.capacity ? { borderColor: '#dc3545' } : {}}
                                        />
                                        {errors.capacity && <div className="invalid-feedback d-block">{errors.capacity}</div>}
                                    </div>
                                </li>
                                <li>
                                    <div className="form-group">
                                        <label>Min Age (Months) <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="number"
                                            name="ageMinMonths"
                                            className="form-control"
                                            value={formData.ageMinMonths}
                                            onChange={handleInputChange}
                                            style={errors.ageMinMonths ? { borderColor: '#dc3545' } : {}}
                                        />
                                        {errors.ageMinMonths && <div className="invalid-feedback d-block">{errors.ageMinMonths}</div>}
                                    </div>
                                </li>
                                <li>
                                    <div className="form-group">
                                        <label>Max Age (Months) <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="number"
                                            name="ageMaxMonths"
                                            className="form-control"
                                            value={formData.ageMaxMonths}
                                            onChange={handleInputChange}
                                            style={errors.ageMaxMonths ? { borderColor: '#dc3545' } : {}}
                                        />
                                        {errors.ageMaxMonths && <div className="invalid-feedback d-block">{errors.ageMaxMonths}</div>}
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <h4>Fee Structure</h4>
                        {feeRows.map((row) => (
                            <div className="formbox stapform feeadd" key={row.tempId}>
                                {!row.isExisting && feeRows.length > 1 && (
                                    <button className="deletebtn" onClick={() => removeFeeRow(row.tempId)} title="Remove" ><X size={16} /></button>
                                )}
                                <ul>
                                    <li>
                                        <div className="form-group">
                                            <label>
                                                Fee Head <span className="text-danger">*</span>{" "}
                                                {row.isExisting && (
                                                    <span style={{ color: "green", fontSize: "11px" }}>(Existing)</span>
                                                )}
                                            </label>
                                            <select
                                                className="form-control"
                                                value={row.headId}
                                                disabled={row.isExisting}
                                                onChange={(e) => updateFeeRow(row.tempId, "headId", e.target.value)}
                                                style={errors[`fee_head_${row.tempId}`] ? { borderColor: '#dc3545' } : {}}
                                            >
                                                <option value="">-- Select Head --</option>
                                                {feeHeadsMaster
                                                    .filter(
                                                        h =>
                                                            !selectedHeadIds.includes(h.headId) ||
                                                            h.headId === Number(row.headId)
                                                    )
                                                    .map(h => (
                                                        <option key={h.headId} value={h.headId}>
                                                            {h.headName}
                                                        </option>
                                                    ))}
                                            </select>
                                            {errors[`fee_head_${row.tempId}`] && <div className="invalid-feedback d-block">{errors[`fee_head_${row.tempId}`]}</div>}
                                        </div>
                                    </li>
                                    <li>
                                        <div className="form-group">
                                            <label>
                                                Amount (₹) <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={row.amount}
                                                onChange={(e) => updateFeeRow(row.tempId, "amount", e.target.value)}

                                            />
                                            {errors[`fee_amount_${row.tempId}`] && <div className="invalid-feedback d-block">{errors[`fee_amount_${row.tempId}`]}</div>}
                                        </div>
                                    </li>
                                </ul>

                                {/* Fee Head */}


                                {/* Amount */}

                            </div>
                        ))}


                        {/* Add Button */}
                        {feeRows.length < feeHeadsMaster.length && (
                            <div  >
                                <button type="button" onClick={addFeeRow} ><Plus size={16} /> Add Fee Head</button>
                            </div>
                        )}

                        {/* Footer Buttons */}
                        <div >
                            <button type="button" className="btn " onClick={() => navigate(-1)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">
                                {isEditMode ? "Update Class" : "Create Class"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {statusPopup.isOpen && (
                <Popup
                    title={statusPopup.title}
                    closeOnOutsideClick={true}
                    onClose={closeStatusPopup}
                    onSave={closeStatusPopup}
                    saveText="OK"
                >
                    <div >
                        {statusPopup.type === "success" ? (
                            <CheckCircle size={50} color="green" style={{ marginBottom: '15px' }} />
                        ) : (
                            <XCircle size={50} color="red" style={{ marginBottom: '15px' }} />
                        )}
                        <p style={{ fontSize: "16px", fontWeight: "500" }}>{statusPopup.message}</p>
                    </div>
                </Popup>
            )}
        </div>
    );
}