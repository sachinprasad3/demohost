import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  submissionType,
  useAssignHomeworkV2,
  useGetDailyTeachingPlanHwById,
  useGetStudentsForTeachingPlan,
} from "../../../services/homework.services";
import { HomeworkViewSkeleton } from "../../../components/homework/HomeworkSkeleton";
import FileViewer from "../../../components/FileViewer";
import { useAuth } from "../../../context/AuthContext";
import { useDataSelection } from "../../../hooks/useDataSelection";
import Select from "../../../components/AmissionFormComponents/customField/Select";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { homeworkAssignSchema } from "../../../validations/homework.schema";
import { DAY_SLOTS } from "../../admin/AcademicPlanForm";
import { Eye, FileText } from "lucide-react";
import { UPLOAD_IMAGE_PATH } from "../../../context/themeRoles";
import { createPdfFromPages, File_Base_Url } from "../../admin/master/Theme";
import { useNotification } from "../../../context/NotificationContext";
import { useLoader } from "../../../context/LoaderContext";

const TeacherHomeworkView = () => {
  const location = useLocation();
  const teachingPlaneHwId = location.state?.id;
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = useAuth();
  const [updatedPlan, setUpdatedPlan] = useState(null);
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoader();
   
  const {
    data: hw,
    isLoading,
    error,
  } = useGetDailyTeachingPlanHwById(teachingPlaneHwId);

  useEffect(() => {
    if (hw) {
      setUpdatedPlan(JSON.parse(JSON.stringify(hw.plans)));
    }
  }, [hw]);

  const { data: students, isLoading: isStudentLoading } =
    useGetStudentsForTeachingPlan({
      classId: hw?.classId,
      teachingPlanId: teachingPlaneHwId,
    });

  const {
    selectedData,
    selectedLength,
    isAllSelected,
    isSelected,
    handleSelect,
    handleAllSelect,
  } = useDataSelection({ data: students, key: "studentId" });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(homeworkAssignSchema),
    mode: "all",
    defaultValues: {
      dailyTeachingPlanId: teachingPlaneHwId,
      teacherId: user?.teacherInfo?.teacherId,
    },
  });

  useEffect(() => {
    setValue("studentIds", Array.from(selectedData));
  }, [selectedData, setValue]);

  const hwAssignMutation = useAssignHomeworkV2();

  useEffect(() => {
    if (hwAssignMutation.isPending) {
      showLoader("Assigning homework...");
    } else {
      hideLoader();
    }
  }, [hwAssignMutation.isPending]);

  if (isLoading) {
    return <HomeworkViewSkeleton />;
  }

  if (error) {
    return <div className="container">{error.message}</div>;
  }

  const handleAssignHomework = (data) => {
    const updatedObj = {
      ...data,
      plans: hw.plans,
      teacherToAdmin: updatedPlan,
    };

    hwAssignMutation.mutate(updatedObj, {
      onSuccess: () => {
        navigate("/teacher/allotted-homework");
      },
    });
  };

  const handleCloseFileViewer = () => {
    setSelectedFile(null);
  };

  const handleUpdateStatus = (slot, sIndex, value) => {
    setUpdatedPlan((prev) => {
      const updated = [...prev[slot].subjects];

      updated[sIndex]["status"] = value === "false" ? "COMPLETED" : "PENDING";
      return {
        ...prev,
        [slot]: {
          ...prev[slot],
          subjects: updated,
        },
      };
    });
  };

  const handleUpdateTitleStatus = (slot, sIndex, value) => {
    setUpdatedPlan((prev) => {
      const updated = [...prev[slot].title];

      updated[sIndex]["status"] = value === "false" ? "COMPLETED" : "PENDING";
      return {
        ...prev,
        [slot]: {
          ...prev[slot],
          title: updated,
        },
      };
    });
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

  // const commonHwDetails = hw?.[0] || null;
  return (
    <div className="container">
      <form onSubmit={handleSubmit(handleAssignHomework)}>
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

          {updatedPlan && (
            <>
              {/* <h3>{updatedPlan?.day}</h3> */}
              <div className="dayflexsec">
                {DAY_SLOTS.map((slot) => {
                  const data = updatedPlan?.[slot];
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
                                      checked={t?.status === "COMPLETED"}
                                      value={t?.status === "COMPLETED"}
                                      onChange={(e) =>
                                        handleUpdateTitleStatus(
                                          slot,
                                          i,
                                          e.target.value,
                                        )
                                      }
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
                              checked={s?.status === "COMPLETED"}
                              value={s?.status === "COMPLETED"}
                              onChange={(e) =>
                                handleUpdateStatus(slot, i, e.target.value)
                              }
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
                                        type="button"
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

          {hw?.adminToTeacherRemrk && (
            <div>
              <label className="fw-semibold">Admin Remarks</label>
              <div className="border rounded p-2 bg-light">
                {hw?.adminToTeacherRemrk}
              </div>
            </div>
          )}
        </div>

        {/* =========== File Viewer ========= */}
        <FileViewer
          file={selectedFile}
          open={!!selectedFile}
          onClose={handleCloseFileViewer}
          title="Homework Attachments"
        />

        {/* ================= HOMEWORK INFO ================= */}
        <div className="whitebox">
          <h3>Homework Assignment Details</h3>

          <div className="formbox searchsec stapform">
            <ul>
              <li>
                <div className="form-group">
                  <label className="form-label">
                    Due Date <span className="text-red">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-control ${
                      errors.dueDate ? "is-invalid" : ""
                    }`}
                    {...register("dueDate")}
                  />
                  <div className="invalid-feedback">
                    {errors.dueDate?.message}
                  </div>
                </div>
              </li>

              {/* <li>
                <div className="form-group">
                  <label className="form-label">
                    Visible Till <span className="text-red">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-control ${
                      errors.visibleTill ? "is-invalid" : ""
                    }`}
                    {...register("visibleTill")}
                  />
                  <div className="invalid-feedback">
                    {errors.visibleTill?.message}
                  </div>
                </div>
              </li> */}

              <li>
                <div className="form-group">
                  <label className="form-label">
                    Submission Type <span className="text-red">*</span>
                  </label>
                  <Select
                    placeholder="Select Type"
                    options={submissionType}
                    mappingField={{ id: "id", name: "value" }}
                    {...register("submissionType")}
                    error={errors.submissionType?.message}
                  />
                </div>
              </li>
            </ul>
          </div>
          <div className="form-group">
            <label>Allotment Remarks</label>
            <textarea
              rows="4"
              placeholder="Enter remarks"
              className={`form-control ${
                errors.teacherToAdminRemrk ? "is-invalid" : ""
              }`}
              {...register("teacherToAdminRemrk")}
            />
            <div className="invalid-feedback">
              {errors.teacherToAdminRemrk?.message}
            </div>
          </div>
        </div>

        {/* ================= STUDENT LIST ================= */}
        <div className="whitebox">
          <h3>Assign Homework to Students</h3>

          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-3">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "5%" }} className="text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleAllSelect}
                    />
                  </th>
                  <th>Roll No</th>
                  <th>Student Name</th>
                </tr>
              </thead>

              <tbody>
                {isStudentLoading && (
                  <tr>
                    <td colSpan="3" className="text-center py-3">
                      Loading students...
                    </td>
                  </tr>
                )}

                {students?.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-3">
                      No students available
                    </td>
                  </tr>
                )}

                {students?.map((student) => (
                  <tr key={student.studentId}>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={isSelected(student.studentId)}
                        onChange={() => handleSelect(student.studentId)}
                      />
                    </td>
                    <td>{student.rollNumber}</td>
                    <td className="fw-semibold">{student.fullName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="text-muted">
                Selected: <strong>{selectedLength}</strong>
              </div>
              <div className="text-red small fw-light">
                {errors.studentIds?.message}
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Assign Homework
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TeacherHomeworkView;
