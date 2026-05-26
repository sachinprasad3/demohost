
import React, { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getInitials } from "../../utills/constants";

const MarkAttendance = ({
  tableData = [],
  attendanceDate,
  teacherId,
  onSave,
  isSaving,
  isLoading,
}) => {
  const [date, setDate] = useState(attendanceDate);
  const [attendancePayload, setAttendancePayload] = useState([]);
const navigate = useNavigate()
  /* ---------- INIT PRESENT ---------- */
  useEffect(() => {
    if (!tableData.length) return;

    const payload = tableData.map(item => ({
      studentId: item.studentId,
      attendanceStatus: item.attendanceStatus || "PRESENT",
      attendanceDate: date,
      attendanceId: item.attendanceId || null,
      teacherId,
      markedBy: teacherId?String(teacherId):"Admin",
      dataSource: "App",
    }));

    setAttendancePayload(payload);
  }, [tableData, date, teacherId]);

  /* ---------- HANDLERS ---------- */
  const markStatus = (studentId, status) => {
    setAttendancePayload(prev =>
      prev.map(item =>
        item.studentId === studentId
          ? { ...item, attendanceStatus: status }
          : item
      )
    );
  };

  const handleSave = () => {
    onSave(attendancePayload);
    navigate('/teacher/attendance-History')
  };

  if (isLoading) return <Loader />;

  if (!tableData.length) {
    return <div>No students found</div>;
  }

  return (
    <>      
    <style>
      {`.attendance-header,.attendance-row{
      grid-template-columns:60px 60px 1fr 90px;
      }`}
    </style>
      <div className="box">
        <div className="attendance-header">
          <span>Image</span>
          <span>Roll</span>
          <span>Student Name</span>
          <span>Status</span>
        </div>

        {tableData.map(student => {
          const current = attendancePayload.find(
            s => s.studentId === student.studentId
          );

          const status = current?.attendanceStatus;

          return (
            <div className="attendance-row" key={student.studentId} >
              <span>{student?.studentImg?(<img className="simg" src={student?.studentImg} alt={student.studentName} />):( <span className="simg fw-semibold">{getInitials(student?.studentName || "")}</span>)}</span>
               <span>{student.rollNumber}</span><span>{student.studentName}</span>

              <div className="attendance-actions">
                <button
                  className={`markbtn ${
                    status === "PRESENT"
                      ? "persentbtn"
                      : " "
                  }`}
                  onClick={() =>
                    markStatus(student.studentId, "PRESENT")
                  }
                >
                  P
                </button>

                <button
                  className={`markbtn ${
                    status === "ABSENT"
                      ? "absentbtn"
                      : " "
                  }`}
                  onClick={() =>
                    markStatus(student.studentId, "ABSENT")
                  }
                >
                  A
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- SAVE ---------- */}
      <div className="text-end mt-3">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving Attendance..." : "Save Attendance"}
        </button>
      </div>
    </>
  );
};

export default MarkAttendance;
