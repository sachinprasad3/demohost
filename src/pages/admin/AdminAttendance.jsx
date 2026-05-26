// AdminAttendance.jsx
import React, { useState, useMemo } from "react";  
const MONTHS = {
  JAN: { label: "January 2026", days: 31 },
  FEB: { label: "February 2026", days: 28 },
  MAR: { label: "March 2026", days: 31 },
};

/* ---------- CLASS WISE STUDENTS ---------- */
const CLASS_STUDENTS = {
  Nursery: [
    { id: 1, name: "Aarav Kumar" },
    { id: 2, name: "Ananya Singh" },
  ],
  LKG: [
    { id: 3, name: "Rohan Verma" },
    { id: 4, name: "Kavya Sharma" },
  ],
  UKG: [
    { id: 5, name: "Aditya Patel" },
    { id: 6, name: "Sneha Roy" },
  ],
};

/* ---------- ATTENDANCE GENERATOR ---------- */
const generateAttendance = (days) =>
  Array.from({ length: days }, () => (Math.random() > 0.25 ? "P" : "A"));

export default function AdminAttendance() {
  const [selectedClass, setSelectedClass] = useState("Nursery");
  const [selectedMonth, setSelectedMonth] = useState("JAN");

  const daysInMonth = MONTHS[selectedMonth].days;

  /* regenerate attendance only when class/month changes */
  const students = useMemo(() => {
    return CLASS_STUDENTS[selectedClass].map((s) => ({
      ...s,
      attendance: generateAttendance(daysInMonth),
    }));
  }, [selectedClass, selectedMonth, daysInMonth]);

  const getTotals = (attendance) => {
    const present = attendance.filter((a) => a === "P").length;
    return {
      present,
      absent: attendance.length - present,
    };
  };

  return (
    <div className="container">
      {/* ---------- HEADER ---------- */}
      <div className="formbox searchsec">
          <ul>
            <li>
              <select
            className="form-control"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {Object.keys(CLASS_STUDENTS).map((cls) => (
              <option key={cls}>{cls}</option>
            ))}
          </select>
            </li>
            <li>
               <select
            className="form-control"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="JAN">January</option>
            <option value="FEB">February</option>
            <option value="MAR">March</option>
          </select>
            </li>
            
          </ul>
          

         
        </div>

      <small className="month-label">
        {selectedClass} – {MONTHS[selectedMonth].label}
      </small>

      {/* ---------- TABLE ---------- */}
      <div className="table-wrap">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student</th>
              {[...Array(daysInMonth)].map((_, i) => (
                <th key={i}>{i + 1}</th>
              ))}
              <th>P</th>
              <th>A</th>
            </tr>
          </thead>

          <tbody>
            {students.map((stu) => {
              const totals = getTotals(stu.attendance);

              return (
                <tr key={stu.id}>
                  <td className="student-name">{stu.name}</td>

                  {stu.attendance.map((st, i) => (
                    <td key={i} className="icon-cell">
                      {st === "P" ? (
                        <span className="present">✔</span>
                      ) : (
                        <span className="absent">✖</span>
                      )}
                    </td>
                  ))}

                  <td className="total present-total">{totals.present}</td>
                  <td className="total absent-total">{totals.absent}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
