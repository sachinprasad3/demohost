import { useEffect, useMemo, useState } from "react";
import {
  useDeleteDailylessionPlanById,
  useGetMasterDailyLessionplanSearch,
  useGetSyllabusByAcademicYear,
} from "../../services/teachingPlan.services";
import { getCurrentAcademicYear } from "../../utils";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetAcademicYearsRoleBased,
  useGetSingleCurrentAcademicYear,
} from "../../services/academicYear.services";
import {
  useGetAssignedClasses,
  useGetSyllabus,
} from "../../services/homework.services";
import { DAY_SLOTS, days, getAcademicYearRange } from "./AdminPlannerForm";
import FileViewer from "../../components/FileViewer";
import { Eye, Pencil } from "lucide-react";
import { UPLOAD_IMAGE_PATH } from "../../context/themeRoles";
import Loader from "../../components/Loader";

const normalizePlanner = (planner) => {
  if (!planner) return null;

  if (planner.days) return planner;

  return {
    ...planner,
    selectedDay: planner.day,
    days: {
      [planner.day]: planner.plans,
    },
  };
};

export default function AdminView() {
  const navigate = useNavigate();
  // const { data: allDailyLessonPlan } = useGetAllDailyLessonPlan()
  const location = useLocation();
  const isTeacherView = location.pathname.includes("/teacher/view-planner");
  const isTemplate = location.pathname.includes("-template");
  const currentAcademicYearForTeacher = getCurrentAcademicYear();
  const { data: currentAcademicYear } = useGetSingleCurrentAcademicYear();
  const deletePlaneMutation = useDeleteDailylessionPlanById();
  const [totalSyllDays, setTotalSyllDays] = useState();
  const [selectedFile, setSelectedFile] = useState(null);

  const [filter, setFilter] = useState({
    classCode: "",
    classId: "",
    day: "",
    dayDate: "",
    sectionId: "54",
    academicYear: isTeacherView
      ? currentAcademicYearForTeacher
      : currentAcademicYear,
    syllabusName: "",
  });

  useEffect(() => {
    if (currentAcademicYear) {
      setFilter((prev) => ({
        ...prev,
        academicYear: isTeacherView
          ? currentAcademicYearForTeacher
          : currentAcademicYear,
      }));
    }
  }, [currentAcademicYear, isTeacherView]);

  // const { data: classes = [] } = useGetAssignedClasses({
  //   academicYear: filter?.academicYear,
  //   isForTeacher: isTeacherView,
  // });

  const { data: classes = [] } = useGetSyllabusByAcademicYear({
    academicYear: filter?.academicYear,
    isForTeacher: isTeacherView,
  });

  const { data: activeAcademicYear } = useGetAcademicYearsRoleBased({
    isTeacher: isTeacherView,
  });

  const { data: syllabus } = useGetSyllabus(
    filter.classId,
    filter.academicYear,
  );
  // const selectedPlan = allDailyLessonPlan?.find((plan) => {

  //   const isDay = plan.day === filter.day;
  //   const isClassCode = plan.classCode === filter.classCode
  //   const isAcademicYear = plan.academicYear === filter.academicYear
  //   const isSyllabus = plan.syllabusName === filter.syllabusName

  //   return isDay && isClassCode && isAcademicYear && isSyllabus;
  // });

  const { data: selectedPlanDetails, isLoading } =
    useGetMasterDailyLessionplanSearch({
      isForView: true,
      isTemplate,
      academicYear: filter?.academicYear,
      classCode: filter?.classCode,
      sectionId: filter?.sectionId,
      syllabusName: filter?.syllabusName,
      day: filter?.day,
      dayDate: filter?.dayDate,
    });

  const selectedPlan = selectedPlanDetails?.[0];

  useEffect(() => {
    if (selectedPlan) {
      setFilter((prev) => ({ ...prev, dayDate: selectedPlan.dayDate }));
    }
  }, [selectedPlan]);

  const normalizedPlanner = normalizePlanner(selectedPlan);

  const activeDay = normalizedPlanner?.selectedDay;
  const dayData = normalizedPlanner?.days?.[activeDay] || {};

  const { adminMinDate, adminMaxDate } = getAcademicYearRange(
    filter?.academicYear,
  );

  const handleTopChange = (field, value) => {
    // setFilter((prev) => ({ ...prev, [field]: value }));
    setFilter((prev) => {
      let updated = { ...prev, [field]: value };

      /* 1?? Academic Year Change */
      if (field === "academicYear") {
        updated = {
          classCode: "",
          classId: "",
          syllabusName: "",
          day: "",
          sectionId: "54",
          academicYear: value,
          dayDate: "",
        };
      }

      /* 2?? Subject (class) Change */
      if (field === "classId" || field === "classCode") {
        updated.syllabusName = "";
        updated.day = "";
      }

      /* 3?? Syllabus Change */
      if (field === "syllabusName") {
        updated.day = "";
      }

      return updated;
    });
  };

  const handleEdit = (id) => {
    if (!id) return;
    if (isTemplate) {
      navigate("/admin/edit-template", { state: { isEditView: true, id } });
      return;
    }
    navigate("/admin/edit-academic-plan", { state: { isEditView: true, id } });
    return;
  };

  const handleDelete = (id) => {
    if (!id) return;

    deletePlaneMutation.mutate(id);
  };

  const handleCloseFileViewer = () => {
    setSelectedFile(null);
  };

  const today = new Date();

  // 4 days before today
  const minDateObj = new Date(today);
  minDateObj.setDate(today.getDate() - 4);

  // 1 day after today
  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 1);

  // Convert to yyyy-mm-dd (for <input type="date" />)
  const minDate = minDateObj.toISOString().split("T")[0];
  const maxDate = maxDateObj.toISOString().split("T")[0];

  const groupedClassList = useMemo(() => {
    if (!classes) return [];

    return Object.values(
      classes.reduce((acc, cl) => {
        if (!acc[cl.classId]) {
          acc[cl.classId] = {
            classId: cl.classId,
            className: cl.className,
            classCode: cl.classCode,
            syllabuses: [],
          };
        }

        if (cl.syllabusId) {
          acc[cl.classId].syllabuses.push({
            syllabusId: cl.syllabusId,
            syllabusName: cl.syllabusName,
            totalWorkingDays: cl.totalWorkingDays,
          });
        }

        return acc;
      }, {}),
    );
  }, [classes]);

  return (
    <>
      <div className="mainpro plannerform">
        <div className="container">
          
          <div className="addfee-head">
            <div></div>
            {!isTeacherView && <button className="btn btn-primary" onClick={() => navigate("/admin/add-academic-plan")}>+ Add Plan</button>}
          </div>
          <div className="whitebox">
            <div className="formbox searchsec">
              <ul>
                {!isTemplate && (
                  <li>
                    <div className="form-group">
                      <label className="form-label"> Academic Year</label>

                      <select
                        className="form-control"
                        value={filter.academicYear}
                        onChange={(e) =>
                          handleTopChange("academicYear", e.target.value)
                        }
                      >
                        <option disabled value={""}>
                          Academic Year
                        </option>
                        {activeAcademicYear?.map((year) => (
                          <option
                            key={year?.academicYear}
                            value={year?.academicYear}
                          >
                            {year?.academicYear}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                )}
                <li>
                  <div className="form-group">
                    <label className="form-label"> Class</label>
                    <select
                      className="form-control"
                      value={filter.classCode}
                      onChange={(e) => {
                        const selectedOption = e.target.selectedOptions[0];

                        setFilter((prev) => ({
                          ...prev,
                          classId: selectedOption.getAttribute("data-classid"),
                          classCode: e.target.value,
                        }));
                      }}
                    >
                      <option value="">Select Class</option>
                      {groupedClassList?.map((option) => (
                        <option
                          key={option.classId}
                          data-classid={option.classId}
                          value={option.classCode}
                        >
                          {option.className}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
                <li>
                  <div className="form-group">
                    <label className="form-label"> Syllabus</label>

                    <select
                      className="form-control"
                      value={filter.syllabusName}
                      onChange={(e) => {
                        const selectedOption = e.target.selectedOptions[0];
                        handleTopChange("syllabusName", e.target.value);
                        setTotalSyllDays(
                          selectedOption.getAttribute("data-totalsylldays"),
                        );
                      }}
                    >
                      <option>Select Syllabus</option>
                      {groupedClassList
                        .find((cl) => cl.classId == filter.classId)
                        ?.syllabuses?.map((syll) => (
                          <option
                            key={syll.syllabusId}
                            data-totalsylldays={syll.totalWorkingDays}
                            value={syll.syllabusName}
                          >
                            {syll.syllabusName}
                          </option>
                        ))}
                    </select>
                  </div>
                </li>
                <li>
                  <div className="form-group">
                    <label className="form-label"> Day</label>
                    <select
                      className="form-control"
                      value={filter.day}
                      onChange={(e) => handleTopChange("day", e.target.value)}
                    >
                      <option>Select Day</option>
                      {days(totalSyllDays).map((day) => (
                        <option key={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </li>
                {!isTemplate && (
                  <li>
                    <div className="form-group">
                      <label className="form-label">Day Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={filter.dayDate}
                        onChange={(e) =>
                          handleTopChange("dayDate", e.target.value)
                        }
                        {...(isTeacherView
                          ? { min: minDate, max: maxDate }
                          : { min: adminMinDate, max: adminMaxDate })}
                      />
                    </div>
                  </li>
                )}
                {selectedPlan?.adminToTeacherRemrk && <li>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <input
                    className="form-control"
                    placeholder="Remarks"
                    disabled={true}
                    value={selectedPlan.adminToTeacherRemrk}
                  />
                </div>
              </li>}
              </ul>
            </div>
          </div>

          {isLoading ? (
            <Loader />
          ) : (
            <>
              {!selectedPlan && (
           <div className="alert alert-warning text-center mt-2">
              No planner data found for selected filters
            </div>
          )}

          {/* ---------- DAY VIEW ---------- */}
          {selectedPlan && (
            <>
            <div className="addfee-head">
              <h3>{activeDay}</h3>
              {!isTeacherView && (
                <button
                  onClick={() =>
                    handleEdit(selectedPlan?.daily_teaching_plan_id)
                  }
                >
                  <Pencil size={14} /> <span className="ms-1">Edit</span>
                </button>
              )}
              </div>
              {/* <button onClick={() => handleDelete(selectedPlan?.id)}>delete</button> */}
              <div className="dayflexsec">
                {DAY_SLOTS.map((slot) => {
                  const data = dayData[slot];
                  if (!data) return null;

                  return (
                    <div key={slot} className="daysection">
                      <h4>{slot}</h4>

                      {Array.isArray(data.title) && data.title.length > 0 && (
                        <ul>
                          {data.title.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      )}
                      {data.subjects?.map((s, i) => (
                        <div key={i} className="subject-box">
                          <p>
                            <strong>Subject:</strong> {s.subject}
                          </p>
                          <p>
                            <strong>Activity:</strong> {s.activityTitle}
                          </p>

                          {s.themeName?.length > 0 && (
                            <>
                              {s.themeName.map((t, i) => (
                                <div key={i} className="theme-block">
                                  <p>
                                    <strong>Theme:</strong> {t.name}
                                  </p>
                                  <p>
                                    <strong>Page no.:</strong>{" "}
                                    {t.numbers.join(",")}
                                  </p>

                                  {/* Separator only between themes */}
                                  {/* {i < s.themeName.length - 1 && <hr />} */}
                                </div>
                              ))}
                            </>
                          )}

                              {s?.docs?.length > 0 && (
                                <>
                                  <p>
                                    {" "}
                                    <strong>Documents:</strong>{" "}
                                  </p>
                                  <div className="workimglist">
                                    {s?.docs?.map((doc, idx) => (
                                      <div
                                        className="homeworkimg"
                                        key={doc.name}
                                        onClick={() =>
                                          setSelectedFile({
                                            fileName: doc.name,
                                            filePath:
                                              UPLOAD_IMAGE_PATH + doc.name,
                                          })
                                        }
                                      >
                                        <strong>{idx + 1}</strong>
                                        <img
                                          src={UPLOAD_IMAGE_PATH + doc.name}
                                          alt={doc.name}
                                        />
                                        <span>
                                          <Eye size={14} />
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <FileViewer
        file={selectedFile}
        open={!!selectedFile}
        onClose={handleCloseFileViewer}
        title="Attachments"
      />
    </>
  );
}
