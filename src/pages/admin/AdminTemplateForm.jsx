// ======================= IMPORTS =======================
import { useEffect, useState } from "react";
import { useGetActiveSubjects } from "../../services/subject.services";
import {
  useCreateUpdateMasterPlanner,
  useGetDailylessionplanMasterById,
  useGetDailylessionplanMasterSearchData,
  useGetSuperSyllabusMaster,
} from "../../services/teachingPlan.services";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetThemesByClassId } from "../../services/theme.services";
import { X } from "lucide-react";
import { UPLOAD_IMAGE_PATH } from "../../context/themeRoles";
import useValidateFields from "../../hooks/useValidateFields";
import * as yup from "yup";
import Loader from "../../components/Loader";
import { useNotification } from "../../context/NotificationContext";
import { useLoader } from "../../context/LoaderContext";

// ======================= CONSTANTS =======================
export const days = (totalCount) =>
  Array.from({ length: totalCount }, (_, i) => `Day ${i + 1}`);

export const DAY_SLOTS = ["Assembly", "C.W", "H.W", "Oral", "Activity"];
export const MULTI_TEXT_SLOTS = ["Assembly", "Oral", "Activity"];
export const DROPDOWN_SLOTS = ["C.W", "H.W"];

// ======================= VALIDATION =======================
const schema = yup.object({
  classId: yup.string().required("Class is required"),
  day: yup.string().required("Day is required"),
});

// ======================= HELPERS =======================
const getUpdatedField = (field) => {
  switch (field) {
    case "classId":
      return {
        classId: "",
        classCode: "",
        day: "",
      };
    default:
      return {};
  }
};

