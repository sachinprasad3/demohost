
// AddSyllabusTopics.jsx
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import useAcademicYears from "../../hooks/useAcademicYears";
import { useNotification } from "../../context/NotificationContext";
import useClasses from "../../hooks/useClasses";
import useSyllabusByClassAndAcademic from "../../hooks/useSyllabusByClassAndAcademic";
import axiosInstance from "../../utills/axiosInstance";
import { useParams, useNavigate, useLocation, Navigate } from "react-router-dom";

export default function AddSyllabusTopics({ }) {

    const { showNotification } = useNotification();

    /* ================= STATE ================= */

    const [errors, setErrors] = useState({});

    const [academicYear, setAcademicYear] = useState("");
    const [classId, setClassId] = useState("");
    const [selectedSyllabusId, setSelectedSyllabusId] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedTextbook, setSelectedTextbook] = useState("");

    const { academicYears } = useAcademicYears();
    const { classes, loading: loadingClasses } = useClasses(academicYear);

    const { syllabuses } = useSyllabusByClassAndAcademic(classId, academicYear);

    const [allSubjects, setAllSubjects] = useState([]);
    const [textbook, setTextbook] = useState([]);
    const navigate = useNavigate();

    const { state } = useLocation();
    const topicData = state?.topic;

    const { topicId } = useParams();
    const isEdit = Boolean(topicId);

    const emptySyllabusTemplate = [
        {
            topics: [
                {
                    topicName: "",
                    themeName: "",
                    description: "",
                    referencePages: "",
                    weekNumber: "",
                    estimatedDays: "",
                    topicSequence: ""
                }
            ]
        }
    ];

    const [syllabus, setSyllabus] = useState(emptySyllabusTemplate);

    const getError = (key) => errors?.[key];

    const prefillAcademicYear = state?.academicYear || "";
    const prefillClassId = state?.classId || "";
    const prefillSyllabusId = state?.syllabusId || "";

    const clearError = (key) => {
        setErrors(prev => {
            if (!prev[key]) return prev;
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
    };



    useEffect(() => {
        if (prefillAcademicYear && prefillClassId) {
            setAcademicYear(prefillAcademicYear);
            setClassId(prefillClassId);
        }
    }, [prefillAcademicYear, prefillClassId]);

    useEffect(() => {
        if (prefillSyllabusId) {
            setSelectedSyllabusId(prefillSyllabusId);
        }
    }, [prefillSyllabusId]);

    const fromSyllabusMaster = Boolean(
        state?.academicYear && state?.classId && state?.syllabusId
    );

    useEffect(() => {
        if (fromSyllabusMaster) {
            setAcademicYear(state.academicYear);
            setClassId(state.classId);
            setSelectedSyllabusId(state.syllabusId);
        }
    }, [fromSyllabusMaster]);


    useEffect(() => {
        if (!isEdit) return;

        axiosInstance
            .get(`/api/v1/syllabus-topics/${topicId}`)
            .then(res => {
                const t = res.data.data;

                setAcademicYear(t.academicYear);
                setClassId(t.classId);
                setSelectedSyllabusId(t.syllabusId);
                setSelectedSubject(t.subjectId);
                setSelectedTextbook(t.textBookId);

                setSyllabus([
                    {
                        topics: [
                            {
                                topicName: t.topicName,
                                themeName: t.themeName,
                                description: t.description || "",
                                referencePages: t.referencePages,
                                weekNumber: t.weekNumber,
                                estimatedDays: t.estimatedDays,
                                topicSequence: t.topicSequence,
                            }
                        ]
                    }
                ]);
            })
            .catch(() => {
                showNotification({
                    message: "Failed to load topic",
                    type: "error",
                });
            });
    }, [topicId]);

    /* ================= FETCH MASTER DATA ================= */

    useEffect(() => {
        axiosInstance
            .get("/api/v1/subject/activesubject")
            .then(res => setAllSubjects(res.data?.data || []));
    }, []);

    useEffect(() => {
        if (!classId || !selectedSubject) {
            setTextbook([]);
            setSelectedTextbook("");
            return;
        }

        fetchTextbook(classId, selectedSubject);
    }, [classId, selectedSubject]);



    useEffect(() => {
        if (syllabuses.length === 1) {
            setSelectedSyllabusId(syllabuses[0].syllabusId);
        } else {
            setSelectedSyllabusId("");
        }
    }, [syllabuses]);


    useEffect(() => {
        setClassId("");
        setSelectedSyllabusId("");
        setSelectedSubject("");
        setSelectedTextbook("");
    }, [academicYear]);


    const addChapter = () => {
        setSyllabus([
            ...syllabus,
            {
                topics: [
                    {
                        topicName: "",
                        themeName: "",
                        referencePages: "",
                        weekNumber: "",
                        estimatedDays: "",
                        topicSequence: "",
                        description: ""
                    }
                ]
            }
        ]);
    };

    const fetchTextbook = async (classId, subjectId) => {
        if (!classId || !subjectId) {
            setTextbook([]);
            return;
        }

        try {
            const res = await axiosInstance.get(
                "/api/v1/book/classId/subjectId",
                {
                    params: {
                        classId,
                        subjectId
                    }
                }
            );

            setTextbook(res.data?.data || []);
        } catch (err) {
            console.error("Failed to fetch textbooks", err);
            setTextbook([]);
        }
    };


    const updateTopic = (cIndex, tIndex, field, value) => {
        const updated = [...syllabus];
        updated[cIndex].topics[tIndex][field] = value;
        setSyllabus(updated);
    };

    /* ================= SAVE TOPIC ================= */


    const deleteChapter = (cIndex) => {
        const updated = [...syllabus];
        updated.splice(cIndex, 1);
        setSyllabus(updated);
    };

    const validateSequenceNo = async (weekNumber, sequence) => {
        try {
            const res = await axiosInstance.get(
                "/api/v1/syllabus-topics/all/topic-sequence",
                {
                    params: {
                        syllabusId: selectedSyllabusId,
                        subjectId: selectedSubject,
                        weekNumber
                    }
                }
            );
            const sequenceFromRes = res?.data?.data || [];

            if (sequenceFromRes.includes(Number(sequence))) {
                const subjectName = allSubjects.find((subject) => (subject?.subjectId === Number(selectedSubject)))?.subjectName
                showNotification({
                    message: `This sequence No. already exists for ${subjectName}  week No. ${weekNumber} Enter another one.`,
                    type: "warning",
                    duration: 2000
                });
                return {
                    valid: false,
                    message: `This sequence No. already exists for ${subjectName}  week No. ${weekNumber} Enter another one.`
                };
            }

            return { valid: true };
        } catch (error) {
            console.error("Error in validateSequenceNo", error);
            return {
                valid: false,
                message: "Unable to validate sequence"
            };
        }
    };

    const saveAllTopics = async () => {
        const isValid = await validateTopics();
        if (!isValid) return;

        try {
            const payload = [];

            syllabus.forEach((chapter, cIndex) => {
                chapter.topics.forEach((topic, tIndex) => {
                    payload.push({
                        syllabusId: Number(selectedSyllabusId),
                        subjectId: Number(selectedSubject),
                        textBookId: Number(selectedTextbook),

                        topicName: topic.topicName.trim(),
                        themeName: topic.themeName,
                        description: topic.description || "",

                        referencePages: topic.referencePages || "",
                        weekNumber: Number(topic.weekNumber),
                        estimatedDays: Number(topic.estimatedDays),
                        topicSequence: Number(topic.topicSequence),
                    });
                });
            });

            if (!payload.length) {
                showNotification({
                    message: "No topics to save",
                    type: "warning",
                });
                return;
            }


            await axiosInstance.post(
                "/api/v1/syllabus-topics/create-multiple",
                payload
            );

            showNotification({
                message: "Topics created successfully",
                type: "success",
            });

            // reset form
            setSyllabus(emptySyllabusTemplate);
            setSelectedTextbook("");
            setSelectedSubject("");
            setSelectedSyllabusId("");

            navigate("/admin/topic-list");
        } catch (err) {
            console.error("Save failed", err);

            showNotification({
                message: err?.response?.data?.message || "Failed to save topics",
                type: "error",
            });
        }
    };

    const validateTopics = async () => {
        const newErrors = {};

        if (!academicYear) {
            newErrors.academicYear = "Academic Year is required";
        }
        if (!classId) {
            newErrors.classId = "Class is required";
        }
        if (!selectedSyllabusId) {
            newErrors.syllabus = "Syllabus is required";
        }

        if (!selectedSubject) {
            newErrors.subject = "Subject is required";
        }

        if (textbook.length > 0 && !selectedTextbook) {
            newErrors.textbook = "Textbook is required";
        }




        for (const [cIndex, chapter] of syllabus.entries()) {


            for (const [tIndex, topic] of chapter.topics.entries()) {

                if (!topic.topicName?.trim()) {
                    newErrors[`topicName-${cIndex}-${tIndex}`] =
                        "Topic name is required";
                }
                else if (/^\d+$/.test(topic.topicName.trim())) {
                    newErrors[`topicName-${cIndex}-${tIndex}`] =
                        "Topic name cannot contain only numbers";
                }

                if (!topic.weekNumber) {
                    newErrors[`weekNumber-${cIndex}-${tIndex}`] =
                        "Week number is required";
                }

                if (!topic.topicSequence) {
                    newErrors[`topicSequence-${cIndex}-${tIndex}`] =
                        "Sequence is required";
                } else if (!topic.weekNumber) {
                    newErrors[`weekNumber-${cIndex}-${tIndex}`] =
                        "Week number is required";
                } else {
                    const { valid, message } = await validateSequenceNo(
                        topic.weekNumber,
                        topic.topicSequence
                    );

                    if (!valid) {
                        newErrors[`topicSequence-${cIndex}-${tIndex}`] = message;
                    }
                }

                if (!topic.estimatedDays) {
                    newErrors[`estimatedDays-${cIndex}-${tIndex}`] =
                        "Estimated days is required";
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const noSyllabusForClass = classId && academicYear && syllabuses.length === 0;
    const noTextbookForSubject = classId && selectedSubject && textbook.length === 0;


    return (
        <div className="mainpro">
            <div className="container">
                <div className="syllabus-page">
                    <button className="btn btn-primary mb-2" onClick={() => { navigate("/admin/topic-list") }} >
                        Topics List
                    </button>

                    <div className="whitebox">

                        <div className="formbox searchsec stapform">
                            <ul>
                                <li>
                                    <div className="form-group">
                                        <label>Select Academic <span className="text-danger">*</span></label>

                                        <select className={`form-control ${errors?.academicYear ? "is-invalid" : ""
                                            }`} value={academicYear || ""}
                                            disabled={fromSyllabusMaster}
                                            onChange={(e) => {
                                                setAcademicYear(e.target.value);
                                                clearError("academicYear");
                                            }}>
                                            <option value="">Select Academic Year</option>
                                            {academicYears.map((years) => {
                                                if (years?.isCurrentActive !== "Y") return null;
                                                return (
                                                    <option
                                                        key={years.academicYear}
                                                        value={years.academicYear}
                                                    >
                                                        {years.academicYear}
                                                    </option>
                                                );
                                            })}

                                        </select>

                                        {errors?.academicYear && (
                                            <div className="invalid-feedback">
                                                {errors.academicYear}
                                            </div>
                                        )}
                                    </div>
                                </li>
                                <li>
                                    <div className="form-group">
                                        <label>Select Class <span className="text-danger">*</span></label>

                                        <select
                                            className={`form-control ${errors?.classId ? "is-invalid" : ""}`}
                                            value={classId || ""}
                                            disabled={
                                                !academicYear ||
                                                loadingClasses ||
                                                fromSyllabusMaster
                                            }
                                            onChange={(e) => {
                                                setClassId(e.target.value);
                                                clearError("classId");
                                            }}
                                        >
                                            <option value="">
                                                {!academicYear
                                                    ? "Select Year First"
                                                    : loadingClasses
                                                        ? "Loading classes..."
                                                        : "Select Class"}
                                            </option>

                                            {classes.map(cls => (
                                                <option key={cls.classId} value={cls.classId}>
                                                    {cls.className}
                                                </option>
                                            ))}
                                        </select>


                                        {errors?.classId && (
                                            <div className="invalid-feedback">
                                                {errors.classId}
                                            </div>
                                        )}
                                    </div>
                                </li>

                                <li>
                                    <div className="form-group">
                                        <label>Select Syllabus  </label>

                                        <select
                                            className={`form-control ${(errors?.syllabus || noSyllabusForClass) ? "is-invalid" : ""
                                                }`}
                                            value={selectedSyllabusId || ""}
                                            // disabled={fromSyllabusMaster || syllabuses.length <= 1}
                                            onChange={(e) => {
                                                setSelectedSyllabusId(Number(e.target.value));
                                                clearError("syllabus");
                                            }}

                                        >
                                            <option value="">Select Syllabus</option>
                                            {syllabuses.map((s) => (
                                                <option key={s.syllabusId} value={s.syllabusId}>
                                                    {s.syllabusName}
                                                </option>
                                            ))}
                                        </select>

                                        {noSyllabusForClass && (
                                            <div className="invalid-feedback">
                                                No syllabus for this class
                                            </div>
                                        )}

                                        {errors?.syllabus && !noSyllabusForClass && (
                                            <div className="invalid-feedback">
                                                {errors.syllabus}
                                            </div>
                                        )}
                                    </div>
                                </li>


                                <li>
                                    <div className="form-group">
                                        <label>Select Subject </label>
                                        <select
                                            className={`form-control ${errors?.subject ? "is-invalid" : ""}`}
                                            value={selectedSubject || ""}
                                            onChange={(e) => {
                                                const subjectId = Number(e.target.value);
                                                setSelectedSubject(subjectId);
                                                setSelectedTextbook("");
                                                clearError("subject");
                                            }}
                                        >
                                            <option value="">Select Subject</option>
                                            {allSubjects.map((s) => (
                                                <option key={s.subjectId} value={s.subjectId}>
                                                    {s.subjectName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors?.subject && (
                                            <div className="invalid-feedback">
                                                {errors.subject}
                                            </div>
                                        )}
                                    </div>
                                </li>
                                <li>
                                    <div className="form-group">
                                        <label>Select Textbook </label>
                                        <select
                                            className={`form-control ${(errors?.textbook || noTextbookForSubject) ? "is-invalid" : ""}`}
                                            value={selectedTextbook || ""}
                                            // disabled={noTextbookForSubject || textbook.length === 0}
                                            onChange={(e) =>{
                                                setSelectedTextbook(Number(e.target.value));
                                                clearError("textbook");
                                            }}
                                        >
                                            <option value="">Select Textbook</option>

                                            {textbook.map((t) => (
                                                <option key={t.textBookId} value={t.textBookId}>
                                                    {t.textBookName}
                                                </option>
                                            ))}
                                        </select>

                                        {noTextbookForSubject && (
                                            <div className="invalid-feedback d-block">
                                                No textbook for this subject
                                            </div>
                                        )}

                                        {errors?.textbook && !noTextbookForSubject && (
                                            <div className="invalid-feedback">
                                                {errors.textbook}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>



                    {syllabus.map((ch, cIndex) => (
                        <div key={cIndex}>
                            {ch.topics.map((t, tIndex) => (
                                <div className="whitebox" key={`${cIndex}-${tIndex}`} >
                                    <div className="formbox searchsec addtopic stapform">
                                        <ul>
                                            <li>
                                                <div className="form-group">
                                                    <label>Topic Name <span className="text-danger">*</span></label>
                                                    <input
                                                        className={`form-control  ${getError(`topicName-${cIndex}-${tIndex}`) ? "is-invalid" : ""}`}
                                                        value={t.topicName}
                                                        placeholder="Enter Topic Name"
                                                        onChange={(e) =>{
                                                            updateTopic(cIndex, tIndex, "topicName", e.target.value);
                                                            clearError(`topicName-${cIndex}-${tIndex}`);
                                                        }}
                                                    />
                                                    {getError(`topicName-${cIndex}-${tIndex}`) && (
                                                        <div className="invalid-feedback">
                                                            {getError(`topicName-${cIndex}-${tIndex}`)}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                            <li>
                                                <div className="form-group">
                                                    <label>Theme Name</label>
                                                    <input
                                                        className={`form-control `}
                                                        value={t.themeName}
                                                        placeholder="Enter Theme"
                                                        onChange={(e) =>
                                                            updateTopic(cIndex, tIndex, "themeName", e.target.value)
                                                        }
                                                    />
                                                    {/* {getError(`referencePages-${cIndex}-${tIndex}`) && (
                                                        <div className="invalid-feedback">
                                                            {getError(`referencePages-${cIndex}-${tIndex}`)}
                                                        </div>
                                                    )} */}
                                                </div>
                                            </li>
                                            <li>
                                                <div className="form-group">
                                                    <label>Ref. Pages</label>
                                                    <input
                                                        className={`form-control  ${getError(`referencePages-${cIndex}-${tIndex}`) ? "is-invalid" : ""}`}
                                                        value={t.referencePages}
                                                        placeholder="Enter Ref. Page"
                                                        onChange={(e) =>
                                                            updateTopic(cIndex, tIndex, "referencePages", e.target.value)
                                                        }
                                                    />
                                                    {getError(`referencePages-${cIndex}-${tIndex}`) && (
                                                        <div className="invalid-feedback">
                                                            {getError(`referencePages-${cIndex}-${tIndex}`)}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                            <li>
                                                <div className="form-group">

                                                    <label>Week No. <span className="text-danger">*</span></label>
                                                    <input
                                                        type="number"
                                                        placeholder="Week No"
                                                        className={`form-control  ${getError(`weekNumber-${cIndex}-${tIndex}`) ? "is-invalid" : ""}`}
                                                        value={t.weekNumber}
                                                        min={1}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === "") {
                                                                updateTopic(cIndex, tIndex, "weekNumber", value);
                                                                return;
                                                            }
                                                            if (Number(value) < 1) return;
                                                            updateTopic(cIndex, tIndex, "weekNumber", value);

                                                            clearError(`weekNumber-${cIndex}-${tIndex}`);
                                                        }}
                                                    />
                                                    {getError(`weekNumber-${cIndex}-${tIndex}`) && (
                                                        <div className="invalid-feedback">
                                                            {getError(`weekNumber-${cIndex}-${tIndex}`)}
                                                        </div>
                                                    )}

                                                </div>
                                            </li>
                                            <li>
                                                <div className="form-group">
                                                    <label>Max. Days <span className="text-danger">*</span></label>
                                                    <input
                                                        type="number"
                                                        placeholder="Days"
                                                        className={`form-control  ${getError(`estimatedDays-${cIndex}-${tIndex}`) ? "is-invalid" : ""}`}
                                                        value={t.estimatedDays}
                                                        min={1}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === "") {
                                                                updateTopic(cIndex, tIndex, "estimatedDays", value);
                                                                return;
                                                            }
                                                            if (Number(value) < 1) return;
                                                            updateTopic(cIndex, tIndex, "estimatedDays", value);

                                                            clearError(`estimatedDays-${cIndex}-${tIndex}`);
                                                        }}
                                                    />
                                                    {getError(`estimatedDays-${cIndex}-${tIndex}`) && (
                                                        <div className="invalid-feedback">
                                                            {getError(`estimatedDays-${cIndex}-${tIndex}`)}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                            <li>
                                                <div className="form-group">
                                                    <label>Seq No. <span className="text-danger">*</span></label>
                                                    <input
                                                        type="number"
                                                        placeholder="Sequence"
                                                        className={`form-control  ${getError(`topicSequence-${cIndex}-${tIndex}`) ? "is-invalid" : ""}`}
                                                        onBlur={(e) => { validateSequenceNo(t.weekNumber, e.target.value) }}
                                                        value={t.topicSequence}
                                                        min={1}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === "") {
                                                                updateTopic(cIndex, tIndex, "topicSequence", value);
                                                                return;
                                                            }
                                                            if (Number(value) < 1) return;
                                                            updateTopic(cIndex, tIndex, "topicSequence", value);

                                                            clearError(`topicSequence-${cIndex}-${tIndex}`);
                                                        }}
                                                    />
                                                    {getError(`topicSequence-${cIndex}-${tIndex}`) && (
                                                        <div className="invalid-feedback">
                                                            {getError(`topicSequence-${cIndex}-${tIndex}`)}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                            <li className="deskfull">
                                                <div className="form-group themedesc-count">
                                                    <label>Objective/Description</label>
                                                    <textarea
                                                        className="form-control"
                                                        placeholder="Enter Text..."
                                                        value={t.description}
                                                        onChange={(e) =>
                                                            updateTopic(cIndex, tIndex, "description", e.target.value)
                                                        }
                                                    />
                                                </div>
                                            </li>

                                        </ul>


                                        {syllabus.length > 1 && (
                                            <button
                                                className="deletebtn"
                                                onClick={() => deleteChapter(cIndex)}
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* ===== ACTION BUTTONS ===== */}
                    {/* {mode === "create" && ( */}
                    <>
                        <div className="text-end mb-2">
                            <button onClick={addChapter}>
                                <Plus size={16}/> Add More Topic
                            </button>
                        </div>
                        <div className="text-center">


                            <button className="btn btn-primary fullsec" onClick={saveAllTopics} >
                                {syllabus.length > 1 ? "Save All Topics" : "Save Topics"}
                            </button>
                        </div>
                    </>
                    {/* )} */}

                    {/* {mode === "edit" && ( */}
                    {/* <div className="text-end mt-3">
                        <button
                            className="btn btn-primary"
                            onClick={saveAllTopics}
                        >
                            Update Topic
                        </button>
                    </div> */}
                    {/*  )} */}

                </div>
            </div>
        </div>
    );
}
