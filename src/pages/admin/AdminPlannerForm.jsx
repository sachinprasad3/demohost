import { useEffect, useMemo, useState } from "react";
import {
  useGetAcademicYears,
  useGetActiveAcademicYears,
} from "../../services/academicYear.services";
import { useGetActiveSubjects } from "../../services/subject.services";
import {
  useCreateUpdateMsterDailyLessionplan,
  useGetMasterDailyLessionplanById,
  useGetMasterDailyLessionplanSearch,
  useGetSections,
  useGetSyllabusByAcademicYear,
} from "../../services/teachingPlan.services";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentAcademicYear } from "../../utils";
import { useGetThemesByClassId } from "../../services/theme.services";
import { X } from "lucide-react";
import { UPLOAD_IMAGE_PATH } from "../../context/themeRoles";
import useValidateFields from "../../hooks/useValidateFields";
import * as yup from "yup";
import { useGetAssignedClasses } from "../../services/homework.services";
import { useGetSyllabus } from "../../services/homework.services";
import Loader from "../../components/Loader";

/* ---------- CONSTANTS ---------- */
export const days = (totalCount) => {
  return Array.from({ length: totalCount }, (_, i) => `Day ${i + 1}`);
};
export const DAY_SLOTS = ["Assembly", "C.W", "H.W", "Oral", "Activity"];

export const MULTI_TEXT_SLOTS = ["Assembly", "Oral", "Activity"];
export const DROPDOWN_SLOTS = ["C.W", "H.W"];

const schema = yup.object({
  academicYear: yup.string().required("Academic year is required"),
  classId: yup.string().required("Class is required"),
  className: yup.string().required("Class name is required"),
  classCode: yup.string().required("Class code is required"),
  syllabusName: yup.string().required("Syllabus name is required"),
  syllabusId: yup.string().required("Syllabus is required"),
  sectionId: yup.string().required("Section is required"),
  sectionName: yup.string().required("Section name is required"),
  dayDate: yup.string().required("Date is required"),
  day: yup.string().required("Day is required"),
});

const getUpdatedField = (field) => {
  switch (field) {
    case "academicYear":
      return {
        classId: "",
        classCode: "",
        sectionName: "A",
        sectionId: "54",
        day: "",
        syllabusId: "",
        syllabusName: "",
      };
    case "classId":
      return {
        classId: "",
        classCode: "",
        sectionName: "A",
        sectionId: "54",
        day: "",
        syllabusId: "",
        syllabusName: "",
      };

    case "syllabusId":
      return {
        sectionName: "A",
        sectionId: "54",
        day: "",
        syllabusId: "",
        syllabusName: "",
      };

    case "sctionId":
      return {
        sectionName: "A",
        sectionId: "54",
        day: "",
        syllabusId: "",
        syllabusName: "",
      };
    default:
      return {};
  }
};

/* ---------- INITIAL PLANNER ---------- */
const createInitialPlanner = (planDetails, isInitial=true) => {
  const totalDays = days(120);
 
  return {
    daily_teaching_plan_id: planDetails?.daily_teaching_plan_id || "",
    academicYear: planDetails?.academicYear || getCurrentAcademicYear(),
    className: planDetails?.className || "",
    classId: planDetails?.classId || "",
    classCode: planDetails?.classCode || "",
    sectionName: planDetails?.sectionName || "A",
    sectionId: planDetails?.sectionId || "54",
    day: planDetails?.day || "",
    syllabusId: planDetails?.syllabusId || "",
    syllabusName: planDetails?.syllabusName || "",
    adminToTeacherRemrk: planDetails?.adminToTeacherRemrk || "",
    dayDate: isInitial
      ? new Date().toISOString().split("T")[0]
      : planDetails?.dayDate,
    createdBy: planDetails?.createdBy || "string",
    createdAt: planDetails?.createdAt || new Date().toISOString(),
    days: totalDays.reduce((acc, day) => {
      acc[day] =
        day === planDetails?.day
          ? planDetails?.plans
          : DAY_SLOTS.reduce((slots, slot) => {
            slots[slot] = {
              title: MULTI_TEXT_SLOTS.includes(slot) ? [""] : "",
              subjects: DROPDOWN_SLOTS.includes(slot)
                ? [
                  {
                    subject: "",
                    subjectId: "",
                    activityTitle: "",
                    activityDetails: "",
                    status: "PENDING",
                    themeName: [{ name: "", numbers: [] }],
                    homeworkRequired: false,
                    homeworkTask: "",
                    docs: [],
                  },
                ]
                : [],
            };
            return slots;
          }, {});
      return acc;
    }, {}),
  };
};

