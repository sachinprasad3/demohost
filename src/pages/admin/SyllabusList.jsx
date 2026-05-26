import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utills/axiosInstance";
import { Pencil } from "lucide-react";
import useClasses from "../../hooks/useClasses";
import useAcademicYears from "../../hooks/useAcademicYears";
import { useGetAllActiveAcademicYear } from "../../services/teachingPlan.services";

export default function SyllabusList() {
    const [syllabusList, setSyllabusList] = useState([]);
    const [activeClass, setActiveClass] = useState("ALL");
    // const { academicYears } = useAcademicYears();
        const {data: academicYears} = useGetAllActiveAcademicYear()
    
    const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
    const { classes, loading: loadingClasses } = useClasses(selectedAcademicYear);
    const navigate = useNavigate();


    // useEffect(() => {
    //     if (!academicYears.length) return;

    //     // const activeYears = academicYears.filter(
    //     //     y => y.isCurrentActive === "Y"
    //     // );

    //     if (
    //         !activeYears.some(y => y.academicYear === selectedAcademicYear)
    //     ) {
    //         setSelectedAcademicYear(
    //             activeYears[0]?.academicYear || ""
    //         );
    //     }
    // }, [academicYears, selectedAcademicYear]);



    /* -------- Fetch syllabus -------- */

    const fetchSyllabus = async () => {
        try {
            const res = await axiosInstance.get("/api/v1/syllabus/all");
            // console.log("Syllabus List:", res?.data?.data);
            setSyllabusList(res?.data?.data || []);
        } catch (err) {
            console.error("Failed to fetch syllabus list", err);
            setSyllabusList([]);
        }
    };


    useEffect(() => {
        fetchSyllabus();
    }, []);

    const getClassName = (id) => {
        if (!classes?.length) return "-";
        const cls = classes.find(c => Number(c.classId) === Number(id));
        return cls?.className || "-";
    };


    const syllabusByAcademicYear = selectedAcademicYear
        ? syllabusList.filter(
            s => s.academicYear === selectedAcademicYear
        )
        : syllabusList;

    const filteredSyllabusList =
        activeClass === "ALL"
            ? syllabusByAcademicYear
            : syllabusByAcademicYear.filter(
                item => Number(item.classId) === Number(activeClass)
            );

    const classIdsWithSyllabus = new Set(
        syllabusByAcademicYear.map(s => Number(s.classId))
    );

    const dynamicClassTabs =
        syllabusByAcademicYear.length === 0
            ? []
            : [
                { label: "All", value: "ALL" },
                ...classes
                    .filter(
                        cls =>
                            cls.active === "Y" &&
                            classIdsWithSyllabus.has(Number(cls.classId))
                    )
                    .map(cls => ({
                        label: cls.className.replaceAll("_", " "),
                        value: cls.classId,
                    })),
            ];

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";

        const d = new Date(dateStr);

        const day = String(d.getDate()).padStart(2, "0");
        const month = d.toLocaleString("en-GB", { month: "short" })
        const year = d.getFullYear();

        return `${day} ${month} ${year}`;
    };



    return (
        <div className="container syllabus-master">

            {/* ADD BUTTON */}
            <div className="d-flex justify-content-end mb-3">
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/admin/create-syllabus")}
                >
                    + Add Syllabus
                </button>
            </div>


            <div className="whitebox">
                <div className="formbox searchsec">
                    <ul>
                        <li className="fullsec">
                            <label className="form-label">Academic Year</label>
                            <select
                                className="form-control"
                                value={selectedAcademicYear}
                                onChange={(e) => {
                                    setSelectedAcademicYear(e.target.value);
                                    setActiveClass("ALL");
                                }}
                            >
                                <option value="" disabled>Select Academic Year</option>
                                {academicYears?.map(y => (
                                        <option key={y.academicYear} value={y.academicYear}>
                                            {y.academicYear}
                                        </option>
                                    ))}

                            </select>
                        </li>
                    </ul>
                </div>
            </div>


            {/* TABS */}


            {loadingClasses ? (
                <div className="alert alert-info">Loading classes...</div>
            ) : (
                dynamicClassTabs.length > 0 && (
                    <div className="syllabus-tab">
                        <div className="tabs">
                            {dynamicClassTabs.map(tab => (
                                <button
                                    key={tab.value}
                                    className={`tab ${activeClass === tab.value ? "activeTab" : ""}`}
                                    onClick={() => setActiveClass(tab.value)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )
            )}



            {/* LIST */}
            {filteredSyllabusList.length > 0 ? (
                <div className="listsec syllabus-master">
                    <div className="listbox studentlist theading">
                        <div>S.No</div>
                        <div>Syllabus</div>
                        {/* <div>Theme</div> */}
                        <div>Class</div>
                        <div>Academic Year</div>
                        <div>Duration</div>
                        <div>Days</div>
                        <div>Status</div>
                        <div className="actionbtns action-heading">Action</div>
                    </div>
                    <ul>
                        {filteredSyllabusList.map((row, index) => (
                            <li key={row.syllabusId}>
                                <div className="listbox studentlist">
                                    <div>{index + 1}</div>
                                    <div data-head="Syllabus">{row.syllabusName}</div>
                                    {/* <div data-head="Theme">{row.themeName}</div> */}
                                    <div data-head="Class">{getClassName(row.classId)}</div>
                                    <div data-head="Academic Year">{row.academicYear}</div>
                                    <div data-head="Duration">
                                        <span className="d-block">{formatDate(row.startDate)}</span>
                                        <span className="d-block">{formatDate(row.endDate)}</span>
                                    </div>
                                    <div data-head="Days">{row.totalWorkingDays}</div>
                                    <div data-head="Status">{row.status}</div>
                                    <div className="actionbtns">

                                        <button
                                            className="editbtn"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/edit-syllabus/${row.syllabusId}/${row.syllabusName
                                                        .trim()
                                                        .toLowerCase()
                                                        .replace(/\s+/g, "-")}`,
                                                    { state: row }
                                                )
                                            }
                                        >
                                            <Pencil size={16} />
                                        </button>


                                        {/* <button
                                            className="addtopicbtn"
                                            onClick={() =>
                                                navigate("/admin/add-topic", {
                                                    state: {
                                                        syllabusId: row.syllabusId,
                                                        classId: row.classId,
                                                        academicYear: row.academicYear,
                                                    },
                                                })
                                            }
                                        >
                                            + Topics
                                        </button> */}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="alert alert-info mt-3">
                    No syllabus found.
                </div>
            )}
        </div>
    );
}
