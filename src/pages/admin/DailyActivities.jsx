import React, { useEffect, useState } from "react";
import axiosInstance from "../../utills/axiosInstance";
import useAcademicYears from "../../hooks/useAcademicYears";
import { useNavigate } from "react-router-dom";
import useSyllabusByClassAndAcademic from "../../hooks/useSyllabusByClassAndAcademic";
import { useNotification } from "../../context/NotificationContext";
import useClasses from "../../hooks/useClasses";

export default function DailyActivities() {
    const [form, setForm] = useState({
        academicYear: "",
        activityId: "",
        sessionPlanId: "",
        classId: "",
        sectionId: "",
        syllabusId: "",
        topicId: "",
        subjectId: "",
        textBookId: "",
        activityType: "",
        activityTitle: "",
        activityDetails: "",
        referencePages: "",
        referenceMaterials: "",
        materialsRequired: "",
        startTime: "",
        endTime: "",
        durationInMins: "",
        visibleToParents: "Y",
        visibleTill: "",
        completionStatus: "PENDING",
        completionDate: "",
        completionTime: "",
        sequenceOrder: ""

    });

    const [dropdowns, setDropdowns] = useState({
        classes: [],
        sections: [],
        syllabuses: [],
        subjects: [],
        weeks: [],
        allTopics: [],
        topics: [],
        activityTypes: [],
        sessionPlans: []
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { academicYears } = useAcademicYears();
    const { syllabuses, loadingSyllabus } = useSyllabusByClassAndAcademic(form?.classId, form?.academicYear);
    const { showNotification } = useNotification();
    const { classes, loading: loadingClasses } = useClasses(form.academicYear);
    const selectedAcademicYear = academicYears.find(y => y?.academicYear === form?.academicYear);

    const academicStartDate = selectedAcademicYear?.startDate;
    const academicEndDate = selectedAcademicYear?.endDate;

    const today = new Date().toISOString().split("T")[0];





    useEffect(() => {
        setDropdowns(prev => ({
            ...prev,
            syllabuses: syllabuses || [],
            subjects: [],
            allTopics: [],
            topics: []
        }));
    }, [syllabuses]);


    /* ================= CLASS CHANGE ================= */
    const handleClassChange = (e) => {
        const classId = e.target.value;

        setForm(prev => ({
            ...prev,
            classId,
            syllabusId: "",
            subjectId: "",
            topicId: "",
            textBookId: ""
        }));
    };

    const loadSyllabusSubjects = async (syllabusId) => {
        if (!syllabusId) return;

        const res = await axiosInstance.get(
            `/api/v1/syllabus-topics/syllabus-id/${syllabusId}`
        );

        const topics = res.data?.data || [];

        const subjects = [
            ...new Map(
                topics.map(t => [
                    t.subjectId,
                    { subjectId: t.subjectId, subjectName: t.subjectName }
                ])
            ).values()
        ];

        setDropdowns(prev => ({
            ...prev,
            subjects,
            weeks: [],
            topics: []
        }));
    };


    const loadTopicsBySyllabusAndSubject = async (syllabusId, subjectId) => {
        if (!syllabusId || !subjectId) return;

        const res = await axiosInstance.get(
            "/api/v1/syllabus-topics/syllabus-id/subject-id",
            {
                params: { syllabusId, subjectId }
            }
        );

        const weeks = res.data?.data?.weeks || [];

        const topics = weeks.flatMap(w =>
            w.topics.map(t => ({
                ...t,
                weekNumber: w.weekNumber
            }))
        );

        setDropdowns(prev => ({
            ...prev,
            weeks,
            topics
        }));
    };

    const handleSyllabusChange = async (e) => {
        const syllabusId = e.target.value;

        setForm(prev => ({
            ...prev,
            syllabusId,
            subjectId: "",
            topicId: "",
            textBookId: ""
        }));

        // loadSyllabusTopics(syllabusId);
        loadSyllabusSubjects(syllabusId);
        loadSessionPlans(form.classId, syllabusId);
    };

    useEffect(() => {
        if (!syllabuses || syllabuses.length === 0) return;

        const autoSyllabusId = syllabuses[0].syllabusId;

        setForm(prev => ({
            ...prev,
            syllabusId: autoSyllabusId,
            subjectId: "",
            topicId: "",
            textBookId: ""
        }));

        // loadSyllabusTopics(autoSyllabusId);
        loadSyllabusSubjects(autoSyllabusId);

        loadSessionPlans(form.classId, autoSyllabusId);
    }, [syllabuses]);

    /* ================= FETCH ACTIVITY TYPES ================= */


    useEffect(() => {
        axiosInstance
            .get("/api/v1/share/all-activity-types")
            .then(res => {
                setDropdowns(prev => ({
                    ...prev,
                    activityTypes: res.data.data || []
                }));
            })
            .catch(err => console.error("Activity types error", err));
    }, []);


    /* ================= TOPIC CHANGE ================= */
    const handleTopicChange = (e) => {
        const topicId = e.target.value;
        const topic = dropdowns.topics.find(
            t => String(t.topicId) === String(topicId)
        );

        if (!topic) return;

        setForm(prev => ({
            ...prev,
            topicId,
            textBookId: topic.textBookId
        }));
        clearError("topicId");
    };



    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => {
            let updated = { ...prev, [name]: value };

            if (name === "startTime" || name === "endTime") {
                updated.durationInMins = calculateDuration(
                    name === "startTime" ? value : prev.startTime,
                    name === "endTime" ? value : prev.endTime
                );
            }

            return updated;
        });

    };


    const loadSessionPlans = async (classId, syllabusId, sectionId = null) => {
        if (!classId || !syllabusId) return;

        try {
            const res = await axiosInstance.get(
                "/api/v1/daily-lesson-plan/class-id/section-id/syllabus-id/",
                {
                    params: {
                        classId,
                        syllabusId,
                        ...(sectionId && { sectionId })
                    }
                }
            );

            console.log("Lesson plans response:", res.data);

            setDropdowns(prev => ({
                ...prev,
                sessionPlans: res.data?.data || []
            }));
        } catch (err) {
            console.error("Session plan fetch error", err);
            setDropdowns(prev => ({ ...prev, sessionPlans: [] }));
        }
    };







    /* ================= SAVE ================= */
    const saveActivity = async () => {
        const newErrors = {};

        if (!form.classId)
            newErrors.classId = "Please select class";


        if (!form.topicId)
            newErrors.topicId = "Please select topic";

        if (!form.activityType)
            newErrors.activityType = "Please select activity type";

        if (!form.activityTitle.trim())
            newErrors.activityTitle = "Activity title is required";

        if (!form.durationInMins || Number(form.durationInMins) <= 0)
            newErrors.durationInMins = "Duration must be greater than 0";

        if (!form.subjectId || !form.textBookId)
            newErrors.topicId = "Invalid topic mapping";

        if (Number(form.sequenceOrder || 1) <= 0)
            newErrors.sequenceOrder = "Sequence order must be greater than 0";

        if (!form.sessionPlanId || Number(form.sessionPlanId) <= 0) {
            newErrors.sessionPlanId = "Please select session plan";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        // const resolvedSessionPlanId = Number(form.sessionPlanId) || 1;

        const formatTime = (time) => {
            if (!time) return null;
            let [h, m] = time.split(":");
            h = parseInt(h, 10);
            const ampm = h >= 12 ? "PM" : "AM";
            h = h % 12 || 12;
            return `${h}:${m} ${ampm}`;
        };

        const payload = {
            sessionPlanId: Number(form.sessionPlanId),
            topicId: Number(form.topicId),
            subjectId: Number(form.subjectId),
            textBookId: Number(form.textBookId),
            classId: Number(form.classId),
            referencePages: form.referencePages || "",
            activityType: form.activityType,
            activityTitle: form.activityTitle.trim(),
            activityDetails: form.activityDetails || "",
            referenceMaterials: form.referenceMaterials || "",
            visibleToParents: form.visibleToParents,
            visibleTill: form.visibleTill || null,
            startTime: formatTime(form.startTime),
            endTime: formatTime(form.endTime),
            durationInMins: Number(form.durationInMins),
            materialsRequired: form.materialsRequired || "",
            sequenceOrder: Number(form.sequenceOrder || 1),
            completionDate: form.completionDate || null,
            completionTime: formatTime(form.completionTime)
        };

        try {
            await axiosInstance.post("/api/v1/daily-activities/create", payload);
            showNotification({
                message: "Activity created successfully",
                type: "success",
            });

            navigate("/admin/daily-activities-list");
            resetForm();
        } catch (err) {
            console.error(err);
            showNotification({
                message: "Failed to create activity",
                type: "success",
            });
        }
    };


    useEffect(() => {
        if (form.durationInMins > 0) {
            clearError("durationInMins");
        }
    }, [form.durationInMins]);


    const resetForm = () => {
        setForm({
            academicYear: "",
            activityId: "",
            sessionPlanId: "",
            classId: "",
            syllabusId: "",
            subjectId: "",
            topicId: "",
            textBookId: "",
            activityType: "",
            activityTitle: "",
            activityDetails: "",
            referencePages: "",
            referenceMaterials: "",
            materialsRequired: "",
            startTime: "",
            endTime: "",
            durationInMins: "",
            visibleToParents: "Y",
            visibleTill: "",
            completionStatus: "PENDING",
            completionDate: "",
            completionTime: "",
            sequenceOrder: ""
        });

        setDropdowns(prev => ({
            ...prev,
            sections: [],
            syllabuses: [],
            subjects: [],
            allTopics: [],
            topics: [],
            sessionPlans: []
        }));
    };


    const calculateDuration = (start, end) => {
        if (!start || !end) return "";

        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);

        let startMinutes = sh * 60 + sm;
        let endMinutes = eh * 60 + em;

        // If end time is next day
        if (endMinutes < startMinutes) {
            endMinutes += 24 * 60;
        }

        return endMinutes - startMinutes;
    };

    const noSyllabusFound =
        form.academicYear &&
        form.classId &&
        !loadingSyllabus &&
        dropdowns.syllabuses.length === 0;

    const clearError = (field) => {
        setErrors(prev => {
            if (!prev[field]) return prev;
            const copy = { ...prev };
            delete copy[field];
            return copy;
        });
    };

    return (
        <div className="container da-mainsec">




            <div className="whitebox">
                <div className="da-heading"> Class & Lesson Details </div>
                <div className="formbox searchsec stapform">
                    <ul>
                        <li>
                            <div className="form-group">
                                <label>Academic Year</label>
                                <select
                                    className="form-control"
                                    value={form.academicYear}
                                    onChange={(e) => {
                                        setForm(prev => ({
                                            ...prev,
                                            academicYear: e.target.value,
                                            classId: "",
                                            syllabusId: "",
                                            subjectId: "",
                                            topicId: ""
                                        }));

                                        setErrors({});
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
                                <label className="form-label">Class</label>
                                <select
                                    className={`form-control ${errors.classId ? "is-invalid" : ""}`}
                                    value={form.classId}
                                    disabled={!form.academicYear || loadingClasses}
                                    onChange={(e) => {
                                        handleClassChange(e);
                                        clearError("classId");
                                    }}
                                >

                                    <option value="">
                                        {!form.academicYear
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
                                {errors.classId && (
                                    <div className="error-absolute">{errors.classId}</div>
                                )}
                            </div>
                        </li>


                        <li>
                            <div className="form-group">
                                <label className="form-label">Syllabus</label>

                                <select
                                    className={`form-control ${noSyllabusFound ? "is-invalid" : ""}`}
                                    value={form.syllabusId}
                                    onChange={handleSyllabusChange}
                                    disabled={form.syllabusId == 0 || !form.classId || loadingSyllabus}
                                >
                                    <option value="">
                                        {loadingSyllabus ? "Loading syllabus..." : "Select Syllabus"}
                                    </option>

                                    {dropdowns.syllabuses.map(s => (
                                        <option key={s.syllabusId} value={s.syllabusId}>
                                            {s.syllabusName}
                                        </option>
                                    ))}
                                </select>

                                {noSyllabusFound && (
                                    <div className="invalid-feedback">
                                        No syllabus available
                                    </div>
                                )}
                            </div>
                        </li>

                        <li>
                            <div className="form-group">
                                <label className="form-label">Subject</label>

                                <select
                                    className="form-control"
                                    value={form.subjectId}
                                    disabled={!form.syllabusId}
                                    onChange={(e) => {
                                        const subjectId = e.target.value;

                                        setForm(prev => ({
                                            ...prev,
                                            subjectId,
                                            topicId: "",
                                            textBookId: ""
                                        }));

                                        loadTopicsBySyllabusAndSubject(form.syllabusId, subjectId);
                                    }}
                                >


                                    <option value="">Select Subject</option>
                                    {dropdowns.subjects?.map(s => (
                                        <option key={s.subjectId} value={s.subjectId}>
                                            {s.subjectName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </li>


                        <li>
                            <div className="form-group">
                                <label className="form-label">Topic</label>

                                <select
                                    className="form-control"
                                    value={form.topicId}
                                    disabled={!form.subjectId}
                                    onChange={handleTopicChange}
                                >
                                    <option value="">Select Topic</option>
                                    {dropdowns.topics.map(t => (
                                        <option key={t.topicId} value={t.topicId}>
                                            {t.topicName} (W-{t.weekNumber})
                                        </option>
                                    ))}
                                </select>

                            </div>
                        </li>

                        <li>
                            <div className="form-group">
                                <label className="form-label">Lesson Plan</label>
                                <select
                                    className={`form-control  ${errors.sessionPlanId ? "is-invalid" : ""}`}
                                    name="sessionPlanId"
                                    value={form.sessionPlanId}
                                    disabled={!form.topicId}
                                    onChange={(e) => {
                                        handleChange(e);
                                        clearError("sessionPlanId");
                                    }}
                                >
                                    <option value="">Select Lession Plan</option>

                                    {dropdowns.sessionPlans.map(sp => (
                                        <option key={sp.sessionPlanId} value={sp.sessionPlanId}>
                                            {sp.overallTheme || `Session Plan ${sp.sessionPlanId}`} (D-{sp.dayNo})
                                        </option>
                                    ))}
                                </select>

                                {errors.sessionPlanId && (
                                    <div className="error-absolute">{errors.sessionPlanId}</div>
                                )}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="whitebox">
                <div className="da-heading">
                    Activity Information
                </div>
                <div className="formbox searchsec dayadd">

                    <ul className="da-infosec">
                        <li className="fullsec">
                            <div className="form-group">
                                <label className="form-label">Activity Type</label>
                                <select className="form-control "
                                    name="activityType"
                                    value={form.activityType}
                                    onChange={(e) => {
                                        handleChange(e);
                                        clearError("activityType");
                                    }}>
                                    <option value="">Select Activity</option>
                                    {dropdowns.activityTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type.replaceAll("_", " ")}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Activity Title</label>
                                <input
                                    type="text"
                                    className={`form-control  ${errors.activityTitle ? "is-invalid" : ""}`}
                                    name="activityTitle"
                                    value={form.activityTitle}
                                    onChange={(e) => {
                                        handleChange(e);
                                        clearError("activityTitle");
                                    }}
                                />
                                {errors.activityTitle && (
                                    <div className="error-absolute">{errors.activityTitle}</div>
                                )}
                            </div>
                        </li>

                        <li>
                            <div className="form-group">
                                <label className="form-label">Activity Description</label>
                                <textarea className="form-control"
                                    name="activityDetails"
                                    placeholder="Describe what children will do today..."
                                    value={form.activityDetails}
                                    onChange={handleChange}
                                />
                            </div>
                        </li>
                    </ul>

                </div>
            </div>




            <div className="whitebox">
                <div className="da-heading">
                    Learning Resources
                </div>

                <div className="formbox searchsec">
                    <ul>
                        <li>
                            <div className="form-group">
                                <label className="form-label">Reference Pages</label>
                                <input
                                    className="form-control "
                                    name="referencePages"
                                    placeholder="Eg: Page 10-12"
                                    value={form.referencePages}
                                    onChange={handleChange}
                                />
                            </div>
                        </li>

                        <li>
                            <div className="form-group">
                                <label className="form-label">Reference Materials</label>
                                <input
                                    className="form-control "
                                    name="referenceMaterials"
                                    placeholder="Book / Chart / Video"
                                    value={form.referenceMaterials}
                                    onChange={handleChange}
                                />
                            </div>
                        </li>

                        <li>
                            <div className="form-group">
                                <label className="form-label">Materials Required</label>
                                <input
                                    className="form-control "
                                    name="materialsRequired"
                                    placeholder="Crayons, toys, paper"
                                    value={form.materialsRequired}
                                    onChange={handleChange}
                                />
                            </div>
                        </li>
                    </ul>

                </div>
            </div>

            <div className="whitebox">
                <div className="da-heading">
                    Time & Visibility
                </div>

                <div className="formbox searchsec da-timevisiblesec">

                    <ul>
                        {/* <li>
                            <div className="form-group">
                                <label>Start Time</label>
                                <select
                                    className="form-control"
                                    name="startTime"
                                    value={form.startTime}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Start Time</option>

                                    {Array.from({ length: 24 }).map((_, h) =>
                                        ["00", "30"].map(m => {
                                            const value = `${String(h).padStart(2, "0")}:${m}`;

                                            const hour12 = h % 12 || 12;
                                            const ampm = h < 12 ? "AM" : "PM";
                                            const label = `${hour12}:${m} ${ampm}`;

                                            return (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            );
                                        })
                                    )}
                                </select>


                            </div>
                        </li>

                        <li>
                            <div className="form-group">
                                <label>End Time</label>
                                <select
                                    className="form-control"
                                    name="endTime"
                                    value={form.endTime}
                                    onChange={handleChange}
                                    disabled={!form.startTime}
                                >
                                    <option value="">Select End Time</option>

                                    {Array.from({ length: 24 }).map((_, h) =>
                                        ["00", "30"].map(m => {
                                            const value = `${String(h).padStart(2, "0")}:${m}`;

                                            if (form.startTime && value <= form.startTime) return null;

                                            const hour12 = h % 12 || 12;
                                            const ampm = h < 12 ? "AM" : "PM";
                                            const label = `${hour12}:${m} ${ampm}`;

                                            return (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            );
                                        })
                                    )}
                                </select>

                            </div>
                        </li> */}

                        <li>
                            <div className="form-group">
                                <label>Duration (mins)</label>
                                <input
                                    type="number"
                                    className={`form-control ${errors.durationInMins ? "is-invalid" : ""}`}
                                    name="durationInMins"
                                    value={form.durationInMins}
                                    onChange={(e) => {
                                        handleChange(e);
                                        clearError("durationInMins");
                                    }}
                                    min="1"
                                />


                                {errors.durationInMins && (
                                    <div className="error-absolute">{errors.durationInMins}</div>
                                )}

                            </div>
                        </li>

                        <li>
                            <div className="form-group">
                                <label>Visible to Parents</label>
                                <select
                                    className="form-control "
                                    name="visibleToParents"
                                    value={form.visibleToParents}
                                    onChange={handleChange}
                                >
                                    <option value="Y">Yes</option>
                                    <option value="N">No</option>
                                </select>
                            </div>
                        </li>

                        <li>

                            {/* <div className="form-group">
                                <label>Visible Till</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="visibleTill"
                                    value={form.visibleTill}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div> */}
                            <div className="form-group">
                                <label>Visible Till</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="visibleTill"
                                    value={form.visibleTill}
                                    onChange={handleChange}
                                    min={
                                        academicStartDate
                                            ? (academicStartDate > today ? academicStartDate : today)
                                            : today
                                    }
                                    max={academicEndDate || undefined}
                                    disabled={!form.academicYear}
                                />
                            </div>


                        </li>
                    </ul>

                </div>
            </div>
            <input type="hidden" value={form.subjectId} />
            <input type="hidden" value={form.textBookId} />
            <input type="hidden" value={form.sessionPlanId} />





            <div className="da-savebox">
                <button onClick={saveActivity}>
                    Save Activity
                </button>

                <button onClick={resetForm}>
                    Reset
                </button>
            </div>



        </div>
    );
}