export const getAcademicYearRange = (academicYear) => {
  if (!academicYear) return {};

  const [startYear, endYear] = academicYear.split("-");

  const minDate = `${startYear}-04-01`;
  const maxDate = `${endYear}-03-31`;

  return { minDate, maxDate };
};

export default function AdminPlannerForm() {
  const location = useLocation();
  const { isEditView = false, id } = location?.state || {};
  const [totalSyllDays, setTotalSyllDays] = useState();
  const [planner, setPlanner] = useState(createInitialPlanner());
  const isTemplate = location.pathname.includes("-template");
  const { errors, validate } = useValidateFields();
  const navigate = useNavigate();

  const { data: selectedPlan, isLoading: isSelectedPlanLoading } =
    useGetMasterDailyLessionplanSearch({
      isTemplate,
      academicYear: planner?.academicYear,
      classCode: planner?.classCode,
      sectionId: planner?.sectionId,
      syllabusName: planner?.syllabusName,
      day: planner?.day,
      dayDate: planner?.dayDate,
    });

  const { data: academicYear } = useGetActiveAcademicYears();

  // const { data: classes = [] } = useGetAssignedClasses({
  //   academicYear: planner?.academicYear,
  //   isForTeacher: false,
  // });

  const { data: classes = [] } = useGetSyllabusByAcademicYear({
    academicYear: planner?.academicYear,
  });

  const { data: planDetails, isLoading: isPlanDetailsLoading } =
    useGetMasterDailyLessionplanById({
      isTemplate,
      id,
    });

  // const { data: syllabus } = useGetSyllabus(
  //   planner?.classId,
  //   planner?.academicYear,
  // );

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

  const syllabus = groupedClassList.find(
    (cl) => cl.classId == planner.classId,
  )?.syllabuses;

  useEffect(() => {
    if (planDetails && isEditView) {
      
      setPlanner(createInitialPlanner(planDetails, false));

      if (syllabus) {
        const matched = syllabus?.find(
          (s) => s.syllabusId == planDetails.syllabusId,
        );

        if (matched?.totalWorkingDays) {
          setTotalSyllDays(matched.totalWorkingDays);
        }
      }
    }
  }, [planDetails, isEditView, syllabus]);

  const { data: sections } = useGetSections();

  const { data: subjects } = useGetActiveSubjects();

  const { data: themes } = useGetThemesByClassId(planner?.classId);

  const createUpdatePlannerMutation = useCreateUpdateMsterDailyLessionplan({
    isTemplate,
  });

  const activeDay = planner.day;
  const dayData = planner.days?.[activeDay];

  useEffect(() => {
    if (selectedPlan?.length && !isEditView) {
      const { adminToTeacherRemrk, daily_teaching_plan_id, plans } =
        selectedPlan[0];
      setPlanner(
        createInitialPlanner(
          {
            ...planner,
            daily_teaching_plan_id,
            adminToTeacherRemrk,
            dayData: "",
            plans,
          },
          false,
        ),
      );
    }
  }, [selectedPlan]);

  const { minDate, maxDate } = getAcademicYearRange(planner?.academicYear);

  /* ---------- TOP CHANGE ---------- */
  const handleTopChange = (field, value) => {
    const totalDays = days(120);

    setPlanner((prev) => {
      const resetField = getUpdatedField(field);
      const updated = ["adminToTeacherRemrk", "dayDate"].includes(field)
        ? { ...prev, [field]: value }
        : {
            ...prev,
            ...resetField,
            [field]: value,
            days: totalDays.reduce((acc, day) => {
              acc[day] = DAY_SLOTS.reduce((slots, slot) => {
                slots[slot] = {
                  title: MULTI_TEXT_SLOTS.includes(slot) ? [""] : "",
                  subjects: DROPDOWN_SLOTS.includes(slot)
                    ? [
                        {
                          subject: "",
                          subjectId: "",
                          activityTitle: "",
                          activityDetails: "",
                          status: "PENDING",
                          themeName: [{ name: "", numbers: [] }],
                          homeworkRequired: false,
                          homeworkTask: "",
                          docs: [],
                        },
                      ]
                    : [],
                };
                return slots;
              }, {});
              return acc;
            }, {}),
          };

      if (field === "academicYear") {
        updated.dayDate = "";
      }

      handleValidate(updated);
      return updated;
    });
  };

  /* ---------- MULTI TEXT ---------- */
  const addTextarea = (slot) => {
    setPlanner((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [activeDay]: {
          ...prev.days[activeDay],
          [slot]: {
            ...prev.days[activeDay][slot],
            title: [...prev.days[activeDay][slot].title, ""],
          },
        },
      },
    }));
  };

  const updateTextarea = (slot, index, value) => {
    const updated = [...dayData[slot].title];
    updated[index] = value;

    setPlanner((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [activeDay]: {
          ...prev.days[activeDay],
          [slot]: { ...prev.days[activeDay][slot], title: updated },
        },
      },
    }));
  };

  /* ---------- SUBJECT HANDLERS ---------- */
  const updateSubjectField = (slot, sIndex, field, value) => {
    const updated = [...dayData[slot].subjects];
    updated[sIndex][field] = value;

    setPlanner((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [activeDay]: {
          ...prev.days[activeDay],
          [slot]: { ...prev.days[activeDay][slot], subjects: updated },
        },
      },
    }));
  };

  const addNewSubject = (slot) => {
    setPlanner((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [activeDay]: {
          ...prev.days[activeDay],
          [slot]: {
            ...prev.days[activeDay][slot],
            subjects: [
              ...prev.days[activeDay][slot].subjects,
              {
                subject: "",
                subjectId: "",
                activityTitle: "",
                activityDetails: "",
                status: "PENDING",
                themeName: [{ name: "", numbers: [] }],
                homeworkRequired: false,
                homeworkTask: "",
                docs: [],
              },
            ],
          },
        },
      },
    }));
  };

  /* ---------- THEME ---------- */
  const updateTheme = (slot, sIndex, tIndex, value) => {
    const updated = [...dayData[slot].subjects];
    updated[sIndex].themeName[tIndex] = { name: value, numbers: [] };
    updateSubjectField(slot, sIndex, "themeName", updated[sIndex].themeName);
  };

  const updateThemeNumbers = (slot, sIndex, tIndex, values) => {
    const updated = [...dayData[slot].subjects];
    updated[sIndex].themeName[tIndex].numbers = values;
    updateSubjectField(slot, sIndex, "themeName", updated[sIndex].themeName);
  };

  const addTheme = (slot, sIndex) => {
    const updated = [...dayData[slot].subjects];
    updated[sIndex].themeName.push({ name: "", numbers: [] });
    updateSubjectField(slot, sIndex, "themeName", updated[sIndex].themeName);
  };

  const addFiles = (slot, sIndex, e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }
    const updated = [...dayData[slot].subjects];
    updated[sIndex].docs.push(file);
    updateSubjectField(slot, sIndex, "docs", updated[sIndex].docs);
  };

  const removeFiles = (slot, sIndex, fIndex) => {
    const updated = [...dayData[slot].subjects];
    updated[sIndex].docs.splice(fIndex, 1);
    updateSubjectField(slot, sIndex, "docs", updated[sIndex].docs);
  };

  const updateHomework = (field, value) => {
    setPlanner((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [activeDay]: {
          ...prev.days[activeDay],
          ["H.W"]: {
            ...prev.days[activeDay]["H.W"],
            [field]: value,
          },
        },
      },
    }));
  };

  const removeSubject = (slot, sIndex) => {
    const updated = [...dayData[slot].subjects];
    updated.splice(sIndex, 1);

    setPlanner((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [activeDay]: {
          ...prev.days[activeDay],
          [slot]: {
            ...prev.days[activeDay][slot],
            subjects: updated.length
              ? updated
              : [
                {
                  subject: "",
                  subjectId: "",
                  activityTitle: "",
                  activityDetails: "",
                  status: "PENDING",
                  themeName: [{ name: "", numbers: [] }],
                  homeworkRequired: false,
                  homeworkTask: "",
                },
              ],
          },
        },
      },
    }));
  };

  const removeTextarea = (slot, index) => {
    const updated = [...dayData[slot].title];
    updated.splice(index, 1);

    setPlanner((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [activeDay]: {
          ...prev.days[activeDay],
          [slot]: {
            ...prev.days[activeDay][slot],
            title: updated.length ? updated : [""], // keep at least one
          },
        },
      },
    }));
  };

  const removeTheme = (slot, sIndex, tIndex) => {
    const updated = [...dayData[slot].subjects];
    updated[sIndex].themeName.splice(tIndex, 1);

    if (updated[sIndex].themeName.length === 0) {
      updated[sIndex].themeName.push({ name: "", numbers: [] });
    }

    updateSubjectField(slot, sIndex, "themeName", updated[sIndex].themeName);
  };

  const handleValidate = async (values) => {
    return await validate({
      initialValue: {
        academicYear: values?.academicYear,
        classId: values?.classId,
        className: values?.className,
        classCode: values?.classCode,
        syllabusName: values?.syllabusName,
        syllabusId: values?.syllabusId,
        sectionId: values?.sectionId,
        sectionName: values?.sectionName,
        dayDate: values?.dayDate,
        day: values?.day,
      },
      validateSchema: schema,
    });
  };

  const handleSavePlanner = async () => {
    const { days, day, ...rest } = planner;

    const { errors, value, isError } = await handleValidate({
      academicYear: planner?.academicYear,
      classId: planner?.classId,
      className: planner?.className,
      classCode: planner?.classCode,
      syllabusName: planner?.syllabusName,
      syllabusId: planner?.syllabusId,
      sectionId: planner?.sectionId,
      sectionName: planner?.sectionName,
      dayDate: planner?.dayDate,
      day: planner?.day,
    });

    if (isError) return;

    const originalPlans = days[day];
    const plans = JSON.parse(JSON.stringify(days[day]));

    const formData = new FormData();
    // if (isEditView) {
    //   jsonData["id"] = id;
    // } else {
    //   delete jsonData["id"];
    // }

    // ? Append files with identification
    Object.entries(originalPlans).forEach(([slotName, slotValue]) => {
      if (slotValue.subjects) {
        slotValue.subjects.forEach((subject, sIndex) => {
          const sDocs = [];
          subject.docs?.forEach((file) => {
            const filename =
              file instanceof File
                ? `${Date.now()}_${slotName}_${file.name}`
                : file.name;

            sDocs.push({ name: filename });

            if (file instanceof File) {
              formData.append("documents", file, filename);
            }
          });
          plans[slotName].subjects[sIndex].docs = sDocs;
        });
      }
    });

    const jsonData = {
      ...rest,
      day: day,
      plans,
    };

    if (isTemplate) {
      delete jsonData["academicYear"];
      delete jsonData["dayDate"];
    }

    formData.append(
      "metadata",
      new Blob([JSON.stringify(jsonData)], {
        type: "application/json",
      }),
    );

    createUpdatePlannerMutation.mutate(formData, {
      onSuccess: () => {
        setPlanner(createInitialPlanner());
        if (isEditView) {
          navigate(-1);
        } else {
          navigate("/admin/view-academic-plan")
        }
      },
    });
  };

  const getPagesForTheme = (themeName) => {
    const pages = themes?.find((th) => th.theme == themeName);
    if (!pages) return [];
    const [start, end] = pages?.pageNo?.split("-");
    const numStart = start ? Number(start) : 0;
    const numEnd = end ? Number(end) : numStart;

    const len = numEnd + 1 - numStart;

    return Array.from({ length: len }, (_, i) => ({
      label: Number(numStart) + i,
      value: Number(numStart) + i,
    }));
  };

  const getThemeList = ({ slot, sIndex, selectedValue }) => {
    const updated = [...dayData[slot].subjects];

    const theme = updated[sIndex].themeName;

    const data =
      themes?.filter(
        (th) =>
          th.theme === selectedValue || !theme.some((t) => t.name === th.theme),
      ) || [];

    return data;
  };

  const getSubjectList = ({ slot, selectedValue }) => {
    const selectedSubjects = [...dayData[slot].subjects];

    const data =
      subjects?.filter(
        (s) =>
          s.subjectName == selectedValue ||
          !selectedSubjects.some((ss) => ss.subject == s.subjectName),
      ) || [];

    return data;
  };

  return (
    <div className="mainpro plannerform">
      <div className="container">
        <div className="addfee-head">
            <div></div>
            <button className="btn btn-primary" onClick={() => navigate("/admin/view-academic-plan")}>View Plan</button>
          </div>
        <div className="whitebox">
          <div className="formbox stapform">
            <ul>
              {!isTemplate && (
                <li>
                  <div className="form-group">
                    <label className="form-label"> Academic Year<span className="text-danger">*</span></label>
                    <select
                      className={`form-control ${
                        errors?.academicYear ? "is-invalid" : ""
                      }`}
                      value={planner.academicYear}
                      disabled={isEditView}
                      onChange={(e) =>
                        handleTopChange("academicYear", e.target.value)
                      }
                    >
                      <option disabled>Select Year</option>
                      {academicYear?.map((year) => (
                        <option
                          key={year.academicYear}
                          value={year.academicYear}
                        >
                          {year.academicYear}
                        </option>
                      ))}
                    </select>
                    {errors?.academicYear && (
                      <div className="invalid-feedback d-block">
                        {errors?.academicYear}
                      </div>
                    )}
                  </div>
                </li>
              )}

              <li>
                <div className="form-group">
                  <label className="form-label"> Class<span className="text-danger">*</span></label>
                  <select
                    className={`form-control ${
                      errors?.classId ? "is-invalid" : ""
                    }`}
                    value={planner.classId}
                    disabled={isEditView}
                    onChange={(e) => {
                      const selectOption = e.target.selectedOptions[0];
                      handleTopChange("classId", e.target.value);
                      handleTopChange(
                        "className",
                        selectOption.getAttribute("data-classname"),
                      );
                      handleTopChange(
                        "classCode",
                        selectOption.getAttribute("data-classcode"),
                      );
                    }}
                  >
                    <option data-classname={""} data-classcode={""} value={""}>
                      Select Class
                    </option>
                    {groupedClassList?.map((cl) => (
                      <option
                        key={cl.classId}
                        data-classname={cl.className}
                        data-classcode={cl.classCode}
                        value={cl.classId}
                      >
                        {cl.className || cl.classId}
                      </option>
                    ))}
                  </select>
                  {errors?.classId && (
                    <div className="invalid-feedback d-block">
                      {errors?.classId}
                    </div>
                  )}
                </div>
              </li>
              {/* <li>
                <div className="form-group">
                <label className="form-label"> Class Section</label>
                  <select
                    className="form-control"
                    value={planner.sectionId}
                    onChange={(e) =>{
                      const selectOption = e.target.selectedOptions[0];
                      handleTopChange("sectionId", e.target.value)
                      handleTopChange("sectionName", selectOption.getAttribute("data-sectionname"))
                    }}
                  >
                    <option>Select Section</option>
                    {sections?.map((cl) => (
                      <option key={cl.sectionId} data-sectionname={cl.sectionname} value={cl.sectionId}>
                        {cl.sectionName}
                      </option>
                    ))}
                  </select>
                </div>
              </li> */}
              <li>
                <div className="form-group">
                  <label className="form-label"> Syllabus<span className="text-danger">*</span></label>
                  <select
                    className={`form-control ${
                      errors?.syllabusId ? "is-invalid" : ""
                    }`}
                    value={planner.syllabusId}
                    disabled={isEditView}
                    onChange={(e) => {
                      const selectOption = e.target.selectedOptions[0];
                      handleTopChange("syllabusId", e.target.value);
                      handleTopChange(
                        "syllabusName",
                        selectOption.getAttribute("data-syllabusname"),
                      );
                      setTotalSyllDays(
                        selectOption.getAttribute("data-totalsylldays"),
                      );
                    }}
                  >
                    <option
                      data-totalsylldays=""
                      data-syllabusname=""
                      value={""}
                    >
                      Select Syllabus
                    </option>
                    {groupedClassList
                      .find((cl) => cl.classId == planner.classId)
                      ?.syllabuses?.map((syll) => (
                        <option
                          key={syll.syllabusId}
                          data-totalsylldays={syll.totalWorkingDays}
                          data-syllabusname={syll.syllabusName}
                          value={syll.syllabusId}
                        >
                          {syll.syllabusName}
                        </option>
                      ))}
                  </select>
                  {errors?.syllabusId && (
                    <div className="invalid-feedback d-block">
                      {errors?.syllabusId}
                    </div>
                  )}
                </div>
              </li>
              <li>
                <div className="form-group">
                  <label className="form-label"> Days<span className="text-danger">*</span></label>
                  <select
                    className={`form-control ${
                      errors?.day ? "is-invalid" : ""
                    }`}
                    value={planner.day}
                    disabled={isEditView}
                    onChange={(e) => handleTopChange("day", e.target.value)}
                  >
                    <option key={"day"} value={""}>
                      Select Day
                    </option>
                    {days(totalSyllDays).map((day) => (
                      <option key={day}>{day}</option>
                    ))}
                  </select>
                  <div className="invalid-feedback">{errors?.day}</div>
                </div>
              </li>
              {!isTemplate && (
                <li>
                  <div className="form-group">
                    <label className="form-label">Day Date<span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className={`form-control ${
                        errors?.dayDate ? "is-invalid" : ""
                      }`}
                      value={planner.dayDate}
                      disabled={isEditView}
                      min={minDate}
                      max={maxDate}
                      onChange={(e) =>
                        handleTopChange("dayDate", e.target.value)
                      }
                    />
                    <div className="invalid-feedback">{errors?.dayDate}</div>
                  </div>
                </li>
              )}

              <li>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <input
                    className="form-control"
                    placeholder="Remarks"
                    value={planner.adminToTeacherRemrk}
                    onChange={(e) =>
                      handleTopChange("adminToTeacherRemrk", e.target.value)
                    }
                  />

                  {/* {errors?.remarks && (
                      <div className="invalid-feedback d-block">
                        {errors?.remarks}
                      </div>
                    )}   */}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {isSelectedPlanLoading || isPlanDetailsLoading ? (
          <Loader />
        ) : (
          <>
            {!activeDay && (
              <div className="alert alert-warning text-center mt-2">
                Please Select Required Fields.
              </div>
            )}
            <h3>{activeDay}</h3>

        {activeDay && (
          <>
            <div className="dayflexsec">
              {DAY_SLOTS.map((slot) => {
                const data = dayData?.[slot];

                return (
                  <div key={slot} className="daysection">
                    <h4>{slot}</h4>

                    {/* MULTI TEXT */}
                    {MULTI_TEXT_SLOTS.includes(slot) && (
                      <div className="albox">
                        {data?.title.map((t, i) => (
                          <div key={i} className="form-group">
                            {data?.title.length > 1 && (
                              <button
                                type="button"
                                className="deletebtn"
                                onClick={() => removeTextarea(slot, i)}
                              >
                                <X size={16} />
                              </button>
                            )}
                            <textarea
                              className="form-control"
                              placeholder={`Enter ${slot}`}
                              value={t}
                              onChange={(e) =>
                                updateTextarea(slot, i, e.target.value)
                              }
                            />
                          </div>
                        ))}
                        <button
                          className="add-btn"
                          onClick={() => addTextarea(slot)}
                        >
                          + Add
                        </button>
                      </div>
                    )}

                    {DROPDOWN_SLOTS.includes(slot) && (
                      <>
                        {data?.subjects?.map((sb, sIndex) => (
                          <div
                            key={`${sb.subject}-${sIndex}`}
                            className="repeatbox "
                          >
                            <div className="form-group">
                              {data?.subjects.length > 1 && (
                                <button
                                  type="button"
                                  className="deletebtn"
                                  onClick={() => removeSubject(slot, sIndex)}
                                >
                                  <X size={16} />
                                </button>
                              )}
                              <label>Subject</label>
                              <select
                                className="form-control"
                                value={sb.subject}
                                onChange={(e) => {
                                  const selectedOption =
                                    e.target.selectedOptions[0];
                                  updateSubjectField(
                                    slot,
                                    sIndex,
                                    "subject",
                                    e.target.value,
                                  );
                                  updateSubjectField(
                                    slot,
                                    sIndex,
                                    "subjectId",
                                    selectedOption.getAttribute(
                                      "data-subjectid",
                                    ),
                                  );
                                }}
                              >
                                <option value="">Subject</option>
                                {getSubjectList({
                                  slot,
                                  sIndex,
                                  selectedValue: sb.subject,
                                })?.map((s) => (
                                  <option
                                    key={s.subjectId}
                                    value={s.subjectName}
                                    data-subjectid={s.subjectId}
                                  >
                                    {s.subjectName}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="form-group">
                              <label>Activity Name</label>
                              <input
                                className="form-control"
                                placeholder="Activity Name"
                                value={sb.activityTitle}
                                onChange={(e) =>
                                  updateSubjectField(
                                    slot,
                                    sIndex,
                                    "activityTitle",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="form-group">
                              <label>Activity Details</label>
                              <input
                                className="form-control"
                                placeholder="Activity Details"
                                value={sb?.activityDetails || ""}
                                onChange={(e) =>
                                  updateSubjectField(
                                    slot,
                                    sIndex,
                                    "activityDetails",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            {sb?.themeName?.map((th, tIndex) => (
                              <div
                                key={`${th.name}-${tIndex}`}
                                className="form-group"
                              >
                                {sb?.themeName.length > 1 && (
                                  <button
                                    type="button"
                                    className="deletebtn"
                                    onClick={() =>
                                      removeTheme(slot, sIndex, tIndex)
                                    }
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                                <label>Theme</label>
                                <select
                                  className="form-control"
                                  value={th.name}
                                  onChange={(e) =>
                                    updateTheme(
                                      slot,
                                      sIndex,
                                      tIndex,
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="">Theme</option>
                                  {getThemeList({
                                    slot,
                                    sIndex,
                                    selectedValue: th.name,
                                  })?.map((t) => (
                                    <option key={t.id} value={t.theme}>
                                      {t.theme}
                                    </option>
                                  ))}
                                </select>

                                {th.name && (
                                  <Select
                                    isMulti
                                    isSearchable
                                    options={getPagesForTheme(th.name)}
                                    value={getPagesForTheme(th.name)?.filter(
                                      (opt) => th.numbers.includes(opt.value),
                                    )}
                                    onChange={(selected) =>
                                      updateThemeNumbers(
                                        slot,
                                        sIndex,
                                        tIndex,
                                        selected
                                          ? selected.map((o) => o.value)
                                          : [],
                                      )
                                    }
                                    placeholder="Select numbers..."
                                    className="react-select"
                                    classNamePrefix="rs"
                                  />
                                )}
                              </div>
                            ))}

                            <button
                              className="add-btn"
                              onClick={() => addTheme(slot, sIndex)}
                            >
                              + Theme
                            </button>
                            {!planner?.daily_teaching_plan_id && (
                              <input
                                type="file"
                                accept="image/png,image/*"
                                onChange={(e) => addFiles(slot, sIndex, e)}
                              />
                            )}
                            <div className="workimglist">
                              {sb?.docs?.map((doc, fIndex) => (
                                <div key={fIndex} className="homeworkimg">
                                  {!planner?.daily_teaching_plan_id && (
                                    <span>
                                      <button
                                        type="button"
                                        className="crossbtn"
                                        onClick={() =>
                                          removeFiles(slot, sIndex, fIndex)
                                        }
                                      >
                                        <X size={14} />
                                      </button>
                                    </span>
                                  )}
                                  {/* <span>{doc?.name || "-"}</span>  */}
                                  {doc instanceof File ? (
                                    <img
                                      src={URL.createObjectURL(doc)}
                                      alt={doc.name}
                                    />
                                  ) : doc?.name ? (
                                    <img
                                      src={`${UPLOAD_IMAGE_PATH}${doc.name}`}
                                      alt={doc.name}
                                      onError={(e) => {
                                        e.target.src = "/no-image.png";
                                      }}
                                    />
                                  ) : (
                                    <span>-</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button
                          className="add-btn addnewbox"
                          onClick={() => addNewSubject(slot)}
                        >
                          + Add New Subject{" "}
                        </button>

                        {/* {slot === "H.W" && (
                          <div className="homework-box">
                            <label className="hw-check">
                              <input
                                type="checkbox"
                                checked={data.homeworkRequired}
                                onChange={(e) =>
                                  updateHomework(
                                    "homeworkRequired",
                                    e.target.checked,
                                  )
                                }
                              />
                              Homework
                            </label>
                            {data.homeworkRequired && (
                              <textarea
                                className="form-control"
                                placeholder="Homework Task"
                                value={data.homeworkTask}
                                onChange={(e) =>
                                  updateHomework("homeworkTask", e.target.value)
                                }
                              />
                            )}
                          </div>
                        )} */}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

                <button
                  disabled={createUpdatePlannerMutation.isPending}
                  className="btn btn-primary"
                  onClick={handleSavePlanner}
                >
                  {createUpdatePlannerMutation.isPending
                    ? isEditView
                      ? "Updating..."
                      : "Saving..."
                    : isEditView
                      ? "Update"
                      : "Save"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
