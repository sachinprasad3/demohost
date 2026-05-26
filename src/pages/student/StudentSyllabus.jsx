import { useEffect, useState } from "react";
import { getAllMonthlySyllabus } from "../../services/monthlyPlan.services";
import { useStudent } from "../../context/StudentContext";

export default function StudentSyllabus() {
    const [data, setData] = useState([]);
    const [classFilter] = useState("");
    const { activeStudent } = useStudent();
    const studentClassId = activeStudent?.data?.classId;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await getAllMonthlySyllabus();
        setData(res?.data || []);
    };

    const filteredData = data.filter(item => {
        if (!studentClassId) return false;

        if (classFilter) {
            return (
                String(item.classId) === classFilter &&
                item.classId === studentClassId
            );
        }

        return item.classId === studentClassId;
    });

    return (
        <div className="container">
            {filteredData.length === 0 && (
                <div className="whitebox text-center mt-2">
                    <p className="text-muted mb-0">
                        No syllabus found.
                    </p>
                </div>
            )}

            {/* LIST */}
            {filteredData.map(item => {
                return (
                    <div key={item.monthlySyllabusId} className="mb-4">

                        {Object.entries(item.months || {}).map(([monthKey, monthData]) => (
                            <div key={monthKey} className="whitebox syllabus-box">
                                <div className="repeat-row">

                                    <div className="month-box">
                                        <div className="form-group msl-list">
                                            <label>Month</label>
                                            <p>{monthData.monthName}</p>
                                        </div>

                                        {monthData.themes?.some(t => t.themeName) && (
                                            <div className="form-group msl-list">
                                                <label>Themes</label>
                                                <ul>
                                                    {monthData.themes
                                                        .filter(t => t.themeName)
                                                        .map((t, i) => (
                                                            <li key={i}>{t.themeName}</li>
                                                        ))}
                                                </ul>
                                            </div>
                                        )}

                                    </div>

                                    {/* SUBJECTS */}
                                    <div className="repeat-box">
                                        <ul>
                                            {monthData.subjects?.map((sub, si) => (
                                                <li key={si}>
                                                    <div className="theme-box">

                                                        <div className="form-group msl-list">
                                                            <label>Subject</label>
                                                            <p>{sub.subjectName}</p>
                                                        </div>

                                                        {monthData.subjects?.some(sub => sub.activities) && (
                                                            <div className="form-group msl-list">
                                                                <label>Activities</label>
                                                                <ul>
                                                                    {sub.activities.map((act, ai) => (
                                                                        <li key={ai}>{act}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                </div>

                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
