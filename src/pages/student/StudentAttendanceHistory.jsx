import React, { useEffect, useState } from 'react'
import StudentAttendanceCalender from '../../components/Attendance/StudentAttendanceCalender'
import { useAuth } from '../../context/AuthContext'
import { useGetStudentAttendanceByStudentId } from '../../services/attendance.services'
import { useStudent } from '../../context/StudentContext'


const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const StudentAttendanceHistory = () => {
    const { user } = useAuth()
    const { activeStudent } = useStudent();

    const studentId = activeStudent?.studentId;
    const [selectedMonth, setSelectedMonth] = useState("JAN");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    const [fromAttendanceDate, setFromAttendanceDate] = useState("");
    const [toAttendanceDate, setToAttendanceDate] = useState("");
    const [attendanceStatus, setAttendanceStatus] = useState("");
    
    const { data } = useGetStudentAttendanceByStudentId(studentId,fromAttendanceDate,toAttendanceDate,attendanceStatus)
const MONTH_MAP = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

  useEffect(() => {
  if (!selectedMonth || !selectedYear) return;

  const MONTH_MAP = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
  };

  const monthIndex = MONTH_MAP[selectedMonth];
  const year = Number(selectedYear);

  const fromDate = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  const today = new Date();

  const isCurrentMonth =
    today.getFullYear() === year &&
    today.getMonth() === monthIndex;

  const toDate = isCurrentMonth ? today : lastDayOfMonth;

  setFromAttendanceDate(formatDateLocal(fromDate)); // ✅ FIXED
  setToAttendanceDate(formatDateLocal(toDate));     // ✅ FIXED
}, [selectedMonth, selectedYear]);



    console.log("data from student AttendanceHistory", data, studentId)


    return (
        <div className="container">

            {/* <div className="formbox searchsec">
                <ul className="list-unstyled">
  <li className="d-flex gap-2">
    
    <select
      className="form-control"
      value={selectedMonth}
      onChange={(e) => setSelectedMonth(e.target.value)}
    >
      <option value="JAN">January</option>
      <option value="FEB">February</option>
      <option value="MAR">March</option>
      <option value="APR">April</option>
      <option value="MAY">May</option>
      <option value="JUN">June</option>
      <option value="JUL">July</option>
      <option value="AUG">August</option>
      <option value="SEP">September</option>
      <option value="OCT">October</option>
      <option value="NOV">November</option>
      <option value="DEC">December</option>
    </select>
 </li>
 <li className="d-flex gap-2">
  
   <select
  className="form-control"
  value={selectedYear}
  onChange={(e) => setSelectedYear(Number(e.target.value))}
>

      {Array.from({ length: 5 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return (
          <option key={year} value={year}>
            {year}
          </option>
        );
      })}
    </select>
  </li>
  <li className="d-flex gap-2">
    
    <select
      className="form-control"
      value={attendanceStatus}
      onChange={(e) => setAttendanceStatus(e.target.value)}
    >
        <option value="">Select attendance status</option>
      <option value="PRESENT">Present</option>
      <option value="ABSENT">Absent</option>
    </select>
 </li>

</ul>




            </div> */}
            <StudentAttendanceCalender

            />
        </div>
    )
}

export default StudentAttendanceHistory
