import React, { useEffect, useState } from "react";
import axiosInstance from "../../utills/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import useAcademicYears from "../../hooks/useAcademicYears";
import useSyllabusByClassAndAcademic from "../../hooks/useSyllabusByClassAndAcademic";
import useClasses from "../../hooks/useClasses";
import { X } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

export default function LessonPlanFormPage({ isPopup = false, editId, onSuccess }) {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const id = editId || paramId;
    const isEdit = Boolean(id);

    const { academicYears } = useAcademicYears();
    const [academicYear, setAcademicYear] = useState("");
    const { classes, loading: loadingClasses } = useClasses(academicYear);

    const [classId, setClassId] = useState("");
    const { syllabuses } = useSyllabusByClassAndAcademic(classId, academicYear);

    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();
    const [noSyllabus, setNoSyllabus] = useState(false);
    const [dateErrors, setDateErrors] = useState({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [formErrors, setFormErrors] = useState({});


    const [lessonRows, setLessonRows] = useState([
        { day_no: "", plan_date: "", overall_theme: "" }
    ]);

    const [formData, setFormData] = useState({
        syllabus_id: "",
        class_id: "",
        // section_id: "",
        status: "PUBLISHED"
    });

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (!classId) return;

        setNoSyllabus(false);
        setFormData(prev => ({
            ...prev,
            syllabus_id: "",
        }));

    }, [classId]);


    useEffect(() => {
        if (!classId || !academicYear) return;

        if (syllabuses.length === 0) {
            setNoSyllabus(true);
            setFormData(prev => ({
                ...prev,
                syllabus_id: "",
            }));
        } else {
            setNoSyllabus(false);

            if (syllabuses.length === 1) {
                setFormData(prev => ({
                    ...prev,
                    syllabus_id: syllabuses[0].syllabusId
                }));
            }
        }
    }, [syllabuses, classId, academicYear]);

    useEffect(() => {
        if (!isEdit) return;

        const loadEdit = async () => {
            const res = await axiosInstance.get(
                `/api/v1/daily-lesson-plan/session-id/${id}`
            );

            const p = res.data?.data;

            const sylRes = await axiosInstance.get(
                `/api/v1/syllabus/${p.syllabusId}`
            );

            const syllabus = sylRes.data?.data;

            setAcademicYear(syllabus.academicYear);
            setClassId(p.classId);

            setLessonRows([{
                day_no: p.dayNo,
                plan_date: p.planDate,
                overall_theme: p.overallTheme || ""
            }]);

            setFormData({
                syllabus_id: p.syllabusId,
                class_id: p.classId,
                // section_id: p.sectionId,
                status: p.status
            });
        };

        loadEdit();
    }, [id]);

    /* ================= ROW HANDLERS ================= */
    const addLessonRow = () => {
        setLessonRows(prev => [
            ...prev,
            { day_no: "", plan_date: "", overall_theme: "" }
        ]);
    };

    const removeLessonRow = index => {
        setLessonRows(prev => prev.filter((_, i) => i !== index));
    };

    const handleRowChange = (index, field, value) => {
        setLessonRows(prev => {
            const copy = [...prev];
            copy[index][field] = value;
            return copy;
        });

        setFormErrors(prev => {
            const copy = { ...prev };
            delete copy[`${field}_${index}`];
            return copy;
        });

    };

    const validateForm = () => {
        const errors = {};

        if (!academicYear) {
            errors.academicYear = "Academic Year is required";
        }

        if (!formData.class_id) {
            errors.class_id = "Class is required";
        }

        if (!formData.syllabus_id) {
            errors.syllabus_id = "Syllabus is required";
        }

        lessonRows.forEach((row, index) => {
            if (!row.day_no) {
                errors[`day_no_${index}`] = "Day No is required";
            }

            // if (!row.plan_date) {
            //     errors[`plan_date_${index}`] = "Plan Date is required";
            // }

            if (!row.overall_theme.trim()) {
                errors[`overall_theme_${index}`] = "Overall Theme is required";
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const handleSubmit = async () => {

        setHasSubmitted(true);

        if (!validateForm()) {
            return;
        }

        const newErrors = {};

        lessonRows.forEach((row, index) => {
            if (!row.plan_date) return;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const selected = new Date(row.plan_date);
            selected.setHours(0, 0, 0, 0);

            if (selected < today) {
                newErrors[index] = "Plan date cannot be past";
            }
        });

        setDateErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return;
        }
        const payload = lessonRows.map(row => ({
            syllabusId: Number(formData.syllabus_id),
            classId: Number(formData.class_id),
            // sectionId: formData.section_id || null,
            dayNo: Number(row.day_no),
            planDate: row.plan_date || null,
            overallTheme: row.overall_theme,
            status: formData.status
        }));

        try {
            if (isEdit) {
                await axiosInstance.put(`/api/v1/daily-lesson-plan/${id}`, payload[0]);
            } else {
                await axiosInstance.post("/api/v1/daily-lesson-plan/create-multiple", payload);
            }

            showNotification({
                message: isEdit
                    ? "Lesson Plan updated successfully"
                    : "Lesson Plan added successfully",
                type: "success",
            });

            if (isPopup && onSuccess) {
                onSuccess();
            } else {
                navigate("/admin/lesson-plan-list");
            }

        } catch (err) {
            showNotification({
                message:
                    err.response?.data?.metadata?.planDate ||
                    "Failed to save lesson plan",
                type: "error",
            });
            console.error("Lesson Plan save error: ", err);
        }
    };


    const renderFormFields = () => (
        <>
            <div className="formbox stapform lp-inputbox">
                <ul>
                    <li>
                        <div className="form-group">
                            <label>Academic Year <span className="text-danger">*</span></label>
                            <select
                                className={`form-control ${formErrors.academicYear ? "is-invalid" : ""}`}
                                value={academicYear}
                                onChange={e => {
                                    setAcademicYear(e.target.value);
                                    setClassId("");
                                    setFormData(prev => ({
                                        ...prev,
                                        class_id: "",
                                        syllabus_id: "",
                                    }));
                                }}

                            >
                                <option value="">Select Academic Year</option>
                                {academicYears
                                    .filter(y => y.isCurrentActive === "Y")
                                    .map(y => (
                                        <option key={y.academicYear} value={y.academicYear}>
                                            {y.academicYear}
                                        </option>
                                    ))}

                            </select>
                            {formErrors.academicYear && (
                                <div className="invalid-feedback">
                                    {formErrors.academicYear}
                                </div>
                            )}
                        </div>
                    </li>

                    <li>
                        <div className="form-group">
                            <label>Class <span className="text-danger">*</span></label>
                            <select
                                className={`form-control ${formErrors.class_id ? "is-invalid" : ""}`}
                                value={formData.class_id}
                                disabled={!academicYear || loadingClasses}
                                onChange={e => {
                                    setClassId(e.target.value);
                                    setFormData(prev => ({
                                        ...prev,
                                        class_id: e.target.value,
                                        syllabus_id: "",
                                    }));
                                }}
                            >
                                <option value="">
                                    {!academicYear
                                        ? "Select Year First"
                                        : loadingClasses
                                            ? "Loading classes..."
                                            : "Select Class"}
                                </option>

                                {classes.map(c => (
                                    <option key={c.classId} value={c.classId}>
                                        {c.className}
                                    </option>
                                ))}
                            </select>

                            {formErrors.class_id && (
                                <div className="invalid-feedback">
                                    {formErrors.class_id}
                                </div>
                            )}
                        </div>
                    </li>

                    <li>
                        <div className="form-group">
                            <label>Syllabus <span className="text-danger">*</span></label>
                            {/* <select className={`form-control ${noSyllabus ? "is-invalid" : ""}`}
                                disabled
                                value={formData.syllabus_id}>
                                <option value="">Select Syllabus</option>
                                {syllabuses.map(s => (
                                    <option key={s.syllabusId} value={s.syllabusId}>
                                        {s.syllabusName}
                                    </option>
                                ))}
                            </select> */}
                            <select
                                className={`form-control ${formErrors.syllabus_id ? "is-invalid" : ""}`}
                                value={formData.syllabus_id}
                                onChange={e =>
                                    setFormData(prev => ({
                                        ...prev,
                                        syllabus_id: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select Syllabus</option>
                                {syllabuses.map(s => (
                                    <option key={s.syllabusId} value={s.syllabusId}>
                                        {s.syllabusName}
                                    </option>
                                ))}
                            </select>

                            {noSyllabus && (
                                <div className="invalid-feedback">
                                    No syllabus assigned
                                </div>
                            )}
                        </div>
                    </li>
                </ul>
            </div>

            {/* ===== DAY ROWS ===== */}
            {lessonRows.map((row, index) => (
                <div className="formbox stapform dayadd lp-descbox" key={index}>
                    <ul>
                        <li className="fullsec">
                            <div className="form-group">
                                <label>Day No <span className="text-danger">*</span></label>
                                <input
                                    type="number"
                                    placeholder="Enter Day No"
                                    className={`form-control ${formErrors[`day_no_${index}`] ? "is-invalid" : ""}`}
                                    value={row.day_no}
                                    min={1}
                                    onChange={e => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) >= 1) {
                                            handleRowChange(index, "day_no", value);
                                        }
                                    }}
                                />
                                {formErrors[`day_no_${index}`] && (
                                    <div className="invalid-feedback">
                                        {formErrors[`day_no_${index}`]}
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Plan Date</label>
                                <input
                                    type="date"
                                    className={`form-control ${formErrors[`plan_date_${index}`] || dateErrors[index] ? "is-invalid" : ""}`}
                                    value={row.plan_date}
                                    min={!isEdit ? today : undefined}
                                    onChange={e =>
                                        handleRowChange(index, "plan_date", e.target.value)
                                    }
                                />
                                {dateErrors[index] && (
                                    <div className="invalid-feedback d-block">
                                        {dateErrors[index]}
                                    </div>
                                )}

                                {formErrors[`plan_date_${index}`] && (
                                    <div className="invalid-feedback d-block">
                                        {formErrors[`plan_date_${index}`]}
                                    </div>
                                )}


                            </div>

                        </li>

                        <li>
                            <div className="form-group themedesc-count">
                                <label>Overall Theme <span className="text-danger">*</span></label>
                                <textarea
                                    className={`form-control ${formErrors[`overall_theme_${index}`] ? "is-invalid" : ""}`}
                                    placeholder="Write Description..."
                                    value={row.overall_theme}
                                    onChange={e =>
                                        handleRowChange(index, "overall_theme", e.target.value)
                                    }
                                />
                                <small>{row.overall_theme.length} / 100 </small>

                                {formErrors[`overall_theme_${index}`] && (
                                    <div className="invalid-feedback d-block">
                                        {formErrors[`overall_theme_${index}`]}
                                    </div>
                                )}
                            </div>
                        </li>
                    </ul>

                    {lessonRows.length > 1 && (
                        <button className="deletebtn" onClick={() => removeLessonRow(index)} >
                            <X size={16} />
                        </button>
                    )}
                </div>
            ))}

            {!isEdit && (
                <>
                    <div className="text-end">
                        <button className=" " onClick={addLessonRow}>
                            + Add Another Day
                        </button>
                    </div>
                </>
            )}

            {/* ===== STATUS & SAVE ===== */}
            <div className="formbox">
                <div className="form-group lp-statusbox">
                    <label>Status <span className="text-danger">*</span></label>
                    <select
                        className="form-control"
                        value={formData.status}
                        onChange={e =>
                            setFormData(prev => ({ ...prev, status: e.target.value }))
                        }
                    >
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                    </select>


                </div>
            </div>
            <div className="da-savebox">
                <button onClick={handleSubmit}
                    disabled={
                        loading ||
                        !formData.class_id ||
                        !formData.syllabus_id
                    }
                >
                    {loading ? "Saving..." : "Save"}
                </button>
            </div>
        </>
    )

    /* ================= UI ================= */

    if (isPopup) {
        return renderFormFields();
    }

    return (
        <div className="mainpro">
            <div className="container">
                <button
                    className="btn btn-primary mb-3"
                    onClick={() => navigate("/admin/lesson-plan-list")}
                >
                    Lesson Plan List
                </button>
                <div className="whitebox">
                    {renderFormFields()}
                </div>
            </div>
        </div>
    );


}
