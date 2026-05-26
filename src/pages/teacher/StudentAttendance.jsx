import React, { useEffect, useState, useMemo } from "react";
import { useGetStudents } from "../../services/homework.services";
import { useAuth } from "../../context/AuthContext";
import useClasses from "../../hooks/useClasses";
import {
  useCreateAttendance,
  useGetAttendance,
  useGetStudentByClass,
} from "../../services/attendance.services";
import { Loader } from "lucide-react";
import MarkAttendance from "../../components/Attendance/MarkAttendance";
import SeeStudentAttendance from "../../components/Attendance/SeeStudentAttendanceTable";
import StudentAttendanceTable from "../../components/Attendance/SeeStudentAttendanceTable";

const MarkStudentAttendance = () => {
  const { user } = useAuth();
  const classId = user?.teacherInfo?.classId;
  const teacherId = user?.teacherInfo?.teacherId;
  const { getClassNameByClassId } = useClasses();
  const [selectedClass, setSelectedClass] = useState(classId || "");

  const attendanceDate = new Date().toISOString().split("T")[0];
const {classes} = useClasses()
  const { data: students = [],isLoading: studentLoading } = useGetStudentByClass(selectedClass);
  const { data: attendance = [], isLoading: attendanceLoading } = useGetAttendance(selectedClass, attendanceDate);
  const { mutate: createAttendance, isPending } = useCreateAttendance();
  const isAttendanceAvailable =
    Array.isArray(attendance) && attendance.length > 0;
  const [showDropDown, setShowDropDown] = useState("MarkAttendance")
  const [open, setOpen] = useState(false);

  const tableData = useMemo(() => {
    const source = isAttendanceAvailable ? attendance : students;

    return source?.map(item => ({
      studentId: item.studentId,
      rollNumber: item.rollNumber ?? item.rollNo,
      studentName: item.studentFullName ?? item.studentName,
      attendanceStatus: item.attendanceStatus ?? "PRESENT", //  empty string fallback
      attendanceId:item.attendanceId || null,

    }));
  }, [students, attendance, isAttendanceAvailable]);








  const getTodayDate = () =>
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    if(studentLoading || attendanceLoading){
        return <Loader/>
    }
 
  return (
    <div className="mainpro">
      <div className="container">

      {/* <div
      className="d-flex justify-content-end mb-3 position-relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="btn btn-primary">
        More
      </button>

      {open && (
        <div
          className="dropdown-menu show"
          style={{ right: 0, left: "auto", top:38 }}
        >
          <button
            className="dropdown-item"
            onClick={() => setShowDropDown("MarkAttendance")}
          >
            Mark Attendance
          </button>

          <button
            className="dropdown-item"
            onClick={() => setShowDropDown("AttendanceHistory")}
          >
            Attendance History
          </button>
        </div>
      )}
    </div> */}
    {showDropDown === "MarkAttendance" &&
    <>
        <div className="whitebox">
          {user?.role === "TEACHER"&& <div className="d-flex flex-column flex-md-row justify-content-between gap-1">
             <div>
              <strong>Teacher Name:</strong> <span>{user?.teacherInfo?.fullName ?? "—"}</span>
            </div>
            <div>
              <strong>Class:</strong> <span>{getClassNameByClassId(selectedClass)}</span>
            </div> 
            <div><strong>Date:</strong> <span>{getTodayDate()}</span>
            </div>
          </div>}
          {user?.role === "ADMIN" && <ul>
            <li>
            <select
              className="form-control"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.className}
                </option>
              ))}
            </select>
          </li>
          </ul>}
          
        </div>

        

        <MarkAttendance
  tableData={tableData}
  attendanceDate={attendanceDate}
  teacherId={teacherId}
  isLoading={studentLoading || attendanceLoading}
  isSaving={isPending}
  onSave={createAttendance}
/>
</>
}

{/* {showDropDown === "AttendanceHistory" &&
<StudentAttendanceTable
      classId={user?.teacherInfo?.classId}
      classes={classes}
      showClassSelector={user?.role === "TEACHER"?false:true}
    />
} */}
      </div>
    </div>
  );
};

export default MarkStudentAttendance;






