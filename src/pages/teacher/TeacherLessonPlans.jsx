import React, { useEffect, useState } from "react";
import axiosInstance from "../../utills/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Popup from "../../components/Popup";
import { usePopup } from "../../context/PopupContext";

export default function TeacherLessonPlans() {

  /* ================= GET LOGGED IN TEACHER ================= */
  const { user } = useAuth();
  const teacherInfo = user?.teacherInfo || {};
  const teacherId = teacherInfo?.teacherId;
  console.log("Teacher Info:", teacherInfo);
  const [lessonPlans, setLessonPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const [syllabusList, setSyllabusList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const { openPopup, activeModal, closePopup } = usePopup()
  // const [selectedSyllabusId, setSelectedSyllabusId] = useState(null);
  // const [topics, setTopics] = useState([]);
  // const [topicsLoading, setTopicsLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [activeSyllabusId, setActiveSyllabusId] = useState(null);


  /* ================= FETCH ================= */

  useEffect(() => {
    if (teacherId) {
      fetchLessonPlansByTeacher();
      fetchLookups();
    }
  }, [teacherId]);

  const fetchLessonPlansByTeacher = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/api/v1/daily-lesson-plan/teacher-id/${teacherId}`
      );
      setLessonPlans(res.data?.data || []);
    } catch (e) {
      console.error("Failed to fetch teacher plans", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [syl, cls, sec] = await Promise.all([
        axiosInstance.get("/api/v1/share/all-syllabus-id-with-name"),
        axiosInstance.get("/api/v1/share/all-school-id-with-name"),
        axiosInstance.get("/api/v1/share/all-section-id-with-name"),
      ]);

      setSyllabusList(syl.data?.data || []);
      setClassList(cls.data?.data || []);
      setSectionList(sec.data?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  /* ================= HELPERS ================= */

  const getSyllabusName = (id) =>
    syllabusList.find((s) => s.syllabusId === id)?.syllabusName || "-";

  const getClassName = (id) =>
    classList.find((c) => c.classId === id)?.className || "-";

  const getSectionName = (id) =>
    sectionList.find((s) => s.sectionId === id)?.sectionName || "-";


  const handleViewTopics = async (syllabusId) => {
    try {
      setActiveSyllabusId(syllabusId);
      setLoadingTopics(true);
      openPopup("VIEW_TOPICS");

      const res = await axiosInstance.get(
        `/api/v1/syllabus-topics/syllabus-id/${syllabusId}`
      );

      setTopics(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch topics", err);
    } finally {
      setLoadingTopics(false);
    }
  };



const visibleLessonPlans = lessonPlans.filter(
  (p) => p.status !== "DRAFT"
);




  /* ================= UI ================= */

  return (
    <div className="mainpro">
      <div className="container">

        <h4 className="fw-bold mb-3">
          My Lesson Plans
          {teacherInfo?.fullName && (
            <span className="text-muted fs-6 ms-2">
              ({teacherInfo.fullName})
            </span>
          )}
        </h4>

        {!teacherId ? (
          <div className="alert alert-danger">
            Teacher information not found. Please login again.
          </div>
        ) : loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : visibleLessonPlans.length === 0 ? (
          <div className="alert alert-secondary">
            No lesson plans assigned
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="d-none d-md-block">
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Syllabus</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Day</th>
                      <th>Date</th>
                      <th>Theme</th>
                      <th>Status</th>
                      <th>Topics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLessonPlans.map((p, i) => (
                    // {lessonPlans.map((p, i) => (
                      <tr key={p.sessionPlanId}>
                        <td>{i + 1}</td>
                        <td>{getSyllabusName(p.syllabusId)}</td>
                        <td>{getClassName(p.classId)}</td>
                        <td>{getSectionName(p.sectionId)}</td>
                        <td>Day {p.dayNo}</td>
                        <td>{p.planDate}</td>
                        <td>{p.overallTheme || "-"}</td>
                        <td>
                          <span className={`badge ${p.status === "DRAFT"
                            ? "bg-warning"
                            : p.status === "PUBLISHED"
                              ? "bg-success"
                              : "bg-secondary"
                            }`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewTopics(p.syllabusId)}
                          >
                            View Topics
                          </button>
                        </td>


                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARDS */}
            <div className="d-block d-md-none">
              {/* {lessonPlans.map((p) => ( */}
                {visibleLessonPlans.map((p) => (
                <div key={p.sessionPlanId} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <h6 className="fw-bold mb-0">
                        {getSyllabusName(p.syllabusId)}
                      </h6>
                      <span className={`badge ${p.status === "DRAFT"
                        ? "bg-warning"
                        : p.status === "PUBLISHED"
                          ? "bg-success"
                          : "bg-secondary"
                        }`}>
                        {p.status}
                      </span>
                    </div>

                    <p className="mb-1">
                      <strong>Class:</strong>{" "}
                      {getClassName(p.classId)} ({getSectionName(p.sectionId)})
                    </p>
                    <p className="mb-1"><strong>Day:</strong> Day {p.dayNo}</p>
                    <p className="mb-1"><strong>Date:</strong> {p.planDate}</p>

                    {p.overallTheme && (
                      <p className="mt-2 small text-muted">
                        {p.overallTheme}
                      </p>
                    )}

                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => handleViewTopics(p.syllabusId)}
                    >
                      View Topics
                    </button>


                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    {activeModal === "VIEW_TOPICS" && (
  <Popup
    title="Syllabus Topics"
    closeOnOutsideClick={true}
    onClose={() => {
      setTopics([]);
      setActiveSyllabusId(null);
      closePopup();
    }}
  >
    {loadingTopics ? (
      <p className="text-center">Loading topics...</p>
    ) : topics.length === 0 ? (
      <p className="text-muted">No topics found</p>
    ) : (
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Topic</th>
              <th>Week</th>
              <th>Days</th>
              <th>Ref. Pages</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((t, i) => (
              <tr key={t.topicId}>
                <td>{i + 1}</td>
                <td>
                  <strong>{t.topicName}</strong>
                  <br />
                  <small className="text-muted">
                    {t.description}
                  </small>
                </td>
                <td>{t.weekNumber}</td>
                <td>{t.estimatedDays}</td>
                <td>{t.referencePages || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Popup>
)}

    </div>
  );
}
