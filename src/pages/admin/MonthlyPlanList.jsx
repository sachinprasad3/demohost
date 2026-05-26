import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useClasses from "../../hooks/useClasses";
import { Pencil, X } from "lucide-react";
import { getCurrentAcademicYear } from "../../utils";
import { deleteMonthlySyllabusById, getAllMonthlySyllabus } from "../../services/monthlyPlan.services";
import Popup from "../../components/Popup";
import { useNotification } from "../../context/NotificationContext";

export default function MonthlyPlanList() {
    const academicYear = getCurrentAcademicYear();
    const { classes } = useClasses(academicYear);
    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const { showNotification } = useNotification();
    const [data, setData] = useState([]);
    const [classFilter, setClassFilter] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await getAllMonthlySyllabus();
        setData(res?.data || []);
    };

    const filteredData = classFilter
        ? data.filter(d => String(d.classId) === classFilter)
        : data;


    const handleDeleteConfirm = async () => {
        if (!selectedId) return;

        try {
            await deleteMonthlySyllabusById(selectedId);

            setData(prev =>
                prev.filter(item => item.monthlySyllabusId !== selectedId)
            );
            showNotification({
                message: "Monthly Plan Deleted Successfully",
                type: "success",
            });

            setShowDeletePopup(false);
            setSelectedId(null);
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete monthly plan");
            showNotification({
                message: "Failed to delete monthly plan",
                type: "error",
            });
        }
    };

    const handleDeleteCancel = () => {
        setShowDeletePopup(false);
        setSelectedId(null);
    };


    return (
        <div className="container">

            <div className="addfee-head whitebox msl-headbox mb-2">
                {/* <h3 className="m-0">Subject-wise Monthly Plan</h3> */}
                <div className="form-group msl-class">
                    <div>Filter by Class</div>
                    <select
                        className="form-control"
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                    >
                        <option value="">All Classes</option>
                        {classes?.map(cls => (
                            <option key={cls.classId} value={cls.classId}>
                                {cls.className}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() =>
                        navigate("../monthly-plan")
                    }
                >
                    + Add Plan
                </button>
            </div>

            {filteredData.length === 0 && (
                <div className="whitebox text-center mt-2">
                    <p className="text-muted mb-0">
                        No monthly plan found for the selected class.
                    </p>
                </div>
            )}

            {/* LIST */}
            {filteredData.map(item => {
                return (
                    <div key={item.monthlySyllabusId} className="mb-4">

                        <div className="addfee-head msl-header">
                            <div className="msl-classbox">
                                <strong>{item.className}</strong>
                                {/* <span className="text-muted ms-2">
                                    ({item.academicYear})
                                </span> */}
                            </div>

                            <div>
                                <button
                                    type="button"
                                    className="editbtn"
                                    title="Edit Monthly Syllabus"
                                    onClick={() =>
                                        navigate("../monthly-plan", {
                                            state: {
                                                monthlySyllabusId: item.monthlySyllabusId,
                                            },
                                        })
                                    }
                                >
                                    <Pencil size={14} />
                                    <span className="ms-1">Edit</span>
                                </button>
                                <button
                                    type="button"
                                    className="ms-2 crossbtn"
                                    title="Delete Monthly Syllabus"
                                    onClick={() => {
                                        setSelectedId(item.monthlySyllabusId);
                                        setShowDeletePopup(true);
                                    }}

                                >
                                    <X size={14} />
                                    <span className="ms-1">Delete</span>
                                </button>
                            </div>
                        </div>


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
            {showDeletePopup && (
                <Popup
                    title="Delete Monthly Plan"
                    closeOnOutsideClick={false}
                    onClose={handleDeleteCancel}
                    onSave={handleDeleteConfirm}
                    saveText="Delete"
                    submitClass="dangerBtn"
                >
                    <p>Are you sure you want to delete this monthly plan?</p>
                </Popup>
            )}


        </div>
    );
}
