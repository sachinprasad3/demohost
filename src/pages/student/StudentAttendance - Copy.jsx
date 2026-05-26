import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useStudent } from "../../context/StudentContext";

/* ---------- STATUS MAP ---------- */
const STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
};

/* ---------- DUMMY ATTENDANCE (3 MONTHS) ---------- */
const generateDummyAttendance = () => {
  const data = [];

  const months = [
    { year: 2026, month: 0 }, // Jan
    { year: 2026, month: 1 }, // Feb
    { year: 2026, month: 2 }, // Mar
  ];

  months.forEach(({ year, month }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Pick 8–12 absent days for this month
    const absentCount = Math.floor(Math.random() * 5) + 8; // 8–12
    const absentDays = new Set();

    while (absentDays.size < absentCount) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      absentDays.add(day);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dayOfWeek = dateObj.getDay();

      // Skip Sundays
      if (dayOfWeek === 0) continue;

      data.push({
        date: dateObj.toLocaleDateString("en-CA"), // YYYY-MM-DD
        status: absentDays.has(d) ? "absent" : "present",
      });
    }
  });

  return data;
};

/* ---------- COMPONENT ---------- */
export default function StudentAttendance() {
  const { activeStudent } = useStudent();
  const studentName = activeStudent?.studentName || "Student";

  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  /* ---------- helpers ---------- */
  const formatDate = (date) =>
    date.toLocaleDateString("en-CA");

  /* ---------- load dummy data ---------- */
useEffect(() => {
  setLoading(true);
  setTimeout(() => {
    setAttendance(generateDummyAttendance());
    setLoading(false);
  }, 400);
}, []);

  /* ---------- summary ---------- */
  const totalDays = attendance.length;
  const presentDays = attendance.filter(
    (a) => a.status === STATUS.PRESENT
  ).length;
  const absentDays = attendance.filter(
    (a) => a.status === STATUS.ABSENT
  ).length;

  const presentPercent = totalDays
    ? Math.round((presentDays / totalDays) * 100)
    : 0;
 
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";

    const record = attendance.find(
      (a) => a.date === formatDate(date)
    );

    return record ? `att-${record.status}` : "";
  };

  return (
    <div className="container">
      <p className="student-name">{studentName}</p>

      <div className="formbox searchsec attendance">
        <ul>
          <li className="fullsec">
            <div className="box present">
              <strong>{presentPercent}%</strong>
              <div>Present</div>
            </div>
            <div className="box">
              <strong>{presentDays}</strong>
              <div>Present Days</div>
            </div>
            <div className="box">
              <strong>{absentDays}</strong>
              <div>Absent Days</div>
            </div>
          </li>

          <li className="fullsec">
            <div className="event-calendar">
              <Calendar
                value={selectedDate}
                onActiveStartDateChange={({ activeStartDate }) =>
                  setSelectedDate(activeStartDate)
                }
                tileClassName={tileClassName}
              />
            </div>
          </li>
        </ul>
      </div>
 
    </div>
  );
}
