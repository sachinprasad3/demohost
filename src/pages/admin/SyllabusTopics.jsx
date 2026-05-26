// SyllabusTopics
import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import axiosInstance from "../../utills/axiosInstance";
import "../../css/syllabusTopics.css";
import useAcademicYears from "../../hooks/useAcademicYears";
import useSyllabusByClassAndAcademic from "../../hooks/useSyllabusByClassAndAcademic";
import Accordion from "../../components/Accordion";
import { usePopup } from "../../context/PopupContext";
import useClasses from "../../hooks/useClasses";
import { useNavigate } from "react-router-dom";


export default function SyllabusTopics() {
    const [selectedSyllabusId, setSelectedSyllabusId] = useState("");
    const [subjects, setSubjects] = useState([]);

    const [selectedSubject, setSelectedSubject] = useState("");
    const { openPopup } = usePopup();
    const [classId, setClassId] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const { academicYears } = useAcademicYears()
    const { classes, loading: loadingClasses } = useClasses(academicYear);
    const { syllabuses, loading, error } = useSyllabusByClassAndAcademic(classId, academicYear);
    const navigate = useNavigate();
    const [allTopics, setAllTopics] = useState([]);


    useEffect(() => {
        if (syllabuses.length === 1) {
            const only = syllabuses[0];
            setSelectedSyllabusId(only.syllabusId);
        } else {
            setSelectedSyllabusId("");
        }
    }, [syllabuses]);

    useEffect(() => {
        if (selectedSyllabusId) {
            fetchSubjects(selectedSyllabusId);
        } else {
            setSubjects([]);
        }
    }, [selectedSyllabusId]);



    useEffect(() => {
        setSubjects([]);
    }, [classId, academicYear]);

    useEffect(() => {
        fetchTopics();
    }, []);




    const getCurrentAcademicYear = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        if (month >= 4) {
            return `${year}-${year + 1}`;
        } else {
            return `${year - 1}-${year}`;
        }
    };

    const getCurrentAcademicYearFromTopics = (topics = []) => {
        if (!topics.length) return null;

        const currentAY = getCurrentAcademicYear();

        const exists = topics.some(t => t.academicYear === currentAY);
        if (exists) return currentAY;

        return topics
            .map(t => t.academicYear)
            .filter(Boolean)
            .sort((a, b) => {
                const startA = Number(a.split("-")[0]);
                const startB = Number(b.split("-")[0]);
                return startB - startA;
            })[0];
    };

    useEffect(() => {
        if (!academicYear && allTopics.length > 0) {
            const currentYear = getCurrentAcademicYearFromTopics(allTopics);
            if (currentYear) {
                setAcademicYear(currentYear);
            }
        }
    }, [allTopics]);


    const fetchSubjects = async (syllabusId) => {
        if (!syllabusId) return;
        try {
            const res = await axiosInstance.get(
                `/api/v1/syllabus-topics/syllabus-id/${syllabusId}`
            );
            setSubjects(res.data?.data || []);

        } catch (error) {
            console.error("error in fetching subjects", error)
        }
    };



    /* ================= SYLLABUS STATE ================= */
    const [syllabus, setSyllabus] = useState([
        {
            chapterName: "",
            topics: [
                {
                    topicName: "",
                    referencePages: "",
                    weekNumber: "",
                    estimatedDays: "",
                    topicSequence: ""
                }
            ]
        }
    ]);


    const fetchTopics = async () => {
        try {
            const res = await axiosInstance.get("/api/v1/syllabus-topics/all");
            const topics = res.data?.data || [];

            setAllTopics(topics);
            console.log("Fetched topics", topics);
        } catch (err) {
            console.error("Fetch topics failed", err);
        } finally {
        }
    };

    const groupTopicsByWeek = (topics = []) => {
        const weekMap = {};

        topics.forEach(topic => {
            const week = topic.weekNumber || 0;

            if (!weekMap[week]) {
                weekMap[week] = {
                    weekNumber: week,
                    topics: []
                };
            }

            weekMap[week].topics.push(topic);
        });

        return Object.values(weekMap).sort(
            (a, b) => a.weekNumber - b.weekNumber
        );
    };




    const handleEditTopic = (topic) => {

        setSelectedSyllabusId(topic.syllabusId);
        setSelectedSubject(topic.subjectId);

        setSyllabus([
            {
                chapterName: topic.description || "",
                topics: [
                    {
                        topicName: topic.topicName,
                        referencePages: topic.referencePages || "",
                        weekNumber: topic.weekNumber,
                        estimatedDays: topic.estimatedDays,
                        topicSequence: topic.topicSequence,
                    },
                ],
            },
        ]);

        openPopup("Edit Topic");
    };


    const displayWeekWiseTopics = (() => {
        if (!academicYear) return [];

        return groupTopicsByWeek(
            allTopics.filter(t => {
                if (t.academicYear !== academicYear) return false;

                if (classId && Number(t.classId) !== Number(classId)) return false;

                if (
                    selectedSyllabusId &&
                    Number(t.syllabusId) !== Number(selectedSyllabusId)
                ) return false;


                return true;
            })
        );
    })();


    useEffect(() => {
        setSelectedSyllabusId(null);
        setSelectedSubject(null);
    }, [classId, academicYear]);

    const noSyllabusForClass = classId && academicYear && !loading && syllabuses.length === 0;
    const noSubjectForSyllabus = selectedSyllabusId && subjects.length === 0;



    return (
        <div className="mainpro">
            <div className="container">

                <button
                    className="btn btn-primary mb-2"
                    onClick={() => { navigate("/admin/add-topic") }}
                >
                    <Plus size={16} /> Add Topics
                </button>
                <>
                    <div className="whitebox">
                        <h3>Saved Topics</h3>

                        <div className="formbox searchsec stapform">
                            <ul>
                                <li>
                                    <div className="form-group">
                                        <label htmlFor="form-label">Academic Year <span className="text-danger">*</span></label>
                                        <select className="form-control "
                                            value={academicYear || ""}
                                            onChange={(e) => {
                                                setAcademicYear(e.target.value);
                                            }}>
                                            <option value="">Select Academic Year</option>
                                            {academicYears.map((years) => {

                                                const activeYear = years?.isCurrentActive === "Y"
                                                return (
                                                    activeYear && <option key={years?.academicYear} value={years?.academicYear}>{years?.academicYear}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                </li>


                                <li>
                                    <div className="form-group">
                                        <label htmlFor="form-label">Class <span className="text-danger">*</span></label>
                                        <select
                                            className="form-control"
                                            value={classId || ""}
                                            disabled={!academicYear || loadingClasses}
                                            onChange={(e) => {
                                                setClassId(e.target.value);
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
                                                <option key={cls.classId} value={cls.classId.toString()}>
                                                    {cls.className}
                                                </option>
                                            ))}
                                        </select>

                                    </div>
                                </li>

                                <li>
                                    <div className="form-group">
                                        <label className="form-label">Syllabus <span className="text-danger">*</span></label>
                                        <select
                                            className={`form-control ${noSyllabusForClass ? "is-invalid" : ""}`}
                                            value={selectedSyllabusId || ""}
                                            onChange={(e) => {
                                                setSelectedSyllabusId(e.target.value);
                                                setSelectedSubject("");
                                            }}
                                        >
                                            <option value="">Select Syllabus</option>
                                            {syllabuses.map(slbs => (
                                                <option key={slbs.syllabusId} value={slbs.syllabusId}>
                                                    {slbs.syllabusName}
                                                </option>
                                            ))}
                                        </select>

                                        {noSyllabusForClass && (
                                            <div className="invalid-feedback">
                                                No syllabus for this class
                                            </div>
                                        )}

                                    </div>
                                </li>

                                <li>
                                    <div className="form-group">
                                        <label htmlFor="form-label">Subjects <span className="text-danger">*</span></label>
                                        <select
                                            className={`form-control ${noSubjectForSyllabus ? "is-invalid" : ""}`}
                                            // disabled={subjects.length === 0}
                                            value={selectedSubject || ""}
                                            onChange={(e) => {
                                                const subjectId = e.target.value;
                                                setSelectedSubject(subjectId);
                                            }}
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map(sub => (
                                                <option key={sub.subjectId} value={sub.subjectId}>
                                                    {sub.subjectName}
                                                </option>
                                            ))}
                                        </select>

                                        {noSubjectForSyllabus && (
                                            <div className="invalid-feedback">
                                                No subjects for this syllabus.
                                            </div>
                                        )}

                                    </div>
                                </li>



                            </ul>
                        </div>

                    </div>
                    {/* {weeklyTopicList?.subjectName && (
                        <h3>Subject : {weeklyTopicList?.subjectName}</h3>
                    )} */}
                    {selectedSubject && displayWeekWiseTopics.length > 0 && (
                        <h3>
                            Subject : {
                                subjects.find(s => Number(s.subjectId) === Number(selectedSubject))
                                    ?.subjectName
                            }
                        </h3>
                    )}



                    {displayWeekWiseTopics.length > 0 ? (
                        <SubjectAccordion data={displayWeekWiseTopics} onEdit={handleEditTopic} navigate={navigate} />
                    ) : (
                        <div className="alert alert-info mt-2">
                            No topics found.
                        </div>
                    )}

                </>

            </div>


        </div>
    );
}



function SubjectAccordion({ data = [], onEdit, navigate, weeklyTopicList }) {
    if (!data.length) {
        return <div className="text-muted">No syllabus available</div>;
    }


    const getWeekName = (weekNumber) => {
        if (weekNumber <= 0) return "Week";

        const suffix =
            weekNumber % 10 === 1 && weekNumber % 100 !== 11
                ? "st"
                : weekNumber % 10 === 2 && weekNumber % 100 !== 12
                    ? "nd"
                    : weekNumber % 10 === 3 && weekNumber % 100 !== 13
                        ? "rd"
                        : "th";

        return `${weekNumber}${suffix} Week`;
    };

    return (
        <div>
            {data.map((week, index) => (
                <Accordion
                    key={week.weekNumber}
                    title={getWeekName(week.weekNumber)}
                    defaultOpen={index === 0}
                >
                    {week.topics?.length > 0 ? (
                        week.topics.map((topic, idx) => (
                            <div key={topic.topicId} className="border box mb-1" >

                                <ul className="activity-details-list sy-topicslist topics">
                                    {topic.topicName && (
                                        <li>
                                            <strong>Topic Name</strong> {topic.topicName}
                                        </li>
                                    )}

                                    {topic.themeName && (
                                        <li>
                                            <strong>Theme Name</strong> {topic.themeName}
                                        </li>
                                    )}

                                    {topic.textBookName && (
                                        <li>
                                            <strong>Textbook</strong> {topic.textBookName}
                                        </li>
                                    )}

                                    {topic.topicSequence !== undefined && topic.topicSequence !== null && (
                                        <li>
                                            <strong>Topic Sequence</strong> {topic.topicSequence}
                                        </li>
                                    )}

                                    {topic.referencePages && (
                                        <li>
                                            <strong>Reference Page</strong> {topic.referencePages}
                                        </li>
                                    )}

                                    {topic.estimatedDays && (
                                        <li>
                                            <strong>Duration</strong> {topic.estimatedDays} days
                                        </li>
                                    )}

                                    {topic.description && (
                                        <li>
                                            <strong>Description</strong> {topic.description}
                                        </li>
                                    )}
                                </ul>

                            </div>
                        ))
                    ) : (
                        <div className="text-muted small">
                            No topics for this week
                        </div>
                    )}
                </Accordion>
            ))}
        </div>
    );
}





