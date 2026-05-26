import React, { useEffect, useState } from "react";
import { Loader } from "lucide-react";

const MarkAttendance = ({
  tableData = [],
  attendanceDate,
  teacherId,
  onSave,
  isSaving,
  isLoading,
}) => {
  const [attendancePayload, setAttendancePayload] = useState([]);

  useEffect(() => {
    if (!tableData.length) return;

    const payload = tableData.map(item => ({
      studentId: item.studentId,
      attendanceStatus: item.attendanceStatus || "PRESENT",
      attendanceDate,
      attendanceId: item.attendanceId || null,
      teacherId,
      markedBy: String(teacherId),
      dataSource: "App",
    }));

    setAttendancePayload(payload);
  }, [tableData, attendanceDate, teacherId]);

  const handleAttendanceChange = studentId => {
    setAttendancePayload(prev =>
      prev.map(item =>
        item.studentId === studentId
          ? {
              ...item,
              attendanceStatus:
                item.attendanceStatus === "PRESENT"
                  ? "ABSENT"
                  : "PRESENT",
            }
          : item
      )
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!tableData.length) {
    return <div>No students found</div>;
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th className="text-center">Present / Absent</th>
            </tr>
          </thead>

          <tbody>
            {attendancePayload.map(item => {
              const student = tableData.find(
                s => s.studentId === item.studentId
              );

              return (
                <tr key={item.studentId}>
                  <td>{student?.rollNumber}</td>
                  <td>{student?.studentName}</td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={item.attendanceStatus === "PRESENT"}
                      onChange={() =>
                        handleAttendanceChange(item.studentId)
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end">
        <button
          className="btn btn-primary"
          onClick={() => onSave(attendancePayload)}
          disabled={isSaving}
        >
          {isSaving ? "Saving Attendance..." : "Save Attendance"}
        </button>
      </div>
    </>
  );
};

export default MarkAttendance;