export const hasAtLeastOneFilledField = (data) => {
  if (!data || typeof data !== "object") return false;

  const isNonEmptyString = (val) =>
    typeof val === "string" && val.trim() !== "";

  const isNonEmptyArray = (arr) => Array.isArray(arr) && arr.length > 0;

  for (const sectionKey in data) {
    const section = data[sectionKey];

    if (!section) continue;

    // 1️⃣ Check title
    if (Array.isArray(section.title)) {
      for (const tit of section.title) {
        if (isNonEmptyString(tit?.title)) return true;
      }
    } else if (isNonEmptyString(section.title)) {
      return true;
    }

    // 2️⃣ Check subjects
    if (Array.isArray(section.subjects)) {
      for (const subject of section.subjects) {
        if (!subject) continue;

        if (
          isNonEmptyString(subject.subject) ||
          isNonEmptyString(subject.activityTitle) ||
          isNonEmptyString(subject.activityDetails) ||
          isNonEmptyString(subject.homeworkTask)
        ) {
          return true;
        }

        if (subject.homeworkRequired === true) return true;

        if (isNonEmptyArray(subject.docs)) return true;

        // 3️⃣ Check themeName
        if (Array.isArray(subject.themeName)) {
          for (const theme of subject.themeName) {
            if (
              isNonEmptyString(theme?.name) ||
              isNonEmptyArray(theme?.numbers)
            ) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
};

// ======================= INITIAL PLANNER =======================
const createInitialPlanner = (planDetails) => {
  const totalDays = days(120);

  return {
    daily_teaching_plan_id: planDetails?.daily_teaching_plan_id || "",
    className: planDetails?.className || "",
    classId: planDetails?.classId || "",
    classCode: planDetails?.classCode || "",
    day: planDetails?.day || "",
    createdBy: planDetails?.createdBy || "Admin",
    createdAt: planDetails?.createdAt || new Date().toISOString(),

    days: totalDays.reduce((acc, day) => {
      acc[day] =
        day === planDetails?.day
          ? planDetails?.plans
          : DAY_SLOTS.reduce((slots, slot) => {
              slots[slot] = {
                title: MULTI_TEXT_SLOTS.includes(slot) ? [{title: "", status: "PENDING"}] : "",
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

// ======================= UTILS =======================
export const getAcademicYearRange = (academicYear) => {
  if (!academicYear) return {};

  const [startYear, endYear] = academicYear.split("-");

  return {
    minDate: `${startYear}-04-01`,
    maxDate: `${endYear}-03-31`,
  };
};

// ======================= COMPONENT =======================
export default function AdminTemplateForm() {
  // ---------- ROUTER ----------
  const location = useLocation();
  const navigate = useNavigate();
  const { isEditView = false, id } = location?.state || {};
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoader();

  // ---------- STATE ----------
  const [totalSyllDays, setTotalSyllDays] = useState();
  const [planner, setPlanner] = useState(createInitialPlanner());

  const { errors, validate } = useValidateFields();

  const activeDay = planner.day;
  const dayData = planner.days?.[activeDay];

  // ---------- API ----------
  const { data: selectedPlan, isLoading: isSelectedPlanLoading } =
    useGetDailylessionplanMasterSearchData({
      classCode: planner?.classCode,
      day: planner?.day,
    });

  const { data: classes = [] } = useGetSuperSyllabusMaster();

  const { data: planDetails, isLoading: isPlanDetailsLoading } =
    useGetDailylessionplanMasterById(id);

  const { data: subjects } = useGetActiveSubjects();
  const { data: themes } = useGetThemesByClassId(planner?.classId);

  const createUpdatePlannerMutation = useCreateUpdateMasterPlanner();

  useEffect(() => {
      if (createUpdatePlannerMutation.isPending) {
        showLoader("Saving template...");
      } else {
        hideLoader();
      }
    }, [createUpdatePlannerMutation.isPending])

  // ======================= EFFECTS =======================
  useEffect(() => {
    if (planDetails && isEditView) {
      setPlanner(createInitialPlanner(planDetails));

      if (classes) {
        const matched = classes?.find((s) => s.classId == planDetails.classId);

        if (matched?.totalDays) {
          setTotalSyllDays(Number(matched.totalDays));
        }
      }
    }
  }, [planDetails, isEditView, classes]);

  useEffect(() => {
    if (selectedPlan?.length) {
      setPlanner(createInitialPlanner(selectedPlan[0]));
    }
  }, [selectedPlan]);

  // ======================= HANDLERS =======================

  /* ---------- TOP CHANGE ---------- */
  const handleTopChange = (field, value) => {
    const totalDays = days(120);

    setPlanner((prev) => {
      const resetField = getUpdatedField(field);

      const updated = {
        ...prev,
        daily_teaching_plan_id: "",
        ...resetField,
        [field]: value,
        days: totalDays.reduce((acc, day) => {
          acc[day] = DAY_SLOTS.reduce((slots, slot) => {
            slots[slot] = {
              title: MULTI_TEXT_SLOTS.includes(slot) ? [{title: "", status: "PENDING"}] : "",
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
            title: [...prev.days[activeDay][slot].title, {title: "", status: "PENDING"}],
          },
        },
      },
    }));
  };

  const updateTextarea = (slot, index, value) => {
    const updated = [...dayData[slot].title];
    updated[index] = {...updated[index], title: value};

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

  /* ---------- SUBJECT ---------- */
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

  /* ---------- FILE ---------- */
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

  /* ---------- REMOVE ---------- */
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
            title: updated.length ? updated : [{title: "", status: "PENDING"}],
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

  // ======================= VALIDATION =======================
  const handleValidate = async (values) => {
    return await validate({
      initialValue: {
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

  // ======================= SAVE =======================
  const handleSavePlanner = async () => {
    const { days, day, ...rest } = planner;

    const { isError } = await handleValidate({
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
    if (!hasAtLeastOneFilledField(plans)) {
      showNotification({
        message: "Please fill at least one field to save the planner.",
        type: "success",
        duration: 2000,
      });
      return;
    }

    const formData = new FormData();

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
      day,
      plans,
    };

    formData.append(
      "metadata",
      new Blob([JSON.stringify(jsonData)], {
        type: "application/json",
      }),
    );

    createUpdatePlannerMutation.mutate(formData, {
      onSuccess: () => {
        setPlanner(createInitialPlanner());
        isEditView ? navigate(-1) : navigate("/admin/view-template");
      },
    });
  };

  // ======================= HELPERS =======================
  const getPagesForTheme = (themeName) => {
    const pages = themes?.find((th) => th.theme == themeName);
    if (!pages) return [];

    const [start, end] = pages?.pageNo?.split("-");
    const numStart = start ? Number(start) : 0;
    const numEnd = end ? Number(end) : numStart;

    const len = numEnd + 1 - numStart;

    return Array.from({ length: len }, (_, i) => ({
      label: numStart + i,
      value: numStart + i,
    }));
  };

  const getThemeList = ({ slot, sIndex, selectedValue }) => {
    const updated = [...dayData[slot].subjects];
    const theme = updated[sIndex].themeName;

    return (
      themes?.filter(
        (th) =>
          th.theme === selectedValue || !theme.some((t) => t.name === th.theme),
      ) || []
    );
  };

  const getSubjectList = ({ slot, selectedValue }) => {
    const selectedSubjects = [...dayData[slot].subjects];

    return (
      subjects?.filter(
        (s) =>
          s.subjectName == selectedValue ||
          !selectedSubjects.some((ss) => ss.subject == s.subjectName),
      ) || []
    );
  };

  return (
    <div className="mainpro plannerform">
      <div className="container">
        <div className="addfee-head">
          <div></div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/view-template")}
          >
            View Template
          </button>
        </div>
        <div className="whitebox">
          <div className="formbox stapform">
            <ul>
              <li>
                <div className="form-group">
                  <label className="form-label"> Class</label>
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
                      setTotalSyllDays(
                        selectOption.getAttribute("data-totaldays"),
                      );
                    }}
                  >
                    <option data-classname={""} data-classcode={""} value={""}>
                      Select Class
                    </option>
                    {classes?.map((cl) => (
                      <option
                        key={cl.classId}
                        data-classname={cl.className}
                        data-classcode={cl.classCode}
                        data-totaldays={cl.totalDays}
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
              <li>
                <div className="form-group">
                  <label className="form-label"> Days</label>
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
            </ul>
          </div>
        </div>

        {isSelectedPlanLoading || isPlanDetailsLoading ? (
          <Loader />
        ) : (
          <>
            {!activeDay && (
              <div className="alert alert-warning text-center mt-2">
                Please Select a Class & Day.
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
                                  value={t?.title}
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
                                      onClick={() =>
                                        removeSubject(slot, sIndex)
                                      }
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
                                        value={getPagesForTheme(
                                          th.name,
                                        )?.filter((opt) =>
                                          th.numbers.includes(opt.value),
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
                                  <input
                                    type="file"
                                    accept="image/png,image/*"
                                    onChange={(e) => addFiles(slot, sIndex, e)}
                                  />
                                <div className="workimglist">
                                  {sb?.docs?.map((doc, fIndex) => (
                                    <div key={fIndex} className="homeworkimg">
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
