import React, { useEffect, useState } from "react";
import axiosInstance from "../../utills/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Accordion from "../../components/Accordion";
import { useStudent } from "../../context/StudentContext";
import useClassSection from "../../hooks/useClassSection";

export default function TeacherDailyActivities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("ALL");
  const { activeStudent } = useStudent();

  // console.log("active atudent",activeStudent);

  const classId = activeStudent?.classId || activeStudent?.data?.classId;
  const candidateId = activeStudent?.candidateId;
  const { syllabusList, loadingSyllabus } = useClassSection(classId);

  console.log("syllabus list", syllabusList);

  const today = new Date();
  const currentYearSyllabus = React.useMemo(() => {
    if (!syllabusList || syllabusList.length === 0) return [];
    return syllabusList.filter(syl => {
      const start = new Date(syl.startDate);
      const end = new Date(syl.endDate);

      return today >= start && today <= end;
    });
  }, [syllabusList]);

//   const currentYearSyllabus = syllabusList.filter(
//   s => s.isCurrentActive === "Y"
// );

  const formatDate = (dateStr) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
  const fetchActivities = async () => {
    if (!classId || !candidateId) return;

    try {
      setLoading(true);

      const res = await axiosInstance.get(
        "/api/v1/daily-activities/filter",
        {
          params: {
            classId,
          }
        }
      );
      console.log("API RAW RESPONSE =>", res.data);

      setActivities(res.data?.data || {});
    } catch (err) {
      console.error("Fetch activities failed", err);
      setActivities({});
    } finally {
      setLoading(false);
    }
  };

  const subjects = React.useMemo(() => {
    if (!activities?.days) return [];

    const map = new Map();

    activities.days.forEach(day => {
      day.activities.forEach(act => {
        if (!map.has(act.subjectId)) {
          map.set(act.subjectId, {
            subjectId: act.subjectId,
            subjectName: act.subjectName
          });
        }
      });
    });

    return Array.from(map.values());
  }, [activities]);

  const filteredDays = React.useMemo(() => {
    if (!activities?.days) return [];

    if (selectedSubjectId === "ALL") return activities.days;

    return activities.days
      .map(day => ({
        ...day,
        activities: day.activities.filter(
          act => act.subjectId === Number(selectedSubjectId)
        )
      }))
      .filter(day => day.activities.length > 0);
  }, [activities, selectedSubjectId]);


  const hasFetched = React.useRef(false);

  useEffect(() => {
    if (!classId || hasFetched.current) return;
    hasFetched.current = true;
    fetchActivities();
  }, [classId]);

  const classIds = [
    ...new Set(
      user?.candidateIdInfos
        ?.map(c => c.classId)
        .filter(Boolean)
    )
  ];

  const getSelectedSubjectName = () => {
    if (selectedSubjectId === "ALL") return "";

    return subjects.find(
      s => s.subjectId === Number(selectedSubjectId)
    )?.subjectName || "";
  };


  return (
    <div className="container">

      {loading && (
        <div className="text-center mt-3">
          Loading activities...
        </div>
      )}

      {!loadingSyllabus && currentYearSyllabus.length > 0 && (
        <div className="whitebox mb-3 successbtn">
          <h4>Syllabus Details</h4>
          {currentYearSyllabus.map(syl => (
            <ul
              key={syl.syllabusId}
              className="activity-details-list topics"
            >
              <li><strong>Syllabus Name</strong> {syl.syllabusName}</li>
              <li><strong>Academic Year</strong> {syl.academicYear}</li>
              <li><strong>Total Weeks</strong> {syl.totalWeeks}</li>
              <li><strong>Total Days</strong> {syl.totalWorkingDays}</li>
              <li>
                <strong>Duration</strong>{" "}
{formatDate(syl.startDate) === formatDate(syl.endDate)
  ? formatDate(syl.startDate)
  : `${formatDate(syl.startDate)} → ${formatDate(syl.endDate)}`}

              </li>
              {/* <li>
                <strong>Status</strong>{" "}
                <span className={`badge ${syl.status === "ACTIVE" ? "bg-success" : "bg-secondary"}`}>
                  {syl.status}
                </span>
              </li> */}

            </ul>
          ))}
        </div>
      )}

      {/* ================= SUBJECT FILTER ================= */}
      {subjects.length > 0 && (
        <div className="form-group mb-3" style={{ maxWidth: 300 }}>
          <label>Filter by Subject</label>
          <select
            className="form-control"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            <option value="ALL">All Subjects</option>
            {subjects.map(sub => (
              <option key={sub.subjectId} value={sub.subjectId}>
                {sub.subjectName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ================= EMPTY STATES ================= */}
      {!loading && !activities?.days?.length && (
        <div className="alert alert-info">
          No activities assigned to this syllabus
        </div>
      )}

      {!loading && activities?.days?.length > 0 && filteredDays.length === 0 && (
        <div className="alert alert-info">
          No activities found for selected subject
        </div>
      )}

      {/* ================= ACTIVITIES LIST ================= */}
      {filteredDays.map(day => {
        const isDayCompleted =
          day.activities.length > 0 &&
          day.activities.every(act => act.completionStatus === "COMPLETED");

        const dayStatus = isDayCompleted ? "COMPLETED" : "PENDING";

        return (
          <Accordion
            key={day.dayNumber}
            title={
              <div className="d-flex align-items-center gap-2">
                <span>
                  {selectedSubjectId === "ALL"
                    ? `Day ${day.dayNumber} (${day.planDate || "-"})`
                    : `${getSelectedSubjectName()} (Day ${day.dayNumber} – ${day.planDate || "-"})`
                  }
                </span>

                {/* <span className={`badge ${dayStatus === "COMPLETED" ? "bg-success" : "bg-warning"}`}>
                  {dayStatus}
                </span> */}
              </div>
            }
             subhead={
                 <span
                   className={`badge ${
                     dayStatus === "COMPLETED" ? "bg-success" : "bg-warning"
                   }`}
                 >
                   {dayStatus}
                 </span>
               }
          >
            {day.activities.map(act => (
              <div key={act.activityId} className="activity-card">

                <h6 className="fw-bold mb-2">
                  {act.activityTitle}{" "}
                  <small className="text-muted">({act.activityType})</small>
                </h6>

                <ul className="activity-details-list topics">
                  <li><strong>Subject</strong> {act.subjectName}</li>
                  <li><strong>Topic</strong> {act.topicName}</li>
                  <li><strong>Textbook</strong> {act.textBookName}</li>
                  <li><strong>Time Slot</strong> {act.startTime} – {act.endTime} ({act.durationInMins} mins)</li>
                  
                 {act.weekNumber && ( <li><strong>Week</strong> {act.weekNumber}</li>)}
                 {act.sequenceOrder && ( <li><strong>Sequence</strong> {act.sequenceOrder}</li>)}
                  {act.materialsRequired && (<li><strong>Materials Req</strong> {act.materialsRequired || "-"}</li>)}
                 {act.referencePages && ( <li><strong>Ref. Pages</strong> {act.referencePages || "-"}</li>)}
                  {act.referenceMaterials && (<li><strong>Ref. Materials</strong> {act.referenceMaterials || "-"}</li>)}
                  {/* <li>
                    <strong>Visible to Parents</strong>{" "}
                    {act.visibleToParents === "Y" ? "Yes" : "No"}
                  </li>
                  <li><strong>Visible Till</strong> {act.visibleTill || "-"}</li> */}

                 
                   {act.completionStatus === "COMPLETED" && (
                     <li><strong>Completed On</strong> {formatDate(act.completionDate)}{" "} at {act.completionTime || "-"} </li>
                  )}

                 
                  
                </ul>
                <div className={`view-status badge ${act.completionStatus === "COMPLETED" ? "bg-success" : "bg-warning"}`}>
                      {act.completionStatus}
                    </div>
              </div>
            ))}
          </Accordion>
        );
      })}

    </div>
  );

}
