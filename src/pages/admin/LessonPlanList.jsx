import React, { useEffect, useState } from "react";
import axiosInstance from "../../utills/axiosInstance";
import { Plus, X, Pencil, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Popup from "../../components/Popup";
import LessonPlanFormPage from "./LessonPlanFormPage";
import { useNotification } from "../../context/NotificationContext";
import useAcademicYears from "../../hooks/useAcademicYears";
import useClasses from "../../hooks/useClasses";

export default function LessonPlanList() {
    const navigate = useNavigate();

    const [lessonPlans, setLessonPlans] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [allSyllabuses, setAllSyllabuses] = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [editId, setEditId] = useState(null);
    const { showNotification } = useNotification();

    const [academicYear, setAcademicYear] = useState("");
    const { academicYears } = useAcademicYears();
    const { classes, loading: loadingClasses } = useClasses(academicYear);




    const [filters, setFilters] = useState({
        classId: "",
    });

    /* ================= LOAD MASTER DATA ================= */

    useEffect(() => {
        const loadMasters = async () => {
            const syl = await axiosInstance.get("/api/v1/syllabus/all");

            setAllSyllabuses(syl.data?.data || []);
        };

        loadMasters();
    }, []);

    useEffect(() => {
        if (allSyllabuses.length) {
            fetchLessonPlans();
        }
    }, [allSyllabuses]);

    /* ================= FETCH LIST ================= */

    const fetchLessonPlans = async () => {
        try {
            setLoadingList(true);
            const res = await axiosInstance.get("/api/v1/daily-lesson-plan/all");
            const plans = res.data?.data || [];

            console.log("Fetched lesson plans:", plans);

            const enriched = plans.map(p => {
                const syllabus = allSyllabuses.find(s => s.syllabusId === p.syllabusId);

                return {
                    ...p,
                    academicYear: syllabus?.academicYear || "",
                };
            });

            setLessonPlans(enriched);
        } finally {
            setLoadingList(false);
        }
    };

    const getClassName = (id) =>
        classes.find(c => c.classId === id)?.className || "-";


    /* ================= FILTER ================= */

    const filteredLessonPlans = lessonPlans.filter(p => {
        const yearMatch =
            !academicYear || p.academicYear === academicYear;

        const classMatch =
            !filters.classId || p.classId === Number(filters.classId);

        return yearMatch && classMatch;
    });


    /* ================= DELETE ================= */

    const handleDelete = async (sessionId) => {
        if (!window.confirm("Delete this lesson plan?")) {
            return;
        }

        try {
            await axiosInstance.delete(
                `/api/v1/daily-lesson-plan/session-id/${sessionId}`
            );

            showNotification({
                message: "Lesson plan deleted successfully",
                type: "success",
            });

            fetchLessonPlans();
        } catch (error) {
            showNotification({
                message: "Failed to delete lesson plan",
                type: "error",
            });
        }
    };


    /* ================= UI ================= */

    return (
        <div className="mainpro">
            <div className="container">

                <button
                    className="btn btn-primary mb-3"
                    onClick={() => navigate("/admin/add-lesson-plan")}
                >
                    + Add Lesson Plan
                </button>

                <div className="whitebox">
                    <div className="formbox searchsec">
                        <ul>
                            <li>
                                <div className="form-group">
                                    <label>Academic Year</label>
                                    <select
                                        className="form-control"
                                        value={academicYear}
                                        onChange={e => {
                                            setAcademicYear(e.target.value);
                                            setFilters({ classId: "" });
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
                                </div>
                            </li>


                            <li>
                                <div className="form-group">
                                    <label>Filter by Class</label>
                                    <select
                                        className="form-control"
                                        value={filters.classId}
                                        disabled={!academicYear || loadingClasses}
                                        onChange={e =>
                                            setFilters({ ...filters, classId: e.target.value })
                                        }
                                    >
                                        <option value="">
                                            {!academicYear
                                                ? "Select Year First"
                                                : loadingClasses
                                                    ? "Loading classes..."
                                                    : "All Classes"}
                                        </option>

                                        {classes.map(c => (
                                            <option key={c.classId} value={c.classId}>
                                                {c.className}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </li>

                        </ul>
                    </div>
                </div>

                {loadingList ? (
                    <div className="text-center">Loading...</div>
                ) : filteredLessonPlans.length === 0 ? (
                    <div className="alert alert-info mt-3">
                        No lesson plans found
                    </div>
                ) : (
                    <div className="listsec syllabus-master">
                        <div className="listbox studentlist theading">
                            <div>Sl.</div>
                            <div>Syllabus</div>
                            <div>Class</div>
                            <div>Day</div>
                            <div>Plan Date</div>
                            <div>Theme</div>
                            <div>Status</div>
                            <div>Actions</div>
                        </div>
                        <ul>
                            {filteredLessonPlans.map((p, index) => (
                                <li key={p.sessionPlanId}>
                                    <div className="listbox studentlist">
                                        <div>{index + 1}</div>
                                        <div data-head="Syllabus">{p.syllabusName}</div>
                                        <div data-head="Class">{getClassName(p.classId)}</div>
                                        <div data-head="Day No">Day {p.dayNo}</div>
                                        <div data-head="Plan Date">{p.planDate}</div>
                                        <div data-head="Theme">{p.overallTheme}</div>
                                        <div data-head="Status">{p.status}</div>
                                        <div className="actionbtns">
                                            <button
                                                className="viewbtn"
                                                onClick={() => {
                                                    setEditId(p.sessionPlanId);
                                                    setActiveModal("EDIT_LESSON_PLAN");
                                                }}
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            {/* <button
                                                className="delete-btn"
                                                onClick={() => handleDelete(p.sessionPlanId)}
                                            >
                                                <X size={16} />
                                            </button> */}
                                        </div>

                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeModal === "EDIT_LESSON_PLAN" && (
                    <Popup
                        title="Edit Lesson Plan"
                        closeOnOutsideClick={false}
                        onClose={() => {
                            setActiveModal(null);
                            setEditId(null);
                        }}
                    >
                        <LessonPlanFormPage
                            isPopup
                            editId={editId}
                            onSuccess={() => {
                                setActiveModal(null);
                                setEditId(null);
                                fetchLessonPlans();
                            }}
                        />
                    </Popup>
                )}
            </div>
        </div>
    );
}
