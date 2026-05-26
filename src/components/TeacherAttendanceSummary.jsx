import React, { useMemo } from "react";
import { Users, UserCheck, UserX } from "lucide-react";

export default function TeacherAttendanceSummary({
    students = [],
    attendance = [],
}) {

    const { totalStudents, present, absent } = useMemo(() => {
        const totalStudents = students.length;

        let present = 0;
        let absent = 0;

        attendance.forEach(item => {
            if (item.attendanceStatus === "PRESENT") present++;
            if (item.attendanceStatus === "ABSENT") absent++;
        });

        return { totalStudents, present, absent };
    }, [students, attendance]);

    return (
        <div className="teacher-attendance-wrap">
            <h4 className="teacher-attendance-title">
                Today&apos;s Attendance
            </h4>

            <div className="teacher-attendance-cards">
                <div className="teacher-att-card totalstd">
                    <div className="teacher-att-icon">
                        <Users />
                    </div>
                    <div className="teacher-att-info">
                        <span>Total</span>
                        <strong>{totalStudents}</strong>
                    </div>
                </div>

                <div className="teacher-att-card present">
                    <div className="teacher-att-icon">
                        <UserCheck />
                    </div>
                    <div className="teacher-att-info">
                        <span>Present</span>
                        <strong>{present}</strong>
                    </div>
                </div>

                <div className="teacher-att-card absent">
                    <div className="teacher-att-icon">
                        <UserX />
                    </div>
                    <div className="teacher-att-info">
                        <span>Absent</span>
                        <strong>{absent}</strong>
                    </div>
                </div>
            </div>

        </div>
    );
}
