

import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useClasses from "../../hooks/useClasses";
import {
  useCreateAttendance,
  useGetAttendance,
  useGetStudentByClass,
} from "../../services/attendance.services";
import { Loader } from "lucide-react";
import MarkAttendance from "../../components/Attendance/MarkAttendance";


import { useTeacher } from "../../context/TeacherProvider";


const MarkStudentAttendance = () => {
  const { user } = useAuth();
  const role = user?.role;
  const [adminClassId, setAdminClassId] = useState("2");

  const teacher = useTeacher();
  const classId = role === "TEACHER" ? teacher?.activeClassId ?? null : adminClassId;

  const teacherId = user?.teacherInfo?.teacherId;
  const { getClassNameByClassId, classes } = useClasses();

  const attendanceDate = new Date().toISOString().split("T")[0];

  const { data: students = [], isLoading: studentLoading } =useGetStudentByClass(classId);

  const { data: attendance = [], isLoading: attendanceLoading } =useGetAttendance(classId, attendanceDate);

  const { mutate: createAttendance, isPending } = useCreateAttendance();

  const isAttendanceAvailable =
    Array.isArray(attendance) && attendance.length > 0;

  const tableData = useMemo(() => {
    const source = isAttendanceAvailable ? attendance : students;

    return source.map((item) => ({
      studentId: item.studentId,
      rollNumber: item.rollNumber ?? item.rollNo,
      studentName: item.studentFullName ?? item.studentName,
      attendanceStatus: item.attendanceStatus ?? "PRESENT",
      attendanceId: item.attendanceId ?? null,
      studentImg:item.photo ?? item?.profilePhotoURL ?? ""
    }));
  }, [students, attendance, isAttendanceAvailable]);

  if (studentLoading || attendanceLoading) {
    return <Loader />;
  }

  return (
    <div className="mainpro">
      <div className="container">
        
         <div className="whitebox">
      {role === "TEACHER" && (
        <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
          <div>
            <strong>Teacher:</strong> {user?.teacherInfo?.fullName ?? "—"}
          </div>
          <div>
            <strong>Class:</strong> {getClassNameByClassId(classId) ?? "—"}
          </div>
          <div>
            <strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}
          </div>
        </div>
      )}

      {(role === "ADMIN" || role === "OWNER")&& (
        <select
          className="form-control"
          value={classId}
          onChange={(e) => setAdminClassId(e.target.value)}
        >
          <option value="" disabled>Select Class</option>
          {classes.map((cls) => (
            <option key={cls.classId} value={cls.classId}>
              {cls.className}
            </option>
          ))}
        </select>
      )}
    </div>

        {role === "TEACHER" ? (
  classId ? (
    <MarkAttendance
      tableData={tableData}
      attendanceDate={attendanceDate}
      teacherId={teacherId}
      isLoading={studentLoading || attendanceLoading}
      isSaving={isPending}
      onSave={createAttendance}
    />
  ) : (
    <div>No assigned classes</div>
  )
) : (
  <MarkAttendance
    tableData={tableData}
    attendanceDate={attendanceDate}
    teacherId={teacherId}
    isLoading={studentLoading || attendanceLoading}
    isSaving={isPending}
    onSave={createAttendance}
  />
)}

      </div>
    </div>
  );
};

export default MarkStudentAttendance;
