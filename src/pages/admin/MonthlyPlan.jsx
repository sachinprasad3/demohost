import { useState } from "react";
import { useEffect } from "react";
import { X, Plus, } from "lucide-react";
import { useLocation } from "react-router-dom";
import useClasses from "../../hooks/useClasses";
import { getCurrentAcademicYear } from "../../utils";
import { useGetThemesByClassId } from "../../services/theme.services";
import { useGetActiveSubjects } from "../../services/subject.services";
import { createMonthlySyllabus, getAllMonthlySyllabus } from "../../services/monthlyPlan.services";
import { useNotification } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function MonthlyPlan() {

  const academicYear = getCurrentAcademicYear();
  const { classes, loading: loadingClasses } = useClasses(academicYear);

  const [classId, setClassId] = useState("");
  const { data: subjects = [] } = useGetActiveSubjects();
  const { data: themes = [] } = useGetThemesByClassId(classId);
  const { showNotification } = useNotification();
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  const location = useLocation();
  const editId = location.state?.monthlySyllabusId;


  useEffect(() => {
    if (!editId) return;

    loadEditData();
  }, [editId]);


  const loadEditData = async () => {
    try {
      const res = await getAllMonthlySyllabus();
      const syllabus = res.data.find(s => s.monthlySyllabusId === editId);
      if (!syllabus) return;
      setClassId(String(syllabus.classId));
      const groupsFromApi = Object.values(syllabus.months).map(month => ({
        month: month.monthId,
        themes: month.themes.map(t => String(t.themeId)),
        rows: month.subjects.map(sub => ({
          subject: String(sub.subjectId),
          activities: sub.activities.length ? sub.activities : [""],
        })),
      }));

      setGroups(groupsFromApi);
    } catch (err) {
      console.error("Failed to load edit data", err);
    }
  };

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
    value: i + 1,
  }));
  const [groups, setGroups] = useState([
    { month: "", themes: [""], rows: [{ subject: "", activities: [""], },] },
  ]);

  useEffect(() => {
    if (!classId || editId) return;
    setGroups([{
      month: "",
      themes: [""],
      rows: [{ subject: "", activities: [""] }],
    }]);
  }, [classId, editId]);

  const addTheme = (groupIndex) => {
    const updated = [...groups];
    updated[groupIndex].themes.push("");
    setGroups(updated);
  };


  const addActivity = (groupIndex, rowIndex) => {
    const updated = [...groups];
    updated[groupIndex].rows[rowIndex].activities.push("");
    setGroups(updated);
  };
  const removeActivity = (groupIndex, rowIndex, activityIndex) => {
    const updated = [...groups];

    if (updated[groupIndex].rows[rowIndex].activities.length === 1) {
      return;
    }

    updated[groupIndex].rows[rowIndex].activities =
      updated[groupIndex].rows[rowIndex].activities.filter(
        (_, i) => i !== activityIndex
      );

    setGroups(updated);
  };

  const handleActivityChange = (groupIndex, rowIndex, activityIndex, value) => {
    const updated = [...groups];
    updated[groupIndex].rows[rowIndex].activities[activityIndex] = value;
    setGroups(updated);
  };


  const handleMonthChange = (groupIndex, value) => {
    const updated = [...groups];
    updated[groupIndex].month = value;
    setGroups(updated);
  };

  const handleThemeChange = (groupIndex, themeIndex, value) => {
    const updated = [...groups];
    updated[groupIndex].themes[themeIndex] = value;
    setGroups(updated);
  };


  const removeTheme = (groupIndex, themeIndex) => {
    const updated = [...groups];
    updated[groupIndex].themes = updated[groupIndex].themes.filter((_, i) => i !== themeIndex);
    setGroups(updated);
  };


  const addGroup = () => {
    setGroups([
      ...groups,
      {
        month: "",
        themes: [""],
        rows: [
          {
            subject: "",
            activities: [""],
          },
        ],
      },
    ]);
  };

  const resetForm = () => {
    setClassId("");
    setGroups([
      {
        month: "",
        themes: [""],
        rows: [{ subject: "", activities: [""] }],
      },
    ]);
  };


  const removeGroup = (groupIndex) => {
    const updated = groups.filter((_, i) => i !== groupIndex);
    setGroups(updated);
  };

  /* ---------- ROW ---------- */
  const addRow = (groupIndex) => {
    const updated = [...groups];
    updated[groupIndex].rows.push({
      subject: "",
      activities: [""],
    });
    setGroups(updated);
  };


  const removeRow = (groupIndex, rowIndex) => {
    const updated = [...groups];
    updated[groupIndex].rows = updated[groupIndex].rows.filter(
      (_, i) => i !== rowIndex
    );
    setGroups(updated);
  };

  const handleRowChange = (groupIndex, rowIndex, field, value) => {
    const updated = [...groups];
    updated[groupIndex].rows[rowIndex][field] = value;
    setGroups(updated);
  };

  const usedMonths = groups.map(g => Number(g.month)).filter(Boolean);


  const monthMap = MONTHS.reduce((acc, m) => {
    acc[m.value] = m.label;
    return acc;
  }, {});

  const subjectMap = subjects.reduce((acc, s) => {
    acc[s.subjectId] = s.subjectName;
    return acc;
  }, {});

  const themeMap = themes.reduce((acc, t) => {
    acc[t.id] = t.theme;
    return acc;
  }, {});


  const buildPayload = () => {
    const months = {};

    groups.forEach((group) => {
      if (!group.month) return;

      const monthValue = Number(group.month);

      months[monthValue] = {
        monthId: monthValue,
        monthName: monthMap[monthValue],

        themes: group.themes
          .filter(Boolean)
          .map(themeId => ({
            themeId: Number(themeId),
            themeName: themeMap[Number(themeId)],
          })),

        subjects: group.rows
          .filter(r => r.subject)
          .map(row => ({
            subjectId: Number(row.subject),
            subjectName: subjectMap[Number(row.subject)],
            activities: row.activities.filter(Boolean),
          })),
      };
    });

    const selectedClass = classes.find(
      c => String(c.classId) === String(classId)
    );

    return {
      monthlySyllabusId: editId || null, academicYear, classId: Number(classId), className: selectedClass?.className || "", months,
    };
  };

  const validateForm = () => {
    const errors = {};

    if (!classId) {
      errors.classId = "Please select class";
    }

    groups.forEach((group, gIndex) => {
      if (!group.month) {
        errors[`month_${gIndex}`] = "Please select month";
      }

      group.themes.forEach((t, tIndex) => {
        if (!t) {
          errors[`theme_${gIndex}_${tIndex}`] = "Please select theme";
        }
      });

      group.rows.forEach((row, rIndex) => {
        if (!row.subject) {
          errors[`subject_${gIndex}_${rIndex}`] = "Please select subject";
        }

        row.activities.forEach((a, aIndex) => {
          if (!a.trim()) {
            errors[`activity_${gIndex}_${rIndex}_${aIndex}`] =
              "Activity cannot be empty";
          }
        });
      });
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (key) => {
    setFieldErrors(prev => {
      if (!prev[key]) return prev;
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };



  const saveMonthlySyllabus = async () => {
    if (!validateForm()) return;
    try {
      const payload = buildPayload();

      const res = await createMonthlySyllabus(payload);

      showNotification({
        message: editId
          ? "Monthly syllabus updated successfully"
          : "Monthly syllabus saved successfully",
        type: "success",
        duration: 2000,
      });

      resetForm();

      setTimeout(() => {
        navigate("../monthly-plan-list");
      }, 500);

    } catch (error) {
      console.error("API error:", error);
      showNotification({
        message: "Failed to save monthly syllabus",
        type: "error",
        duration: 2000,
      });
    }
  };




  return (
    <div className="container">
      <form>

        <div className="addfee-head whitebox msl-headbox mb-2">
          <div className="form-group msl-class">
            <div>Class <span className="text-red">*</span></div>
            <select className={`form-control ${fieldErrors.classId ? "is-invalid" : ""}`}
              value={classId} disabled={!!editId}
              onChange={(e) => {
                setClassId(e.target.value);
                clearFieldError("classId");
              }}
            >
              <option value="">Select Class</option>
              {classes?.map((cls) => (
                <option key={cls.classId} value={cls.classId}>{cls.className}</option>
              ))}
            </select>
            {fieldErrors.classId && (
              <div className="invalid-feedback d-block">
                {fieldErrors.classId}
              </div>
            )}

          </div>
          <button type="button" className="btn btn-sm btn-primary" onClick={() => navigate("../monthly-plan-list")}>Plan List</button>
        </div>
        {!classId && (
          <div className="alert alert-warning text-center mt-2">
            Please select a class first to create monthly plan.
          </div>
        )}
        {classId && (
          <>
            {groups.map((group, gIndex) => (
              <div className="whitebox syllabus-box " key={gIndex}>
                <div className="repeat-row">
                  {groups.length > 1 && (
                    <button
                      type="button"
                      className="deletebtn"
                      onClick={() => removeGroup(gIndex)}
                    >
                      <X size={16} />
                    </button>
                  )}
                  {/* MONTH + THEME */}
                  <div className="month-box">
                    <div className="form-group">
                      <label>
                        Month <span className="text-red">*</span>
                      </label>
                      <select
                        className={`form-control ${fieldErrors[`month_${gIndex}`] ? "is-invalid" : ""}`}
                        value={group.month}
                        onChange={(e) => {
                          handleMonthChange(gIndex, e.target.value);
                          clearFieldError(`month_${gIndex}`);
                        }}
                      >
                        <option value="">Select Month</option>

                        {MONTHS.filter(
                          (m) =>
                            !usedMonths.includes(m.value) ||
                            m.value === Number(group.month)
                        ).map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}

                      </select>
                      {fieldErrors[`month_${gIndex}`] && (
                        <div className="invalid-feedback d-block">
                          {fieldErrors[`month_${gIndex}`]}
                        </div>
                      )}



                    </div>

                    {group?.themes?.map((theme, tIndex) => (
                      <div key={tIndex} className="select-theme form-group">
                        <label>
                          Theme <span className="text-red">*</span>
                        </label>
                        <select
                          className={`form-control ${fieldErrors[`theme_${gIndex}_${tIndex}`] ? "is-invalid" : ""}`}
                          value={theme}
                          onChange={(e) => {
                            handleThemeChange(gIndex, tIndex, e.target.value);
                            clearFieldError(`theme_${gIndex}_${tIndex}`);
                          }}
                        >
                          <option value="">Select Theme</option>

                          {themes
                            .filter(
                              (t) =>
                                !group.themes
                                  .map(Number)
                                  .includes(t.id) ||
                                t.id === Number(theme)
                            )
                            .map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.theme}
                              </option>
                            ))}

                        </select>
                        {fieldErrors[`theme_${gIndex}_${tIndex}`] && (
                          <div className="invalid-feedback d-block">
                            {fieldErrors[`theme_${gIndex}_${tIndex}`]}
                          </div>
                        )}

                        {theme && tIndex === group.themes.length - 1 && (
                          <button
                            type="button"
                            className="addtheme-box"
                            onClick={() => addTheme(gIndex)}
                          >
                            <Plus size={14} />
                          </button>
                        )}

                        {theme && group.themes.length > 1 && (
                          <button
                            type="button"
                            className="deletebtn"
                            onClick={() => removeTheme(gIndex, tIndex)}
                          >
                            <X size={14} />
                          </button>
                        )}

                      </div>
                    ))}

                  </div>

                  <div className="repeat-box">
                    <ul>
                      {group.rows.map((row, rIndex) => (
                        <li key={rIndex}>
                          <div className="theme-box">
                            <div className="form-group">
                              <label>
                                Subject <span className="text-red">*</span>
                              </label>

                              <select
                                className={`form-control ${fieldErrors[`subject_${gIndex}_${rIndex}`] ? "is-invalid" : ""}`}
                                value={row.subject}
                                onChange={(e) => {
                                  handleRowChange(gIndex, rIndex, "subject", e.target.value);
                                  clearFieldError(`subject_${gIndex}_${rIndex}`);
                                }}
                              >
                                <option value="">Select Subject</option>

                                {subjects
                                  .filter((s) =>
                                    !group.rows.some(
                                      (r, i) =>
                                        i !== rIndex &&
                                        Number(r.subject) === s.subjectId
                                    )
                                  )
                                  .map((s) => (
                                    <option key={s.subjectId} value={s.subjectId}>
                                      {s.subjectName}
                                    </option>
                                  ))}


                              </select>
                              {fieldErrors[`subject_${gIndex}_${rIndex}`] && (
                                <div className="invalid-feedback d-block">
                                  {fieldErrors[`subject_${gIndex}_${rIndex}`]}
                                </div>
                              )}



                            </div>

                            <div className="form-group">
                              <label>
                                Activities <span className="text-red">*</span>
                              </label>

                              {row.activities.map((activity, aIndex) => (
                                <div key={aIndex} className="activitybox-btn">

                                  <input
                                    type="text"
                                    className={`form-control ${fieldErrors[`activity_${gIndex}_${rIndex}_${aIndex}`] ? "is-invalid" : ""}`}
                                    placeholder="Enter activity..."
                                    value={activity}
                                    onChange={(e) => {
                                      handleActivityChange(gIndex, rIndex, aIndex, e.target.value);
                                      clearFieldError(`activity_${gIndex}_${rIndex}_${aIndex}`);
                                    }}
                                  />
                                  {fieldErrors[`activity_${gIndex}_${rIndex}_${aIndex}`] && (
                                    <div className="invalid-feedback d-block">
                                      {fieldErrors[`activity_${gIndex}_${rIndex}_${aIndex}`]}
                                    </div>
                                  )}

                                  {aIndex === row.activities.length - 1 && (
                                    <button
                                      type="button"
                                      className="addactivity-btn"
                                      onClick={() => addActivity(gIndex, rIndex)}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  )}

                                  {row.activities.length > 1 && (
                                    <button type="button" className="deletebtn" onClick={() => removeActivity(gIndex, rIndex, aIndex)}>
                                      <X size={14} />
                                    </button>
                                  )}

                                </div>
                              ))}

                            </div>

                            {rIndex === group.rows.length - 1 && (
                              <button
                                type="button"
                                className="addtheme-box"
                                onClick={() => addRow(gIndex)}
                              >
                                <Plus size={15} />
                              </button>
                            )}

                            {group.rows.length > 1 && (
                              <button
                                type="button"
                                className="deletebtn"
                                onClick={() => removeRow(gIndex, rIndex)}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            ))}
            <div className="text-right">
              <button type="button" className="addtheme-row" onClick={addGroup}>+ Add Another Month / Theme</button>
            </div>
            <div className="text-center mt-2">
              <button type="button" className="btn btn-primary fullsec" onClick={saveMonthlySyllabus}>Save Monthly Plan</button>
            </div>
          </>
        )}

      </form>
    </div>
  );
}
