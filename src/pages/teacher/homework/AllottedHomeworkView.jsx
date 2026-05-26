import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  assignmentStatusList,
  gradeList,
  useGetAllottedStudentListV2,
  useGetDailyTeachingPlanHwById,
  useMarkHomeworkAsComplete,
  useUpdateAssignedHw,
} from "../../../services/homework.services";
import { HomeworkViewSkeleton } from "../../../components/homework/HomeworkSkeleton";
import FileViewer from "../../../components/FileViewer";
import { Check, Eye, FileText, Pencil, X } from "lucide-react";
import * as yup from "yup";
import useValidateFields from "../../../hooks/useValidateFields";
import { formatDate } from "../../../utils";
import Select from "../../../components/AmissionFormComponents/customField/Select";
import { useAuth } from "../../../context/AuthContext";
import { DAY_SLOTS } from "../../admin/AcademicPlanForm";
import { UPLOAD_IMAGE_PATH } from "../../../context/themeRoles";
import { createPdfFromPages, File_Base_Url } from "../../admin/master/Theme";
import { useNotification } from "../../../context/NotificationContext";
import { useLoader } from "../../../context/LoaderContext";
import Popup from "../../../components/Popup";

const schema = yup.object({
  assignmentStatus: yup.string().required("Status is required"),
  teachersGrade: yup.string().required("Grade is required"),
  teacherRemarks: yup.string().required("Remarks is required"),
  studentId: yup.number().required(),
  assignmentId: yup.number().required(),
});

