
import React, { useState, useEffect } from "react";
import { useGetStudentAttendanceByClassId } from "../../services/attendance.services";
import useAcademicYears from "../../hooks/useAcademicYears";
import { getCurrentAcademicYear } from "../../utils";

const MONTHS = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];
 
const getDayType = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0) return "sun";
  if (dayOfWeek === 6) return "sat";
  return "";
};

const getDaysInMonth = (year, month) =>
  new Date(year, month, 0).getDate();

const getCalendarYear = (academicYear, month) => {
  const [startYear, endYear] = academicYear.split("-").map(Number);
  return month >= 4 ? startYear : endYear;
};

export default function StudentAttendanceTable({
  classId = "",          
  classes = [],
  showClassSelector = true,
}) {
  const currentAcademicYear = getCurrentAcademicYear();
  const { academicYears } = useAcademicYears(); 
  const [localClassId, setLocalClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const effectiveClassId = showClassSelector ? localClassId : classId;
  const shouldFetch = Boolean(effectiveClassId);
  const { data: response } = useGetStudentAttendanceByClassId(
    effectiveClassId,
    selectedYear,
    selectedMonth,
    { enabled: shouldFetch }
  );

const students = response?.data ?? [];
const workingDays = response?.workingDays ?? 0;
const calendarYear = getCalendarYear(selectedYear, selectedMonth); 
  const daysInMonth = getDaysInMonth(calendarYear, selectedMonth);
  useEffect(() => {
    setLocalClassId(classId)
  }, [classId]) 
const holidaysMap = {
  // 1: [`${calendarYear}-01-14`, `${calendarYear}-01-26`], // January
  // 2: [`${calendarYear}-02-08`],                          // February
  // 4: [`${calendarYear}-04-14`],                          // April
  // 8: [`${calendarYear}-08-15`],                          // August
  // 10: [`${calendarYear}-10-02`],                         // October
  // 12: [`${calendarYear}-12-25`]                          // December
};

const holidays = holidaysMap[selectedMonth] || []; 
  const getDayLabel = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <> 
      <div className="formbox searchsec whitebox">
        <ul>
          {showClassSelector && (
            <li>
              <div className="form-group">
                <label>Select Class</label>
                <select
                  className="form-control"
                  value={localClassId}
                  onChange={(e) => setLocalClassId(e.target.value)}
                >
                  <option value="" disabled>Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          )}

          <li>
            <div className="form-group">
              <label>Select Month</label>
              <select
                className="form-control"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </li>

          <li>
            <div className="form-group">
              <label>Select Year</label>
              <select
                className="form-control"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {academicYears?.map((year) => (
                  <option
                    key={year.academicYear}
                    value={year.academicYear}
                  >
                    {year.academicYear}
                  </option>
                ))}
              </select>
            </div>
          </li>
        </ul>
      </div>

 
      {!effectiveClassId ? (
        <div>Please select a class</div>
      ) : students.length === 0 ? (
        <div>No students found for this class</div>
      ) : (
        <div className="listsec syllabus-master attendance-history">
          <div className="attendance-indicate whitebox">
            <div className="open-days">
              {MONTHS.find((m) => m.value === selectedMonth)?.label} – (Academic Days : {workingDays})
            </div>
           <div className="indication">
            <span><span className="present">✔</span> Present</span>
            <span><span className="absent">✖</span> Absent</span>
            {/* <span><span className="holiday-box"></span> Holiday</span> */}
          </div>

          </div>
          <div className="theading paymentbox listbox ">
            <div className="roll-no">Roll No.</div>
            <div className="name-head">Student</div>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const label = getDayLabel(calendarYear, selectedMonth, day).slice(0, 2); 
              return (
                <div className="icon-cell day-head" key={day}>
                  <div className="day-num">{day} <span>{label}</span></div> 
                </div>
              );
            })} 
           <div className="icon-cell day-head"><div>P</div></div>
           <div className="icon-cell day-head"><div>A</div></div>
          </div>

          <ul>
            {students.map((stu, index) => (
              <li key={stu.studentId}>
                <div className="listbox paymentbox">
                  <div className="hidden-div"></div>
                  <div data-head="Roll No." className="roll-no">{stu.rollNo ?? index + 1}</div>
                  <div data-head="Name" className="name-head ">{stu.fullName}</div> 
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dayStr = String(day).padStart(2, "0");
                    const monthStr = String(selectedMonth).padStart(2, "0");
                    const dateKey = `${calendarYear}-${monthStr}-${dayStr}`;
                    const status = stu.attendance?.[dateKey]; 
                    const isHoliday = holidays.includes(dateKey);
                    const dayClass = getDayType(calendarYear, selectedMonth, day); 
                    return ( 
                    <div key={i} className={`icon-cell ${dayClass} ${isHoliday ? "holiday" : ""}`}>
                    {isHoliday && (<span className="holiday-mark"><small>{day}</small> H</span>)}
                    {!isHoliday && status === "P" && (<span className="present"><small>{day}</small> ✔</span>)}
                    {!isHoliday && status === "A" && (<span className="absent"><small>{day}</small> ✖</span>)} 
                    {!isHoliday && status !== "P" && status !== "A" && (
                    <>
                    {dayClass === "sat" && (
                    <span className="neutral"><small>{day}</small> Sa</span>)}
                    {dayClass === "sun" && (<span className="neutral"><small>{day}</small> Su</span>)}
                    {dayClass === "" && (<span className="neutral notatt"><small>{day}</small> -</span>)}
                    </>
                    )} 
                    </div> 
                    );
                  })} 
                  <div data-head="P" className="total present-total">{stu.totalNoOfPresentDays}</div>
                  <div data-head="A" className="total absent-total">{stu.totalNoOfAbsentDays}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
