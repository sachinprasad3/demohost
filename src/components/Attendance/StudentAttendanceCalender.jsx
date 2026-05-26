



import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useStudent } from "../../context/StudentContext";
import { useGetStudentAttendanceByStudentId } from "../../services/attendance.services";
import { useAuth } from "../../context/AuthContext";

/* ---------- DATE FORMATTER (LOCAL, SAFE) ---------- */
const formatDateLocal = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};


const buildAttendanceMap = (attendanceArray = []) => {
  return attendanceArray.reduce((acc, item) => {
    acc[item.attendanceDate] = item.attendanceStatus;
    return acc;
  }, {});
};

export default function StudentAttendanceCalender({entityId,entityName}) {
  const { activeStudent } = useStudent();
  const studentId = entityId?entityId:activeStudent?.studentId;
  const studentName = entityName?entityName:activeStudent?.studentName || "Student";
const {user} = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fromAttendanceDate, setFromAttendanceDate] = useState("");
  const [toAttendanceDate, setToAttendanceDate] = useState("");
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const today = new Date();
    handleMonthChange({ activeStartDate: today });
  }, []);

 
  const { data } = useGetStudentAttendanceByStudentId(
    studentId,
    fromAttendanceDate,
    toAttendanceDate
  );

  useEffect(() => {
    if (!Array.isArray(data)) return;

    setAttendanceMap(buildAttendanceMap(data));
    setLoading(false);
  }, [data]);


  const handleMonthChange = ({ activeStartDate }) => {
    setSelectedDate(activeStartDate);

    const year = activeStartDate.getFullYear();
    const month = activeStartDate.getMonth();

    const fromDate = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === year &&
      today.getMonth() === month;

    const toDate = isCurrentMonth ? today : lastDayOfMonth;

    setFromAttendanceDate(formatDateLocal(fromDate));
    setToAttendanceDate(formatDateLocal(toDate));
  };

  /* ---------- MONTH SUMMARY ---------- */
  const getMonthSummary = () => {
    const values = Object.values(attendanceMap);

    const total = values.length;
    const present = values.filter(v => v === "PRESENT").length;
    const absent = values.filter(v => v === "ABSENT").length;

    return {
      total,
      present,
      absent,
      percent: total ? Math.round((present / total) * 100) : 0,
    };
  };

  const summary = getMonthSummary();

  /* ---------- TILE COLORING ---------- */
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";

    const key = formatDateLocal(date);
    const status = attendanceMap[key];

    if (status === "PRESENT") return "att-present";
    if (status === "ABSENT") return "att-absent";
    return "";
  };

  if (loading) return <div className="container">Loading attendance...</div>;

  return (
    <div className={user?.role==="PARENT"?"container":""}>
      {/* {studentName&&<p className="student-name">{studentName}</p>} */}

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
                onActiveStartDateChange={handleMonthChange}
                tileClassName={tileClassName}
              />
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}



