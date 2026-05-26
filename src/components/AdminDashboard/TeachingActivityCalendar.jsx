import React, { useState, useMemo } from "react";
import "react-calendar/dist/Calendar.css";
import useEvents from "../../hooks/useEvents";
import { useDashboardBirthdayReport, useDashboardDailyLessonPlanSummary } from "../../hooks/useDashboard";

export default function TeachingActivityCalendar() {

    const { events } = useEvents();
    const formattedDate = new Date().toLocaleDateString("en-CA");
    const { data: todayActivities = [] } = useDashboardDailyLessonPlanSummary(formattedDate);


    // const academicYear = getCurrentAcademicYear();
    const { data: birthdayData = {} } = useDashboardBirthdayReport();

    const today = new Date().toISOString().slice(5, 10);

    const todaysBirthdays = useMemo(() => {
        const list = birthdayData?.birthdayStudents ?? [];

        return list.filter(item => {
            if (!item.dateOfBirth) return false;
            return item.dateOfBirth.slice(5, 10) === today;
        });
    }, [birthdayData, today]);


    const capitalizeFullName = (name = "") =>
        name.toLowerCase().split(" ").filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

    const ALL_CLASSES = [
        "Toddlers",
        "Nursery",
        "Junior KG",
        "Senior KG",
    ];

    const formatTime = (time) => {
        if (!time) return "";
        return time;
    };
    const upcomingEvents = useMemo(() => {
        if (!events || !Array.isArray(events)) return [];

        return [...events]
            .filter(event =>
                new Date(event.startDate) >= new Date(formattedDate)
            )
            .sort(
                (a, b) =>
                    new Date(a.startDate) - new Date(b.startDate)
            );
    }, [events, formattedDate]);


    const normalizeClass = (name = "") => name.toLowerCase().replace(/\s+/g, "");

    const groupedActivities = useMemo(() => {
        const map = {};

        ALL_CLASSES.forEach(className => {
            const key = normalizeClass(className);

            map[key] = {
                teacher: null,
                className,
                syllabus: null,
                classwork: [],
                homework: [],
                activities: [],
                oral: [],
                assembly: [],
            };
        });


        todayActivities.forEach(item => {
            const key = normalizeClass(item.classname);

            if (!map[key]) return;

            map[key].teacher = item.full_name;

            if (!map[key].syllabus && item.syllabusname) {
                map[key].syllabus = item.syllabusname;
            }

            switch (item.plantype) {
                case "C.W":
                    map[key].classwork.push(item);
                    break;
                case "H.W":
                    map[key].homework.push(item);
                    break;
                case "Activity":
                    map[key].activities.push(item);
                    break;
                case "Oral":
                    map[key].oral.push(item);
                    break;
                case "Assembly":
                    map[key].assembly.push(item);
                    break;
            }
        });


        return Object.values(map);
    }, [todayActivities]);


    const classColorMap = {
        "Toddlers": "toddlers",
        "Nursery": "nursery",
        "Junior KG": "junior-kg",
        "Senior KG": "senior-kg"
    };

    return (
        <div className="report-container p-0 teaching-activity mt-2">
            <h3>Today's Events & Learning</h3>
            <ul>
                <li>
                    <div className="whitebox chart-section">
                        <div className="birthday-event-wrapper">

                            <div className="birthday-section">
                                <h6 className="sub-title">Birthdays Today</h6>

                                <div className="attend-status class-row">
                                    {todaysBirthdays.length === 0 && (
                                        <p className="alert alert-warning mb-0 w-100">No birthdays today</p>
                                    )}

                                    {todaysBirthdays.map((item, index) => {
                                        const name = [
                                            item.firstName,
                                            item.middleName,
                                            item.lastName
                                        ].filter(Boolean).join(" ");

                                        return (
                                            <div
                                                key={index}
                                                className={`status-box ${classColorMap[item.className] || ""}`}
                                            >
                                                <div className="teacher-info">
                                                    <div className="teacher-avatar">
                                                        {name?.charAt(0)?.toUpperCase() || "-"}
                                                    </div>

                                                    <div className="teacher-nameclass">
                                                        <p className="teacher-name">
                                                            {capitalizeFullName(name)}
                                                        </p>
                                                        <p className="teacher-class">
                                                            Student – {item.className}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                </div>
                            </div>

                            <div className="event-section">
                                <h6 className="sub-title">Upcoming Events</h6>

                                <div className="class-row up-events">
                                    {upcomingEvents.length === 0 && (
                                        <p className="alert alert-warning mb-0 w-100">No upcoming events</p>
                                    )}

                                    {upcomingEvents.map((event) => {
                                        const start = new Date(event.startDate);
                                        const end = event.endDate ? new Date(event.endDate) : null;

                                        const startDay = start.getDate();
                                        const endDay = end ? end.getDate() : null;

                                        const month = start.toLocaleString("en-US", { month: "short" }).toUpperCase();

                                        return (
                                            <div key={event.id} className={`status-box senior-kg event-box ${event.type}`}>
                                                <div className="teacher-info">
                                                    <div className="date-badge blue">
                                                        <span>
                                                            {endDay && endDay !== startDay ? `${startDay}-${endDay}` : startDay}
                                                        </span>
                                                        <small>{month}</small>
                                                    </div>

                                                    <div className="info">
                                                        <p className="teacher-name">{event.title}</p>

                                                        {event.location && (
                                                            <p className="teacher-class">{event.location}</p>
                                                        )}

                                                        {(event.startTime || event.endTime) && (
                                                            <small className="teacher-class">
                                                                {event.startTime && formatTime(event.startTime)}
                                                                {event.startTime && event.endTime && " → "}
                                                                {event.endTime && formatTime(event.endTime)}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <div className="whitebox chart-section">
                        <div className="attendance-card ">
                            <h6 className="sub-title">Today's Teaching Overview</h6>

                            <div className="class-row teach-overview">
                                {groupedActivities.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`status-box ${classColorMap[item.className] || ""}`}
                                    >
                                        <div className="teacher-info">
                                            <div className="teacher-avatar">
                                                {item.teacherImage ? (
                                                    <img
                                                        src={item.teacherImage}
                                                        alt={item.teacher}
                                                        className="teacher-avatar-img"
                                                    />
                                                ) : (
                                                    <span>
                                                        {item.teacher ? item.teacher.charAt(0) : "-"}
                                                    </span>
                                                )}
                                            </div>


                                            <div className="teacher-nameclass">
                                                <p className="teacher-name">
                                                    {item.teacher || "Not Assigned"}
                                                </p>
                                                <p className="teacher-class">{item.className}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>


                            <h4 className="sub-title">Activity Details</h4>

                            <div className="class-row">
                                {groupedActivities.map((item, index) => (
                                    <div key={index} className="class-row-inner">
                                        <div className="activity-header">
                                            <span className="teacher-name">
                                                {item.teacher || "Not Assigned"}
                                            </span>
                                            <span className="teacher-class">{item.className}</span>
                                        </div>

                                        <div className="activity-progress">
                                            <div className="activity-content">

                                                {item.classwork.length === 0 &&
                                                    item.homework.length === 0 &&
                                                    item.activities.length === 0 &&
                                                    item.oral.length === 0 &&
                                                    item.assembly.length === 0 && (
                                                        <p className="no-data">No teaching plan available</p>
                                                    )}

                                                {item.syllabus && (
                                                    <div>
                                                        <span className="teacher-name">Syllabus :</span>{" "}
                                                        <span className="teacher-class single-line-ellipsis">
                                                            {item.syllabus}
                                                        </span>
                                                    </div>
                                                )}

                                                {item.classwork.length > 0 && (
                                                    <div>
                                                        <span className="teacher-name">Classwork :</span>{" "}
                                                        <span className="teacher-class single-line-ellipsis">
                                                            {item.classwork
                                                                .map(cw => `${cw.subject} – ${cw.activitydetails || cw.activitytitle}`)
                                                                .join(", ")}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* {item.homework.length > 0 && (
                                                    <div>
                                                        <span className="teacher-name">Homework :</span>{" "}
                                                        <span className="teacher-class single-line-ellipsis">
                                                            {item.homework
                                                                .map(hw => `${hw.subject} – ${hw.activitydetails || hw.activitytitle}`)
                                                                .join(", ")}
                                                        </span>
                                                    </div>
                                                )} */}


                                                {/* {item.activities.length > 0 && (
                                                    <p>
                                                        <span className="teacher-name">Activity :</span>{" "}
                                                        <span className="teacher-class single-line-ellipsis">
                                                            {item.activities
                                                                .map(act => act.activitytitle || act.themename)
                                                                .join(", ")}
                                                        </span>
                                                    </p>
                                                )}

                                                {item.oral.length > 0 && (
                                                    <p>
                                                        <span className="teacher-name">Oral :</span>{" "}
                                                        <span className="teacher-class">Conducted</span>
                                                    </p>
                                                )} */}

                                                {/* {item.assembly.length > 0 && (
                                                    <div>
                                                        <span className="teacher-name">Assembly :</span>{" "}
                                                        <span className="teacher-class">Participated</span>
                                                    </div>
                                                )} */}

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    );
}
