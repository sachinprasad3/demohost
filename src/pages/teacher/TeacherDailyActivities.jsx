import React, { useEffect, useState } from "react";
import axiosInstance from "../../utills/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Accordion from "../../components/Accordion";
import { useNotification } from "../../context/NotificationContext";
import useClassSection from "../../hooks/useClassSection";

export default function TeacherDailyActivities() {
  const formatDate = (dateStr) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
  const [activities, setActivities] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const teacherInfo = user?.teacherInfo || {};

  const teacherId = teacherInfo?.teacherId;
  const classId = teacherInfo?.classId;
  const { showNotification } = useNotification();
  const { syllabusList, loadingSyllabus } = useClassSection(classId);

  const today = new Date();

    const currentYearSyllabus = React.useMemo(() => {
      if (!syllabusList || syllabusList.length === 0) return [];

      return syllabusList.filter(syl => {
        const start = new Date(syl.startDate);
        const end = new Date(syl.endDate);

        return today >= start && today <= end;
      });
    }, [syllabusList]);

  /* ================= FETCH ACTIVITIES ================= */
  const fetchActivities = async () => {
    if (!teacherId || !classId) return;

    try {
      setLoading(true);

      const res = await axiosInstance.get(
        "/api/v1/daily-activities/filter",
        {
          params: {
            classId,
            teacherId
          }
        }
      );

      setActivities(res.data?.data || {});
    } catch (err) {
      console.error("Fetch activities failed", err);
      setActivities({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId && classId) {
      fetchActivities();
    }
  }, [teacherId, classId]);



  const getFormattedTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${hours}:${minutes} ${ampm}`;
  };


  /* ================= MARK COMPLETED ================= */
  const markCompleted = async (activity) => {
    const confirmed = window.confirm("Are you sure you want to complete this activity?");
    if (!confirmed) return;
    try {
      const completionDate = new Date().toISOString().split("T")[0];
      const completionTime = getFormattedTime();

      const payload = {
        activityId: activity.activityId,
        teacherId: teacherId,
        completionStatus: "COMPLETED",
        completionDate,
        completionTime
      };

      await axiosInstance.put(
        "/api/v1/daily-activities/update/completion-status",
        payload
      );

      fetchActivities();
      showNotification({
        message: "Your Activity Completed successfully",
        type: "success",
      });

    } catch (err) {
      console.error("Mark completed failed", err);
      alert("Failed to mark activity completed");
    }
  };


  /* ================= UI ================= */
  return (
    <div className="container">

      {loading && (
        <div className="text-center mt-3">
          Loading activities...
        </div>
      )}

      {!loading && !activities?.days?.length && (
        <div className="alert alert-info mt-3">
          No activities assigned
        </div>
      )}

      {!loadingSyllabus && currentYearSyllabus.length > 0 && (
        <div className="whitebox mb-3 successbtn">
          <h4>Syllabus Details</h4>
          {currentYearSyllabus.map(syl => (
            <div key={syl.syllabusId} className="activity-details-list topics" >
              <ul>
                <li><strong>Syllabus Name</strong> {syl.syllabusName}</li>
                <li><strong>Academic Year</strong> {syl.academicYear}</li>
                <li><strong>Total Weeks</strong> {syl.totalWeeks}</li>
                <li><strong>Total Days</strong> {syl.totalWorkingDays}</li>
                <li> <strong>Duration</strong> {syl.startDate} → {syl.endDate} </li>
              </ul>
            </div>
          ))}
        </div>
      )}


      {activities?.days?.map(day => {
        const isDayCompleted =
          day.activities.length > 0 &&
          day.activities.every(act => act.completionStatus === "COMPLETED");

        const dayStatus = isDayCompleted ? "COMPLETED" : "PENDING";
        return (
          <Accordion
            key={`${day.dayNumber}-${day.planDate}`}
            title={`Day ${day.dayNumber} - ${formatDate(day.planDate)}`}
            subhead={
              <span
                className={`badge ${dayStatus === "COMPLETED" ? "bg-success" : "bg-warning"
                  }`}
              >
                {dayStatus}
              </span>
            }
            defaultOpen={false}
          >
            {day.activities.map(act => (
              <div key={act.activityId} className="activity-card" >
                <h5>{act.activityTitle} <small className="text-muted">({act.activityType})</small> </h5>

                <ul className="activity-details-list topics">
                  <li><strong>Subject</strong> {act.subjectName}</li>
                  <li><strong>Topic</strong> {act.topicName}</li>
                  <li><strong>Textbook</strong> {act.textBookName}</li>

                  <li> <strong>Time Slot</strong> {act.startTime} – {act.endTime} ({act.durationInMins} mins) </li>
                  {act.weekNumber && (<li><strong>Week</strong> {act.weekNumber}</li>)}
                  <li><strong>Sequence</strong> {act.sequenceOrder}</li>

                  {act.materialsRequired && (<li><strong>Materials Req</strong> {act.materialsRequired || "-"}</li>)}
                  {act.referencePages && (<li><strong>Ref. Pages</strong> {act.referencePages || "-"}</li>)}
                  {act.referenceMaterials && (<li><strong>Ref. Materials</strong> {act.referenceMaterials || "-"}</li>)}

                  {act.completionStatus === "COMPLETED" && (
                    <li><strong>Completed On</strong> {formatDate(act.completionDate)}{" "} at {act.completionTime || "-"} </li>
                  )}
                </ul>
                <div
                  className={`view-status badge ${act.completionStatus === "COMPLETED"
                    ? "bg-success"
                    : "bg-warning"
                    }`}
                >
                  {act.completionStatus}
                </div>

                {act.completionStatus !== "COMPLETED" && (
                  <div className="text-center mt-2">
                    <button
                      className="btn btn-primary"
                      disabled={loading}
                      onClick={() => markCompleted(act)}
                    >
                      Mark Completed
                    </button>
                  </div>

                )}
              </div>
            ))}
          </Accordion>
        );
      })}

    </div>
  );
}
