import { useLocation } from "react-router-dom";
import { useState } from "react";
import {
  useGetDailyTeachingPlanHwForActivityAndHomework,
  useGetStudentHomeworkDetails,
} from "../../../services/homework.services";
import { HomeworkViewSkeleton } from "../../../components/homework/HomeworkSkeleton";
import FileViewer from "../../../components/FileViewer";
import { formatDate } from "../../../utils";
import { DAY_SLOTS } from "../../admin/AcademicPlanForm";
import { UPLOAD_IMAGE_PATH } from "../../../context/themeRoles";
import { Eye, FileText } from "lucide-react";
import { createPdfFromPages, File_Base_Url } from "../../admin/master/Theme";
import { useNotification } from "../../../context/NotificationContext";

const StudentHomeworkView = () => {
  const location = useLocation();
  const { showNotification } = useNotification();
  const { dailyTeachingPlanId, assignmentId, allotmentId } = location.state;
  const isClassActivity = location.pathname.includes("class-activity");
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    data: hw,
    isLoading,
    error,
  } = useGetDailyTeachingPlanHwForActivityAndHomework({
    isClassActivity,
    dailyTeachingPlanId,
    allotmentId,
  });

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
      {!isClassActivity && (
        <>
          <h3>Homework Information</h3>
          <div className="whitebox">
            {hw && (
              <>
                {(() => {
                  const data = hw?.plans?.["H.W"];
                  if (!data) return null;

                  return (
                    <>
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
                                <>
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
                                {s.docs.map((doc, idx) => (
                                  <div
                                    className="homeworkimg"
                                    key={doc.name}
                                    onClick={() =>
                                      setSelectedFile({
                                        fileName: doc.name,
                                        filePath: UPLOAD_IMAGE_PATH + doc.name,
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
                    </>
                  );
                })()}
              </>
            )}
          </div>

          <div className="whitebox">
            <div className="formbox hview">
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
                    <label className="fw-semibold">Stars</label>
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
        </>
      )}
      {isClassActivity && (
        <>
          <h3>Class Activity</h3>
          <div className="whitebox">
            {hw && (
              <div className="dayflexsec">
                {DAY_SLOTS.filter((slot) => slot !== "H.W").map((slot) => {
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
                                    {t.title}
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
                                <>
                                  <div key={i} className={t.name && "theme-block"}>
                                    {t.name && (
                                      <p>
                                        <strong>Theme:</strong> {t.name}
                                      </p>
                                    )}
                                    {t.numbers.length > 0 && (
                                      <p>
                                        <strong>Page no.:</strong>{" "}
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
                                </>
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
            )}
          </div>
        </>
      )}

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
