import React from "react";
import { UserCheck, UserX, Users } from "lucide-react";
import { useDashboardAttendanceSummary } from "../../hooks/useDashboard";

export default function TodaysAttendanceCard() {

    const ALL_CLASSES = [
        { name: "Toddlers", id: 1 },
        { name: "Nursery", id: 2 },
        { name: "Junior KG", id: 3 },
        { name: "Senior KG", id: 4 },
    ];


    const today = new Date().toLocaleDateString("en-CA");

    // const today = "2026-02-07";

    const { data, isLoading, error } = useDashboardAttendanceSummary(today);

    if (isLoading) return <p>Loading attendance...</p>;
    if (error) return <p>Failed to load attendance</p>;

    const totalStudent = data?.reduce(
        (sum, item) => sum + item.totalstudents,
        0
    );

    const present = data?.reduce(
        (sum, item) => sum + item.present,
        0
    );

    const absent = data?.reduce(
        (sum, item) => sum + item.absent,
        0
    );



    const classes = ALL_CLASSES.map((cls) => {
        const found = data?.find(
            (item) => item.class_name === cls.name
        );

        return {
            name: cls.name,
            present: found ? found.present : 0,
            total: found ? found.totalstudents : 0,
        };
    });


    return (
        <div className="attendance-card">

            <h6 className="card-title">Today's Attendance</h6>

            <div className="attend-status">
                <div className="status-box total">
                    <div className="icon">
                        <Users />
                    </div>
                    <div>
                        <small>Total</small>
                        <h4>{totalStudent}</h4>
                    </div>
                </div>

                <div className="status-box present">
                    <div className="icon">
                        <UserCheck />
                    </div>
                    <div>
                        <small>Present</small>
                        <h4>{present}</h4>
                    </div>
                </div>

                <div className="status-box absent">
                    <div className="icon">
                        <UserX />
                    </div>
                    <div>
                        <small>Absent</small>
                        <h4>{absent}</h4>
                    </div>
                </div>
            </div>

            <h6 className="sub-title">Class-wise Status</h6>

            <div className="class-row">
                {classes?.map((cls, index) => {
                    const percentage = cls.total ? (cls.present / cls.total) * 100 : 0;

                    return (
                        <div key={index} className="class-row-inner">
                            <div className="class-header">
                                <span>{cls.name}</span>
                                <span>{cls.present}/{cls.total}</span>
                            </div>

                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
