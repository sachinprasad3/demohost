import { useLocation } from "react-router-dom";
import { useState } from "react";
import {
  useGetDailyTeachingPlanHwById,
  useGetStudentHomeworkDetails,
} from "../../../services/homework.services";
import { HomeworkViewSkeleton } from "../../../components/homework/HomeworkSkeleton";
import FileViewer from "../../../components/FileViewer";
import { formatDate } from "../../../utils";
import { DAY_SLOTS } from "../../admin/AcademicPlanForm";
import { UPLOAD_IMAGE_PATH } from "../../../context/themeRoles";
import { Eye } from "lucide-react";

const StudentHomeworkView = () => {
  const location = useLocation();
  const { dailyTeachingPlanId, assignmentId } = location.state;
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    data: hw,
    isLoading,
    error,
  } = useGetDailyTeachingPlanHwById(dailyTeachingPlanId);

  const { data: otherHomework } = useGetStudentHomeworkDetails({
    assignmentId,
  });

  if (isLoading) {
    return <HomeworkViewSkeleton />;
  }

  if (error) {
    return <div className="container">{error.message}</div>;
  }

  const handleCloseFileViewer = () => {
    setSelectedFile(null);
  };

  const hwOtherDetails = otherHomework?.data?.[0];

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

                    {Array.isArray(data.title) && data.title.length > 0 && (
                      <ul>
                        {data.title.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    )}
                    {data.subjects?.map((s, i) => (
                      <div key={i} className="subject-box">
                        {s.subject && (
                          <p>
                            <strong>Subject:</strong> {s.subject}
                          </p>
                        )}
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
                                {t.name && <p>
                                  <strong>Theme:</strong> {t.name}
                                </p>}
                                {t.numbers.length > 0 && <p>
                                  <strong>Page no.:</strong>
                                  {t.numbers.join(",")}
                                </p>}
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

            {hwOtherDetails?.assignmentStatus && (
              <li>
                <label className="fw-semibold">Assignment Status</label>
                <div>{hwOtherDetails?.assignmentStatus}</div>
              </li>
            )}
            {hwOtherDetails?.teacherGrade && (
              <li>
                <label className="fw-semibold">Grade</label>
                <div>{hwOtherDetails?.teacherGrade}</div>
              </li>
            )}
          </ul>
        </div>

        {hwOtherDetails?.teacherRemarks && (
          <div>
            <label className="fw-semibold">Remarks</label>
            <div className="border rounded p-2 bg-light">
              {hwOtherDetails?.teacherRemarks}
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
    </div>
  );
};

export default StudentHomeworkView;
