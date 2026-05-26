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

    // 8–12 absent days per month
    const absentCount = Math.floor(Math.random() * 5) + 8;
    const absentDays = new Set();

    while (absentDays.size < absentCount) {
      absentDays.add(Math.floor(Math.random() * daysInMonth) + 1);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);

      // skip Sundays
      if (dateObj.getDay() === 0) continue;

      data.push({
        date: dateObj.toLocaleDateString("en-CA"), // YYYY-MM-DD
        status: absentDays.has(d) ? STATUS.ABSENT : STATUS.PRESENT,
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
  const formatDate = (date) => date.toLocaleDateString("en-CA");

  /* ---------- load dummy data ---------- */
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAttendance(generateDummyAttendance());
      setLoading(false);
    }, 400);
  }, []);

  /* ---------- MONTH SUMMARY ---------- */
  const getMonthSummary = (year, month) => {
    const monthData = attendance.filter((a) => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const total = monthData.length;
    const present = monthData.filter(a => a.status === STATUS.PRESENT).length;
    const absent = monthData.filter(a => a.status === STATUS.ABSENT).length;

    return {
      total,
      present,
      absent,
      percent: total ? Math.round((present / total) * 100) : 0,
    };
  };

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const summary = getMonthSummary(year, month);

  /* ---------- calendar coloring ---------- */
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";

    const record = attendance.find(
      (a) => a.date === formatDate(date)
    );

    return record ? `att-${record.status}` : "";
  };

  if (loading) return <div className="container">Loading attendance...</div>;

  return (
    <div className="container">
      <p className="student-name">{studentName}</p>

      <h4 style={{ marginBottom: 10 }}>
        {selectedDate.toLocaleString("en-IN", {
          month: "long",
          year: "numeric",
        })}
      </h4>

      <div className="formbox searchsec attendance">
        <ul>
          <li className="fullsec">
            <div className="flexbox">
              <div className="box present">
                <strong>{summary.percent}%</strong>
                <div>Present</div> 
              </div>

              <div className="box pdays">
                <strong>{summary.present}</strong>
                <div>Present Days</div>
              </div>

              <div className="box absent">
                <strong>{summary.absent}</strong>
                <div>Absent Days</div>
              </div>
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
