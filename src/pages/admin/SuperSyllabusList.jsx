import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

import { useGetAllClasses } from '../../services/teachingPlan.services';
import axiosInstance from '../../utills/axiosInstance';
import { Pencil } from 'lucide-react';

const SuperSyllabusList = () => {
    const [syllabusList, setSyllabusList] = useState([]);



    const { data: classes, loading: loadingClasses } = useGetAllClasses();


    const navigate = useNavigate();
    const getClassName = (id) => {
        if (!classes?.length) return "-";
        const cls = classes.find(c => Number(c.classId) === Number(id));


        return cls?.className || "-";
    };







    const fetchSyllabus = async () => {
        try {
            const res = await axiosInstance.get("/api/v1/supersyllabusmaster/");
            // console.log("Syllabus List:", res?.data?.data);
            setSyllabusList(res?.data || []);
        } catch (err) {
            console.error("Failed to fetch syllabus list", err);
            setSyllabusList([]);
        }
    };

    useEffect(() => {
        fetchSyllabus();
    }, []);

    return (
        <div className="container syllabus-master">

            {/* ADD BUTTON */}
            <div className="d-flex justify-content-end mb-3">
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/admin/create-super-syllabus")}
                >
                    + Add Syllabus
                </button>
            </div>



            {/* LIST */}
            {syllabusList.length > 0 ? (
                <div className="listsec syllabus-master">
                    <div className="listbox studentlist theading">
                        <div>S.No</div>
                        {/* <div>Theme</div> */}
                        <div>Class</div>
                        <div>Week</div>
                        {/* <div>Academic Year</div> */}
                        {/* <div>Duration</div> */}
                        <div>Days</div>
                        <div>Status</div>
                        <div className="actionbtns action-heading">Action</div>
                    </div>
                    <ul>
                        {syllabusList.map((row, index) => (
                            <li key={row.syllabusId}>
                                <div className="listbox studentlist">
                                    <div>{index + 1}</div>
                                    {/* <div data-head="Theme">{row.themeName}</div> */}
                                    <div data-head="Class">{getClassName(row.classId)}</div>
                                    <div data-head="Syllabus">{row.totalWeek}</div>
                                    {/* <div data-head="Academic Year">{row.academicYear}</div> */}
                                    {/* <div data-head="Duration">
                                        <span className="d-block">{formatDate(row.startDate)}</span>
                                        <span className="d-block">{formatDate(row.endDate)}</span>
                                    </div> */}
                                    <div data-head="Days">{row.totalDays}</div>
                                    <div data-head="Status">{row.status}</div>
                                    <div className="actionbtns">

                                        <button
                                            className="editbtn"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/edit-super-syllabus/${row.id}/super-syllabus-(${getClassName(row.classId)
                                                        .trim()
                                                        .toLowerCase()
                                                        .replace(/\s+/g, "-")})`,
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
    )
}

export default SuperSyllabusList
