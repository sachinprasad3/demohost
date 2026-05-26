import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";

import {
  useGetDailylessionplanMasterSearchDataForView,
  useGetSuperSyllabusMaster,
} from "../../services/teachingPlan.services";

import { DAY_SLOTS } from "./AcademicPlanForm";
import FileViewer from "../../components/FileViewer";
import Loader from "../../components/Loader";
import { UPLOAD_IMAGE_PATH } from "../../context/themeRoles";
import { useGetDayList } from "../../services/teacherMaster.services";

/* -------------------- Helpers -------------------- */
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

/* -------------------- Component -------------------- */
export default function AdminTemplateView() {
  const navigate = useNavigate();

  /* -------------------- State -------------------- */
  const [selectedFile, setSelectedFile] = useState(null);

  const [filter, setFilter] = useState({
    classId: "",
    classCode: "",
    day: "",
  });

  const { data: dayList =[] } = useGetDayList({
    classId: filter.classId,
  });

  /* -------------------- Data -------------------- */
  const { data: classes = [] } = useGetSuperSyllabusMaster();

  const { data: plannerList = [], isLoading } =
    useGetDailylessionplanMasterSearchDataForView({
      classCode: filter?.classCode,
      day: filter?.day,
    });

  const selectedPlan = plannerList[0];
  const normalizedPlanner = normalizePlanner(selectedPlan);

  useEffect(() => {
    if (selectedPlan && !filter.classCode && !filter.day) {
      setFilter({
        classCode: selectedPlan.classCode,
        classId: selectedPlan.classId,
        day: selectedPlan.day || selectedPlan.selectedDay,
      });
    }
  }, [selectedPlan]);

  const activeDay = normalizedPlanner?.selectedDay;
  const dayData = normalizedPlanner?.days?.[activeDay] || {};

  /* -------------------- Handlers -------------------- */
  const handleClassChange = (e) => {
    const opt = e.target.selectedOptions[0];

    setFilter({
      classCode: e.target.value,
      classId: opt.getAttribute("data-classid"),
      day: "",
    });
  };

  const handleDayChange = (e) => {
    setFilter((prev) => ({ ...prev, day: e.target.value }));
  };

  const handleEdit = (id) => {
    if (!id) return;
    navigate("/admin/edit-template", {
      state: { isEditView: true, id },
    });
  };

  const handleFileOpen = (doc) => {
    setSelectedFile({
      fileName: doc.name,
      filePath: UPLOAD_IMAGE_PATH + doc.name,
    });
  };

  const handleCloseFileViewer = () => {
    setSelectedFile(null);
  };

  return (
    <>
      <div className="mainpro plannerform">
        <div className="container">
          <div className="addfee-head">
            <div></div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/add-template")}
            >
              + Add Template
            </button>
          </div>
          {/* ---------- FILTER BAR ---------- */}
          <div className="whitebox">
            <div className="formbox searchsec">
              <ul>
                <li>
                  <div className="form-group">
                    <label className="form-label"> Class</label>
                    <select
                      className="form-control"
                      value={filter.classCode}
                      onChange={handleClassChange}
                    >
                      <option value="">Select Class</option>
                      {classes?.map((option) => (
                        <option
                          key={option.classId}
                          data-classid={option.classId}
                          data-totaldays={option.totalDays}
                          value={option.classCode}
                        >
                          {option.className || option.classId}
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
                      onChange={handleDayChange}
                    >
                      <option>Select Day</option>
                      {dayList.map((day, index) => (
                        <option key={index}>{day}</option>
                      ))}
                    </select>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {isLoading ? (
            <Loader />
          ) : (
            <>
              {!selectedPlan && (
                <div className="alert alert-warning text-center mt-2">
                  Select class and day to view template.
                </div>
              )}

              {/* ---------- DAY VIEW ---------- */}
              {selectedPlan && (
                <>
                  <div className="addfee-head">
                    <h3>{activeDay} </h3>
                    <button
                      onClick={() =>
                        handleEdit(selectedPlan?.daily_teaching_plan_id)
                      }
                    >
                      <Pencil size={14} /> <span className="ms-1">Edit</span>
                    </button>
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
                                  <strong>Activity Name:</strong>{" "}
                                  {s.activityTitle}
                                </p>
                              )}

                              {s.activityDetails && (
                                <p>
                                  <strong>Activity Details:</strong>{" "}
                                  {s.activityDetails}
                                </p>
                              )}

                              {s.themeName?.length > 0 && (
                                <>
                                  {s.themeName.map((t, i) => (
                                    <div
                                      key={i}
                                      className={t.name && "theme-block"}
                                    >
                                      {t.name && (
                                        <p>
                                          <strong>Theme:</strong> {t.name}
                                        </p>
                                      )}
                                      {t.numbers && (
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
                                        onClick={() => handleFileOpen(doc)}
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
