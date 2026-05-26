// ======================= IMPORTS =======================
import { useEffect, useMemo, useState } from "react";
import {
  useDeleteDailylessionPlanById,
  useGetDailylessionplanSearchDataForView,
  useGetDayList,
  useGetSyllabusByAcademicYear,
} from "../../services/teachingPlan.services";
import { getCurrentAcademicYear } from "../../utils";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetAcademicYearsRoleBased,
  useGetSingleCurrentAcademicYear,
} from "../../services/academicYear.services";
import { DAY_SLOTS, days, getAcademicYearRange } from "./AcademicPlanForm";
import FileViewer from "../../components/FileViewer";
import { Eye, Pencil } from "lucide-react";
import { UPLOAD_IMAGE_PATH } from "../../context/themeRoles";
import Loader from "../../components/Loader";

// ======================= HELPERS =======================
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

// ======================= COMPONENT =======================
export default function AcademicPlanView() {
  // ---------- ROUTER ----------
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacherView = location.pathname.includes("/teacher/view-planner");

  // ---------- ACADEMIC YEAR ----------
  const currentAcademicYearForTeacher = getCurrentAcademicYear();
  const { data: currentAcademicYear } = useGetSingleCurrentAcademicYear();

  // ---------- STATE ----------
  const [totalSyllDays, setTotalSyllDays] = useState();
  const [selectedFile, setSelectedFile] = useState(null);

  const [filter, setFilter] = useState({
    classCode: "",
    classId: "",
    day: "",
    dayDate: "",
    sectionId: "54",
    academicYear: "",
    syllabusName: "",
  });

  const { data: dayList } = useGetDayList({
    academicYear: filter.academicYear,
    classCode: filter.classCode,
    syllabusName: filter.syllabusName,
  });

  // ======================= API =======================
  const deletePlaneMutation = useDeleteDailylessionPlanById();

  const { data: classes = [] } = useGetSyllabusByAcademicYear({
    academicYear: filter?.academicYear,
    isForTeacher: isTeacherView,
  });

  const { data: activeAcademicYear } = useGetAcademicYearsRoleBased({
    isTeacher: isTeacherView,
  });

  const { data: selectedPlanDetails, isLoading } =
    useGetDailylessionplanSearchDataForView({
      academicYear: filter?.academicYear,
      classCode: filter?.classCode,
      sectionId: filter?.sectionId,
      syllabusName: filter?.syllabusName,
      day: filter?.day,
      dayDate: filter?.dayDate,
    });

  const selectedPlan = selectedPlanDetails?.[0];

  // ======================= EFFECTS =======================

  // Set default academic year
  useEffect(() => {
    if (currentAcademicYearForTeacher || currentAcademicYear) {
      setFilter((prev) => ({
        ...prev,
        academicYear: isTeacherView
          ? currentAcademicYearForTeacher
          : currentAcademicYear,
      }));
    }
  }, [currentAcademicYear, currentAcademicYearForTeacher, isTeacherView]);

  // Sync selected plan date
  useEffect(() => {
    if (selectedPlan?.dayDate) {
      setFilter((prev) => ({
        ...prev,
        dayDate: selectedPlan.dayDate,
      }));
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (!selectedPlan) return;

    setFilter((prev) => {
      // prevent overriding if already selected manually
      if (prev.classCode && prev.syllabusName && prev.day && prev.dayDate) {
        return prev;
      }

      return {
        ...prev,
        academicYear: selectedPlan.academicYear || prev.academicYear,
        classCode: selectedPlan.classCode || "",
        classId: selectedPlan.classId || "",
        syllabusName: selectedPlan.syllabusName || "",
        day: selectedPlan.day || selectedPlan.selectedDay || "",
        dayDate: selectedPlan.dayDate || "",
      };
    });

    // set total syllabus days automatically
    const matchedClass = classes?.find(
      (c) =>
        c.classId == selectedPlan.classId &&
        c.syllabusName === selectedPlan.syllabusName,
    );

    if (matchedClass?.totalWorkingDays) {
      setTotalSyllDays(matchedClass.totalWorkingDays);
    }
  }, [selectedPlan, classes]);

  // ======================= DERIVED DATA =======================
  const normalizedPlanner = normalizePlanner(selectedPlan);

  const activeDay = normalizedPlanner?.selectedDay;
  const dayData = normalizedPlanner?.days?.[activeDay] || {};

  const { adminMinDate, adminMaxDate } = getAcademicYearRange(
    filter?.academicYear,
  );

  // Teacher date restriction
  const today = new Date();

  const minDateObj = new Date(today);
  minDateObj.setDate(today.getDate() - 4);

  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 1);

  const minDate = minDateObj.toISOString().split("T")[0];
  const maxDate = maxDateObj.toISOString().split("T")[0];

  // ======================= MEMO =======================
  const groupedClassList = useMemo(() => {
    if (!classes?.length) return [];

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


  useEffect(() => {
    if(groupedClassList?.length > 0) {
        const classDetails = groupedClassList?.[0];
        const syllabusDetails = classDetails?.syllabuses?.[0];
        if(classDetails && syllabusDetails) {
          setFilter((prev) => ({
            ...prev,
            classCode: classDetails.classCode,
            classId: classDetails.classId,
            syllabusName: syllabusDetails.syllabusName,
          }))
        }
    }
  }, [groupedClassList])

  // ======================= HANDLERS =======================

  const handleTopChange = (field, value) => {
    setFilter((prev) => {
      let updated = { ...prev, [field]: value };

      // Academic Year Reset
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

      // Syllabus Change
      if (field === "syllabusName") {
        updated.day = "";
        updated.dayDate = "";
      }

      if (field === "day") {
        updated.dayDate = "";
      }

      return updated;
    });
  };

  const handleEdit = (id) => {
    if (!id) return;
    navigate("/admin/edit-academic-plan", {
      state: { isEditView: true, id },
    });
  };

  const handleDelete = (id) => {
    if (!id) return;
    deletePlaneMutation.mutate(id);
  };

  const handleCloseFileViewer = () => setSelectedFile(null);

  return (
    <>
      <div className="mainpro plannerform">
        <div className="container">
          <div className="addfee-head">
            <div></div>
            {!isTeacherView && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/admin/add-academic-plan")}
              >
                + Add Plan
              </button>
            )}
          </div>
          <div className="whitebox">
            <div className="formbox searchsec">
              <ul>
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
                          day: "",
                          syllabusName: "",
                          dayDate: "",
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
                      {dayList?.map((day, index) => (
                        <option key={index}>{day}</option>
                      ))}
                    </select>
                  </div>
                </li>
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
                      disabled
                      {...(isTeacherView
                        ? { min: minDate, max: maxDate }
                        : { min: adminMinDate, max: adminMaxDate })}
                    />
                  </div>
                </li>
                {selectedPlan?.adminToTeacherRemrk && (
                  <li>
                    <div className="form-group">
                      <label className="form-label">Remarks</label>
                      <input
                        className="form-control"
                        placeholder="Remarks"
                        disabled={true}
                        value={selectedPlan.adminToTeacherRemrk}
                      />
                    </div>
                  </li>
                )}
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

                          {Array.isArray(data.title) &&
                            data.title.length > 0 &&
                            (() => {
                              const validTitles = data.title.filter(
                                (t) => t?.title && t.title.trim() !== "",
                              );

                              return validTitles.length > 0 ? (
                                <ul>
                                  {validTitles.map((t, i) => (
                                    <li key={i}>{t.title}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted">No {slot}</p>
                              );
                            })()}
                          {data.subjects?.map((s, i) => (
                            <div key={i} className="subject-box">
                              {s.subject && (
                                <p>
                                  <strong>Subject:</strong> {s.subject}
                                </p>
                              )}
                              {s.activityTitle && (
                                <p>
                                  <strong>Activity Name:</strong> {s.activityTitle}
                                </p>
                              )}

                              {s.activityDetails && (
                                <p>
                                  <strong>Activity Details:</strong> {s.activityDetails}
                                </p>
                              )}

                              {s.themeName?.length > 0 && (
                                <>
                                  {s.themeName.map((t, i) => (
                                    <div key={i} className={t.name && "theme-block"}>
                                      {t.name && (
                                        <p>
                                          <strong>Theme:</strong> {t.name}
                                        </p>
                                      )}
                                      {t.numbers.length > 0 && (
                                        <p>
                                          <strong>Page no.:</strong>
                                          {t.numbers.join(",")}
                                        </p>
                                      )}

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