const AllottedHomeworkView = () => {
  const location = useLocation();
  const { showNotification } = useNotification();
  const { id, allotmentId, assignmentStatus, homeworkAllotmentStatus } =
    location.state;
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [needToEdit, setNeedToEdit] = useState(null);
  const [completionRemark, setCompletionRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const initialValue = {
    assignmentStatus: "",
    teachersGrade: null,
    teacherRemarks: "",
    studentId: null,
    assignmentId: null,
  };
  const [formValues, setFormValues] = useState(initialValue);

  const { errors, validate } = useValidateFields();

  const { data: hw, isLoading, error } = useGetDailyTeachingPlanHwById(id);

  const { data: students = [], isLoading: isStudentLoading } =
    useGetAllottedStudentListV2({
      allotmentId,
      homeworkAllotmentStatus,
    });

  const updateAssignedHwMutation = useUpdateAssignedHw();

  const markHoeworkAsCompleteMutation = useMarkHomeworkAsComplete();

  useEffect(() => {
    if (updateAssignedHwMutation.isPending) {
      showLoader("Saving student remarks...");
    } else {
      hideLoader();
    }
  }, [updateAssignedHwMutation.isPending]);

  if (isLoading) {
    return <HomeworkViewSkeleton />;
  }

  if (error) {
    return <div className="container">{error.message}</div>;
  }

  const handleCloseFileViewer = () => {
    setSelectedFile(null);
  };

  const handleEdit = (student) => {
    const {
      assignmentStatus,
      teacherGrade,
      teacherRemarks,
      assignmentId,
      studentId,
    } = student;
    setNeedToEdit({ assignmentId, studentId });
    setFormValues({
      assignmentStatus:
        assignmentStatus === "ASSIGNED" ? "SUBMITTED" : assignmentStatus,
      teachersGrade: teacherGrade,
      teacherRemarks,
      studentId,
      assignmentId,
    });
  };

  const handleCancel = () => {
    setNeedToEdit(null);
    setFormValues(initialValue);
  };

  const handleValidate = async (values) => {
    return await validate({
      initialValue: {
        studentId: values?.studentId,
        assignmentId: values?.assignmentId,
        assignmentStatus: values?.assignmentStatus,
        teachersGrade: values?.teachersGrade,
        teacherRemarks: values?.teacherRemarks,
      },
      validateSchema: schema,
    });
  };

  const handleUpdate = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      handleValidate(updated);

      return updated;
    });
  };

  const handleSave = async () => {
    const { errors, value, isError } = await handleValidate(formValues);

    if (isError) return;
    updateAssignedHwMutation.mutate(
      [{ ...value, teacherId: user?.teacherInfo?.teacherId }],
      {
        onSuccess: () => {
          setNeedToEdit(null);
          setFormValues(initialValue);
        },
      },
    );
  };

  const handleViewTheme = async (themeData) => {
    try {
      const pageNo = themeData.numbers;
      const fileName = themeData.fileName;

      const pdfUrl = File_Base_Url + fileName;

      const pdfBlob = await createPdfFromPages(pdfUrl, pageNo);
      const url = URL.createObjectURL(pdfBlob);
      setSelectedFile({ fileName, filePath: url, isPdf: true });
    } catch (err) {
      showNotification({
        message: err.message || "Something went wrong",
        type: "success",
        duration: 2000,
      });
    }
  };

  const isAnyStudentHasNotSubmitted = () => {
    return students?.data?.some((s) => s.assignmentStatus === "ASSIGNED");
  };

  const handleMarkAsComplete = () => {
    if (isAnyStudentHasNotSubmitted()) {
      setShowCompletionPopup(true);
      return;
    }

    markHoeworkAsCompleteMutation.mutate(
      { allotmentId },
      {
        onSuccess: () => navigate(-1),
      },
    );
  };

  const handleContinue = () => {
    if (!completionRemark.trim()) {
      setRemarkError("Remark is required");
      return;
    }

    setRemarkError("");

    markHoeworkAsCompleteMutation.mutate(
      {
        allotmentId,
        completionRemark,
      },
      {
        onSuccess: () => {
          setShowCompletionPopup(false);
          navigate(-1);
        },
      },
    );
  };

  const hwOtherDetails = students?.data?.[0];

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

        {hw && (
          <>
            {/* <h3>{updatedPlan?.day}</h3> */}
            <div className="dayflexsec">
              {DAY_SLOTS.map((slot) => {
                const data = hw?.plans?.[slot];
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
                                    disabled
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
                                    <button
                                      onClick={() => handleViewTheme(t)}
                                      className="pdfcolor"
                                    >
                                      <FileText size={16} />
                                    </button>
                                  </p>
                                )}
                              </div>
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
                                      filePath: UPLOAD_IMAGE_PATH + doc.name,
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

        <hr />

        <div className="formbox searchsec">
          <ul>
            <li>
              <label className="fw-semibold">Due Date</label>
              <div>{formatDate(hwOtherDetails?.dueDate)}</div>
            </li>

            <li>
              <label className="fw-semibold">Submission Type</label>
              <div>{hwOtherDetails?.submissionType || "-"}</div>
            </li>

            <li>
              <label className="fw-semibold">Alloted Date</label>
              <div>{formatDate(hwOtherDetails?.allotedDate)}</div>
            </li>

            <li>
              <label className="fw-semibold">Allotment Status</label>
              <div>{hwOtherDetails?.homeworkStatus || "-"}</div>
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
      <div className="whitebox">
        <h3>Assign Homework to Students</h3>

        <div className="listsec syllabus-master">
          <div className="listbox studentlist theading">
            <div style={{ width: "5%" }} className="text-center">
              Sl.
            </div>
            <div>Roll No</div>
            <div>Student Name</div>
            <div>Status</div>
            <div>Stars</div>
            <div>Remarks</div>
            {homeworkAllotmentStatus === "ASSIGNED" && (
              <div style={{ width: "5%" }} className="text-center">
                Action
              </div>
            )}
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
                    <div data-head="Roll No">{student.rollNumber}</div>
                    <div data-head="Student Name">{student.studentName}</div>
                    {needToEdit?.studentId === student.studentId ? (
                      <>
                        <div className="form-group">
                          <Select
                            placeholder="Select Type"
                            name="assignmentStatus"
                            options={assignmentStatusList.filter(
                              (sList) => sList.id !== "ASSIGNED",
                            )}
                            // defaultValue={student.assignmentStatus}
                            value={formValues.assignmentStatus ?? ""}
                            onChange={handleUpdate}
                            mappingField={{ id: "id", name: "value" }}
                            error={errors?.assignmentStatus}
                          />
                        </div>
                        <div className="form-group">
                          <Select
                            placeholder="Select Stars"
                            name="teachersGrade"
                            options={gradeList}
                            // defaultValue={student.teacherGrade}
                            value={formValues.teachersGrade ?? ""}
                            onChange={handleUpdate}
                            mappingField={{ id: "id", name: "value" }}
                            error={errors?.teachersGrade}
                          />
                        </div>
                        {/* <div data-head="Title">
                          <input
                            ref={(el) => (inputsRef.current.grade = el)}
                            className={`form-control ${
                              errors?.grade ? "is-invalid" : ""
                            }`}
                            onChange={handleValidate}
                            name="grade"
                            placeholder="A+"
                          />

                          <div className="invalid-feedback">
                            {errors?.grade}
                          </div> 
                      </div> */}
                        <div>
                          <textarea
                            className={`form-control ${
                              errors?.teacherRemarks ? "is-invalid" : ""
                            }`}
                            value={formValues.teacherRemarks}
                            onChange={handleUpdate}
                            name="teacherRemarks"
                            placeholder="teacherRemarks"
                          />
                          <div className="invalid-feedback">
                            {errors?.teacherRemarks}
                          </div>
                        </div>
                      </>
                    ) : (
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
                    )}

                    {homeworkAllotmentStatus === "ASSIGNED" && (
                      <div className="actionbtns">
                        {needToEdit?.studentId !== student.studentId ? (
                          <button
                            className="editbtn"
                            onClick={() => handleEdit(student)}
                          >
                            <Pencil size={16} />
                          </button>
                        ) : (
                          <>
                            <button className="crossbtn" onClick={handleSave}>
                              <Check size={16} />
                            </button>
                            <button className="crossbtn" onClick={handleCancel}>
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {homeworkAllotmentStatus === "ASSIGNED" && (
          <div className="d-flex justify-content-end mt-2">
            <button onClick={handleMarkAsComplete} className="btn btn-primary">
              Mark as Completed
            </button>
          </div>
        )}
      </div>

      {/* ================= CONFIRMATION POPUP FOR MARKING HOMEWORK AS COMPLETE ================= */}
      {showCompletionPopup && (
        <Popup
          title="Mark Homework As Completed"
          closeOnOutsideClick={false}
          onClose={() => {
            setShowCompletionPopup(false);
            setCompletionRemark("");
            setRemarkError("");
          }}
        >
          {/* Warning Message */}
          <div className="alert alert-warning" role="alert">Not all students submitted homework. Continue marking as completed? </div>

          {/* Remark */}
          <div className="">
            <label>
              Completion Remark <span className="text-danger">*</span>{" "}
            </label>

            <textarea
              className={`form-control ${remarkError ? "is-invalid" : ""}`}
              placeholder="Enter remark"
              value={completionRemark}
              onChange={(e) => {
                setCompletionRemark(e.target.value);
                if (remarkError) setRemarkError("");
              }}
            />

            {remarkError && (
              <div className="invalid-feedback d-block">{remarkError}</div>
            )}
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowCompletionPopup(false);
                setCompletionRemark("");
                setRemarkError("");
              }}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={handleContinue}
              disabled={markHoeworkAsCompleteMutation.isPending}
            >
              {markHoeworkAsCompleteMutation.isPending
                ? "Saving..."
                : "Continue"}
            </button>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default AllottedHomeworkView;
