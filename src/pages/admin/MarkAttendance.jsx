import React, { useEffect, useState } from "react";

/* ---------- DUMMY STUDENTS ---------- */
const dummyStudents = [
  { id: 1, name: "Aarav Kumar" },
  { id: 2, name: "Anaya Singh" },
  { id: 3, name: "Rohan Verma" },
  { id: 4, name: "Diya Patel" },
  { id: 5, name: "Kabir Sharma" },
];

export default function MarkAttendance() {
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [attendance, setAttendance] = useState({});

  /* ---------- INIT PRESENT ---------- */
  useEffect(() => {
    const initial = {};
    dummyStudents.forEach((s) => {
      initial[s.id] = "present";
    });
    setAttendance(initial);
  }, []);

  /* ---------- HANDLERS ---------- */
  const markStatus = (id, status) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  const handleSave = () => {
    const payload = dummyStudents.map((s) => ({
      studentId: s.id,
      date,
      status: attendance[s.id],
    }));

    console.log("Attendance Payload:", payload);
    alert("Attendance marked successfully ✔");
  };

  return (
    <div className="container">
      <h3>Mark Attendance</h3>

      {/* ---------- DATE ---------- */}
      <div className="formbox searchsec">
        <ul>
          <li>
            <label>Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </li>
        </ul>
      </div>

      {/* ---------- STUDENT LIST ---------- */}
      <div className="box">
        <div className="attendance-header">
          <span>Student Name</span>
          <span>Status</span>
        </div>

        {dummyStudents.map((student) => (
          <div className="attendance-row" key={student.id}>
            <span>{student.name}</span>

            <div className="attendance-actions">
              <button
                className={`btn ${
                  attendance[student.id] === "present"
                    ? "btn-success"
                    : "btn-outline-success"
                }`}
                onClick={() => markStatus(student.id, "present")}
              >
                Present
              </button>

              <button
                className={`btn ${
                  attendance[student.id] === "absent"
                    ? "btn-danger"
                    : "btn-outline-danger"
                }`}
                onClick={() => markStatus(student.id, "absent")}
              >
                Absent
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- SAVE ---------- */}
      <div className="text-end mt-3">
        <button className="btn btn-primary" onClick={handleSave}>
          Save Attendance
        </button>
      </div>
    </div>
  );
}
