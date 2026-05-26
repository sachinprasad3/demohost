import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "../../css/teacherdashboard.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useAuth } from "../../context/AuthContext";
import useEvents from "../../hooks/useEvents";
import axiosInstance from "../../utills/axiosInstance";
import { useTeacher } from "../../context/TeacherProvider";
import ClassSelector from "../../components/Teacher/teacherClassSelector";
import TeacherAttendanceSummary from "../../components/TeacherAttendanceSummary";
import { useGetAttendance, useGetStudentByClass } from "../../services/attendance.services";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const teacherInfo = user?.teacherInfo || {};

  const teacherId = teacherInfo?.teacherId;
  const classId = teacherInfo?.classId;

  const [activities, setActivities] = useState({});
  const [loadingActivities, setLoadingActivities] = useState(false);
  const {
    assignedClasses,
    activeClassId,
    setActiveClassId,
  } = useTeacher();

  const classTeacher = assignedClasses?.find((cls) => cls?.assignmentStatus === "Permanent")
  const todayStr = new Date().toISOString().split("T")[0];

  console.log("assignedClasses", assignedClasses)

  const { data: students = [], isLoading: studentLoading } = useGetStudentByClass(activeClassId);
  const { data: attendance = [], isLoading: attendanceLoading } = useGetAttendance(activeClassId, todayStr);


  const { events, error } = useEvents();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events
    .filter(event => new Date(event.startDate) >= today)
    .sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    )
    .slice(0, 5);

  const todaySchedules = activities?.days?.filter(
    day => day.planDate === todayStr
  ) || [];

  const mergedTodayActivities = todaySchedules.flatMap(
    day => day.activities || []
  );

  const sortedTodayActivities = mergedTodayActivities.sort(
    (a, b) =>
      new Date(`1970-01-01 ${a.startTime}`) -
      new Date(`1970-01-01 ${b.startTime}`)
  );


  const fetchActivities = async () => {
    if (!teacherId || !classId) return;

    try {
      setLoadingActivities(true);

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
      console.log("Fetch activities", res);

    } catch (err) {
      console.error("Fetch activities failed", err);
      setActivities({});
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    if (teacherId && classId) {
      fetchActivities();
    }
  }, [teacherId, classId]);

  const formatTime = (time) => {
    if (!time) return "-";
    const date = new Date(`1970-01-01T${time}`);
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return;
  };

  return (
    <div className="mainpro  teach-dash">
      <div className="td-headcard fadeIn">
        <div>
          <p className="td-greet">{getGreeting()}</p>
          <h2 className="td-name">{teacherInfo?.fullName}</h2>
          <div className="td-section"><label>Class Teacher: {classTeacher?.className}</label>
            {assignedClasses?.length > 1 && (
              <ClassSelector
                classes={assignedClasses}
                activeClassId={activeClassId}
                setActiveClassId={setActiveClassId}
              />
            )}
          </div>

        </div>

        <div className="td-avatar bounceIn"><img src="/images/defaultuser.jpg" alt="" /></div>
      </div>
      <div className="container">


        <h3 className="section-heading">Today's Schedule</h3>

        {loadingActivities ? (
          <p className="text-sm">Loading schedule...</p>
        ) : sortedTodayActivities.length === 0 ? (
          <div className="td-noactivity">
            <img src="/images/no-activity.jpg" alt="" />
          </div>
        ) : (
          <Swiper slidesPerView={1.3} spaceBetween={12}>
            {sortedTodayActivities.map((act) => (
              <SwiperSlide key={act.activityId} className="dash-card slide-card" >
                <div className={`subject-tag ${act.subjectName.toLowerCase()}`}>
                  {act.subjectName}
                </div>

                <p>{act.activityTitle || act.topicName}</p>
                <span>
                  {act.startTime} → {act.endTime}
                </span>

                <span className={`status ${act.completionStatus === "COMPLETED"
                  ? "text-success"
                  : "text-warning"
                  }`}
                >
                  {act.completionStatus}
                </span>
              </SwiperSlide>
            ))}
          </Swiper>
        )}


        <TeacherAttendanceSummary
          students={students}
          attendance={attendance} />


        {/* UPCOMING EVENTS SLIDER */}

        <h3 className="section-heading">Upcoming Events</h3>
        {loadingActivities ? (
          <p className="text-sm">Loading events...</p>
        ) : error ? (
          <p className="text-sm text-danger">Failed to load events</p>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-sm text-gray-400">No upcoming events</p>
        ) : (
          <Swiper modules={[Autoplay]}
            autoplay={{ delay: 3000 }}
            // spaceBetween={16}
            slidesPerView={"auto"}
            className="card-swiper">
            {upcomingEvents.map(event => (
              <SwiperSlide key={event.id} className="events-swiper td-eventswipe slide-card">
                <h4>{event.title}</h4>
                <p>
                  {new Date(event.startDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })} -
                  <span> ({event.location})</span>
                </p>
                <span>
                  {formatTime(event.startTime)} → {formatTime(event.endTime)}
                </span>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
}
