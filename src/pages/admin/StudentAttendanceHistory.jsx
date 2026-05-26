

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useClasses from "../../hooks/useClasses";
import StudentAttendanceTable from "../../components/Attendance/SeeStudentAttendanceTable";
import { useTeacher } from "../../context/TeacherProvider";

const StudentAttendanceHistory = () => {
  const { user } = useAuth();
  const { classes } = useClasses();

  console.log("classes", classes)
  const teacher = useTeacher();



  const resolvedClassess = user?.role === "TEACHER" ? teacher.assignedClasses : classes;
  // Resolve classId safely
  const resolvedClassId = user?.role === "TEACHER" ? teacher?.activeClassId ?? "" : classes?.[0]?.classId;

  return (
    <div className="mainpro">
      <div className="container">


        {user.role === "TEACHER" ? (
          teacher?.activeClassId ?
            (<StudentAttendanceTable
              classId={resolvedClassId}
              classes={resolvedClassess}
              showClassSelector={ false}
            />) : ((<div>No assigned classes</div>))) : (
          <StudentAttendanceTable
            classId={resolvedClassId}
            classes={resolvedClassess}
            showClassSelector={
  user.role === "ADMIN" ||
  user.role === "OWNER" ||
  teacher?.assignedClasses?.length > 1
}
          />
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceHistory;
