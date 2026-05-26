import { useLocation, useNavigate } from "react-router-dom";
import {
  useApproveHomework,
  useGetAllottedStudentListV2,
  useGetDailyTeachingPlanHwById,
  useRejectHomework,
} from "../../../services/homework.services";
import { HomeworkViewSkeleton } from "../../../components/homework/HomeworkSkeleton";
import FileViewer from "../../../components/FileViewer";
import { useEffect, useState } from "react";
import { Eye, FileText, X } from "lucide-react";
import { useDataSelection } from "../../../hooks/useDataSelection";
import { useNotification } from "../../../context/NotificationContext";
import { formatDate } from "../../../utils";
import {
  DAY_SLOTS,
  DROPDOWN_SLOTS,
  MULTI_TEXT_SLOTS,
} from "../AcademicPlanForm";
import { useGetActiveSubjects } from "../../../services/subject.services";
import { useGetThemes } from "../../../services/theme.services";
import Select from "react-select";
import { UPLOAD_IMAGE_PATH } from "../../../context/themeRoles";
import { createPdfFromPages, File_Base_Url } from "../master/Theme";
import { useLoader } from "../../../context/LoaderContext";

const ForwardedHomeworkView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    id,
    allotmentId,
    assignmentStatus,
    homeworkAllotmentStatus,
    studentVisibility = false,
    forwardVisibility = false,
  } = location.state;
  const [selectedFile, setSelectedFile] = useState(null);
  const [planner, setPlanner] = useState(null);
  const { showLoader, hideLoader } = useLoader();

  const approveHwMutate = useApproveHomework();
  const rejectHwMutate = useRejectHomework();
  const { showNotification } = useNotification();
  const { data: hw, isLoading, error } = useGetDailyTeachingPlanHwById(id);

  const { data: students, isLoading: isStudentLoading } =
    useGetAllottedStudentListV2({
      allotmentId,
      homeworkAllotmentStatus,
    });

  const {
    selectedData,
    selectedLength,
    isAllSelected,
    isSelected,
    handleSelect,
    handleAllSelect,
  } = useDataSelection({ data: students?.data, key: "assignmentId" });

  useEffect(() => {
    if (hw) {
      setPlanner(JSON.parse(JSON.stringify(hw)));
    }
  }, [hw]);

  useEffect(() => {
    if (approveHwMutate.isPending) {
      showLoader("Approving homework...");
    } else {
      hideLoader();
    }
  }, [approveHwMutate.isPending]);

  useEffect(() => {
    if (rejectHwMutate.isPending) {
      showLoader("Rejecting homework...");
    } else {
      hideLoader();
    }
  }, [rejectHwMutate.isPending]);

  const { data: subjects } = useGetActiveSubjects();

  const { data: themes } = useGetThemes();

  if (isLoading) {
    return <HomeworkViewSkeleton />;
  }

  if (error) {
    return <div className="container">{error.message}</div>;
  }

  const handleCloseFileViewer = () => {
    setSelectedFile(null);
  };

  const handleApprove = () => {
    if (approveHwMutate.isPending) return;

    if (!selectedLength) {
      showNotification({
        message: "Please select at least 1 student",
        type: "error",
        duration: 2000,
      });
      return;
    }

    const selectedStudents = Array.from(selectedData);

    approveHwMutate.mutate(
      {
        allotmentId,
        assignmentIds: selectedStudents,
        dailyTeachingPlanId: id,
        plans: hw?.plans,
        adminToParent: planner?.plans,
        adminToParentRemrk: "string",
      },
      {
        onSuccess: () => {
          navigate("/admin/homework-list");
        },
      },
    );
  };

  const handleReject = () => {
    if (rejectHwMutate.isPending) return;

    rejectHwMutate.mutate(allotmentId, {
      onSuccess: () => {
        navigate("/admin/homework-list");
      },
    });
  };

  const hwOtherDetails = students?.data?.[0];

  const handleEdit = (id) => {
    if (!id) return;

    navigate("/admin/edit-homework", { state: { isEditView: true, id } });
    return;
  };

  /* ---------- MULTI TEXT ---------- */
  const addTextarea = (slot) => {
    setPlanner((prev) => ({
      ...prev,
      plans: {
        ...prev.plans,
        [slot]: {
          ...prev.plans[slot],
          title: [...prev.plans[slot].title, { title: "", status: "PENDING" }],
        },
      },
    }));
  };

  const updateTextarea = (slot, index, value) => {
    const updated = [...planner.plans[slot].title];
    updated[index] = { ...updated[index], title: value };

    setPlanner((prev) => ({
      ...prev,
      plans: {
        ...prev.plans,
        [slot]: { ...prev.plans[slot], title: updated },
      },
    }));
  };

  /* ---------- SUBJECT HANDLERS ---------- */
  const updateSubjectField = (slot, sIndex, field, value) => {
    const updated = [...planner.plans[slot].subjects];
    updated[sIndex][field] = value;

    setPlanner((prev) => ({
      ...prev,
      plans: {
        ...prev.plans,
        [slot]: { ...prev.plans[slot], subjects: updated },
      },
    }));
  };

  const addNewSubject = (slot) => {
    setPlanner((prev) => ({
      ...prev,
      plans: {
        ...prev.plans,
        [slot]: {
          ...prev.plans[slot],
          subjects: [
            ...prev.plans[slot].subjects,
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
    }));
  };

  /* ---------- THEME ---------- */
  const updateTheme = (slot, sIndex, tIndex, value) => {
    const updated = [...planner.plans[slot].subjects];
    updated[sIndex].themeName[tIndex] = { name: value, numbers: [] };
    updateSubjectField(slot, sIndex, "themeName", updated[sIndex].themeName);
  };

  const updateThemeNumbers = (slot, sIndex, tIndex, values) => {
    const updated = [...planner.plans[slot].subjects];
    updated[sIndex].themeName[tIndex].numbers = values;
    updateSubjectField(slot, sIndex, "themeName", updated[sIndex].themeName);
  };

  const addTheme = (slot, sIndex) => {
    const updated = [...planner.plans[slot].subjects];
    updated[sIndex].themeName.push({ name: "", numbers: [] });
    updateSubjectField(slot, sIndex, "themeName", updated[sIndex].themeName);
  };

  const removeSubject = (slot, sIndex) => {
    const updated = [...planner.plans[slot].subjects];
    updated.splice(sIndex, 1);

    setPlanner((prev) => ({
      ...prev,
      plans: {
        ...prev.plans,
        [slot]: {
          ...prev.plans[slot],
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
    }));
  };

  const removeTextarea = (slot, index) => {
    const updated = [...planner.plans[slot].title];
    updated.splice(index, 1);

    setPlanner((prev) => ({
      ...prev,
      plans: {
        ...prev.plans,
        [slot]: {
          ...prev.plans[slot],
          title: updated.length ? updated : [{ title: "", status: "PENDING" }], // keep at least one
        },
      },
    }));
  };

  const removeTheme = (slot, sIndex, tIndex) => {
    const updated = [...planner.plans[slot].subjects];
    updated[sIndex].themeName.splice(tIndex, 1);

    if (updated[sIndex].themeName.length === 0) {
      updated[sIndex].themeName.push({ name: "", numbers: [] });
    }

    updateSubjectField(slot, sIndex, "themeName", updated[sIndex].themeName);
  };

  const getPagesForTheme = (themeName) => {
    const pages = themes?.find((th) => th.theme == themeName);

    const [start, end] = !pages?.pageNo.includes("-")
      ? [pages?.pageNo, pages?.pageNo]
      : pages?.pageNo?.split("-");
    const numStart = Number(start);
    const numEnd = Number(end);

    const len = numEnd + 1 - numStart || 20;

    return Array.from({ length: len }, (_, i) => ({
      label: Number(numStart) + i,
      value: Number(numStart) + i,
    }));
  };

  const getThemeList = ({ slot, sIndex, selectedValue }) => {
    const updated = [...planner.plans[slot].subjects];

    const theme = updated[sIndex].themeName;

    const data =
      themes?.filter(
        (th) =>
          th.theme === selectedValue || !theme.some((t) => t.name === th.theme),
      ) || [];

    return data;
  };

  const getSubjectList = ({ slot, selectedValue }) => {
    const selectedSubjects = [...planner.plans[slot].subjects];

    const data =
      subjects?.filter(
        (s) =>
          s.subjectName == selectedValue ||
          !selectedSubjects.some((ss) => ss.subject == s.subjectName),
      ) || [];

    return data;
  };

  const handleViewTheme = async (themeData) => {
    try {
      const pageNo = themeData.numbers;
      const fileName = themeData.fileName;

      const pdfUrl = File_Base_Url + fileName;

      const pdfBlob = await createPdfFromPages(pdfUrl, pageNo);
      const url = URL.createObjectURL(pdfBlob);
      setSelectedFile({
        fileName,
        filePath: url,
        isPdf: true,
        isDownloadable: true,
      });
    } catch (err) {
      showNotification({
        message: err.message || "Something went wrong",
        type: "error",
        duration: 2000,
      });
    }
  };

  return (
    <div className="container">
      {/* ================= CLASS & ACADEMIC INFO ================= */}
      <div className="whitebox">
        <h3>Class & Academic Information</h3>

        <div className="formbox searchsec">
          <ul>
            <li>
              <label className="fw-semibold">Academic Year</label>
              <div>{hw?.academicYear}</div>
            </li>

            <li>
              <label className="fw-semibold">Class</label>
              <div>
                {hw?.className}
              </div>
            </li>

            <li>
              <label className="fw-semibold">Syllabus</label>
              <div>{hw?.syllabusName}</div>
            </li>
          </ul>
        </div>
      </div>

      {/* ================= HOMEWORK INFO ================= */}
      <div className="whitebox">
        <h3>Homework Information</h3>

        {forwardVisibility ? (
          <>
            {planner && (
              <>
                <div className="dayflexsec">
                  {DAY_SLOTS.map((slot) => {
                    const data = planner.plans?.[slot];

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
                                <span className="badge bg-secondary ms-2">
                                  {t?.status}
                                </span>
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
                                  <div className="d-flex">
                                    <label>Subject</label>
                                    <span className="badge bg-secondary ms-2">
                                      {sb.status}
                                    </span>
                                  </div>
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
                                    {th.numbers.length > 0 && (
                                      <button
                                        onClick={() => handleViewTheme(th)}
                                        className="pdfcolor mb-1"
                                      >
                                        <FileText size={16} />
                                      </button>
                                    )}
                                  </div>
                                ))}

                                <button
                                  className="add-btn"
                                  onClick={() => addTheme(slot, sIndex)}
                                >
                                  + Theme
                                </button>

                                {sb?.docs?.length > 0 && (
                                  <div className="workimglist">
                                    {sb?.docs?.map((doc, idx) => (
                                      <div
                                        className="homeworkimg"
                                        key={doc.name}
                                        onClick={() =>
                                          setSelectedFile({
                                            fileName: doc.name,
                                            filePath:
                                              UPLOAD_IMAGE_PATH + doc.name,
                                            isDownloadable: true,
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
                                )}
                              </div>
                            ))}
                            <button
                              className="add-btn addnewbox"
                              onClick={() => addNewSubject(slot)}
                            >
                              + Add New Subject{" "}
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {planner && (
              <>
                {/* <h3>{updatedPlan?.day}</h3> */}
                {hw?.adminToTeacherRemrk && (
                  <div className="mb-2">
                    <label className="fw-semibold">Admin Remarks</label>
                    <div className="border rounded p-2 bg-light">
                      {hw?.adminToTeacherRemrk}
                    </div>
                  </div>
                )}
                <div className="dayflexsec">
                  {DAY_SLOTS.map((slot) => {
                    const data = planner?.plans?.[slot];
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
                                  <li key={i}>
                                    <div className="d-flex justify-content-between align-items-start">
                                      {t?.title}
                                      <input
                                        type="checkbox"
                                        disabled={true}
                                        checked={t?.status === "COMPLETED"}
                                      />
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted">No {slot}</p>
                            );
                          })()}
                        {data.subjects?.map((s, i) => (
                          <div key={i} className="subject-box">
                            <div className="d-flex justify-content-between">
                              {s.subject && (
                                <p>
                                  <strong>Subject:</strong> {s.subject}
                                </p>
                              )}
                              <input
                                type="checkbox"
                                disabled={true}
                                checked={s?.status === "COMPLETED"}
                              />
                            </div>

                            {s.activityTitle && (
                              <p>
                                <strong>Activity Name:</strong>
                                {s.activityTitle}
                              </p>
                            )}

                            {s.activityDetails && (
                              <p>
                                <strong>Activity Details:</strong>
                                {s.activityDetails}
                              </p>
                            )}

                            {s.themeName?.length > 0 && (
                              <>
                                {s.themeName.map((t, i) => (
                                  <>
                                    <div key={i} className={t.name && "theme-block"}>
                                      {t.name && (
                                        <p>
                                          <strong>Theme:</strong> {t.name}
                                        </p>
                                      )}
                                      {t.numbers.length > 0 && (<p>
                                        <strong>Page no.:</strong>{" "}
                                        {t.numbers.join(",")}

                                        <button
                                          onClick={() => handleViewTheme(t)}
                                          className="pdfcolor"
                                        >
                                          <FileText size={16} />
                                        </button>
                                      </p>)}
                                    </div>
                                  </>
                                ))}
                              </>
                            )}

                            {s?.docs?.length > 0 && (
                              <>
                                <p>
                                  <strong>Documents:</strong>
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
                                          isDownloadable: true,
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

        <hr />

        <div className="formbox searchsec">
          <ul>
            <li>
              <label className="fw-semibold">Due Date</label>
              <div>{formatDate(hwOtherDetails?.dueDate)}</div>
            </li>

            <li>
              <label className="fw-semibold">Submission Type</label>
              <div>{hwOtherDetails?.submissionType}</div>
            </li>

            <li>
              <label className="fw-semibold">Alloted Date</label>
              <div>{formatDate(hwOtherDetails?.allotedDate)}</div>
            </li>

            <li>
              <label className="fw-semibold">Allotment Status</label>
              <div>{hwOtherDetails?.homeworkStatus}</div>
            </li>
          </ul>
        </div>

        <label className="fw-semibold mt-2">Alloted Remarks</label>
        <div className="border rounded p-2 bg-light">
          {hw?.teacherToAdminRemrk || "-"}
        </div>

        {hwOtherDetails?.completionStatusCreatedAt && (
          <div className="mt-4">
            <label className="fw-semibold">Completed Date</label>
            <div>{formatDate(hwOtherDetails?.completionStatusCreatedAt)}</div>
          </div>
        )}
        {hwOtherDetails?.completionRemark && (
          <>
            <label className="fw-semibold mt-2">Completed Remarks</label>
            <div className="border rounded p-2 bg-light">
              {hwOtherDetails?.completionRemark || "-"}
            </div>
          </>
        )}
      </div>

      {/* =========== File Viewer ========= */}
      <FileViewer
        file={selectedFile}
        open={!!selectedFile}
        onClose={handleCloseFileViewer}
        title="Homework Attachments"
      />

      {/* ================= STUDENT LIST ================= */}
      {studentVisibility && (
        <div className="whitebox">
          <h3>Assign Homework to Students</h3>

          <div className="listsec syllabus-master">
            <div className="listbox studentlist theading">
              <div style={{ width: "5%" }}>Sl.</div>
              {forwardVisibility && (
                <div style={{ width: "5%" }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleAllSelect}
                  />
                </div>
              )}
              <div>Roll No</div>
              <div>Student Name</div>
              <div>Total Attendance</div>
              <div>Status</div>
              <div>Stars</div>
              <div>Remarks</div>
            </div>

            <ul>
              {isStudentLoading && (
                <li>
                  <div className="listbox studentlist">Loading...</div>
                </li>
              )}

              {students?.data?.length === 0 && (
                <li>
                  <div className="listbox ">No student found</div>
                </li>
              )}

              {students?.data
                ?.filter((s) => {
                  if (homeworkAllotmentStatus === "CANCELLED") {
                    return s.assignmentStatus === "CANCELLED";
                  } else {
                    return s.assignmentStatus !== "CANCELLED";
                  }
                })
                .map((student, index) => (
                  <li key={student.studentId}>
                    <div className="listbox studentlist">
                      <div>{index + 1}</div>
                      {forwardVisibility && (
                        <div>
                          <input
                            type="checkbox"
                            checked={isSelected(student.assignmentId)}
                            onChange={() => handleSelect(student.assignmentId)}
                          />
                        </div>
                      )}
                      <div data-head="Roll No">{student.rollNumber}</div>
                      <div data-head="Student Name">{student.studentName}</div>
                      <div data-head="Total Attendance">
                        {student.currentMonthAttendanceCount}
                      </div>
                      <>
                        <div data-head="Status">
                          {student?.assignmentStatus || "NA"}
                        </div>
                        <div data-head="Stars">
                          {student?.teacherGrade || "NA"}
                        </div>
                        <div data-head="Remarks">
                          {student?.teacherRemarks || "NA"}
                        </div>
                      </>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
          <div className="d-flex justify-content-between">
            <span>selected: {selectedLength}</span>
            {forwardVisibility && (
              <div className="d-flex gap-2">
                <button
                  disabled={approveHwMutate.isPending}
                  onClick={handleApprove}
                >
                  Approve
                </button>
                <button
                  disabled={rejectHwMutate.isPending}
                  onClick={handleReject}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForwardedHomeworkView;
