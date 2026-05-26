import { useLocation } from "react-router-dom";
import {  useGetHomeworkById } from "../../../services/homework.services";
import { HomeworkViewSkeleton } from "../../../components/homework/HomeworkSkeleton";
import FileViewer from "../../../components/FileViewer";
import { useState } from "react";
import { DownloadIcon } from "lucide-react";

export const checkIsImage = (fileType) => {
  const imageType = ["jpg", "jpeg", "png"];

  return imageType.includes(fileType.toLowerCase());
};

function getMinType(url){
  if(url.toLowerCase().includes(".pdf")) return "application/pdf"

  return null
}

async function getBase64AndMime(url) {
  const res = await fetch(url);
  const blob = await res.blob();

  const base64Data = await new Promise((resolve) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result.split(",")[1]);
    r.readAsDataURL(blob);
  });

  return {
    mimeType: getMinType(url) || blob.type,
    base64Data,
  };
}

export const downloadFile = async (file) => {
  if (window.AndroidDownloader) {
    const { base64Data, mimeType } = await getBase64AndMime(file.filePath);

    window.AndroidDownloader.downloadFile(base64Data, file.fileName, mimeType);
  } else {
    const link = document.createElement("a");
    link.href = file.filePath; // your file path
    link.download = ""; // force download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const HomeworkView = () => {
  const location = useLocation();
  const {id: hwId} = location.state;
  const [selectedFile, setSelectedFile] = useState(null);

  const { data: hw, isLoading, error } = useGetHomeworkById(hwId);

  if (isLoading) {
    return <HomeworkViewSkeleton />;
  }

  if (error) {
    return <div className="container">{error.message}</div>;
  }

  const handleCloseFileViewer = () => {
    setSelectedFile(null);
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
              <label className="fw-semibold">Term</label>
              <div>{hw?.termName}</div>
            </li>

            <li>
              <label className="fw-semibold">Syllabus</label>
              <div>{hw?.syllabusName}</div>
            </li>

            <li>
              <label className="fw-semibold">Subject</label>
              <div>{hw?.subjectName}</div>
            </li>

            <li>
              <label className="fw-semibold">Topic</label>
              <div>{hw?.topicName}</div>
            </li>

            <li>
              <label className="fw-semibold">Activity</label>
              <div>{hw?.activityTitle || "-"}</div>
            </li>

            <li>
              <label className="fw-semibold">Teacher</label>
              <div>{hw?.teacherFullName}</div>
            </li>
          </ul>
        </div>
      </div>

      {/* ================= HOMEWORK INFO ================= */}
      <div className="whitebox">
        <h3>Homework Information</h3>

        <div className="formbox searchsec">
          <ul>
            <li>
              <label className="fw-semibold">Homework Title</label>
              <div>{hw?.homeworkTitle}</div>
            </li>

            <li>
              <label className="fw-semibold">Total Marks</label>
              <div>{hw?.totalMarks}</div>
            </li>
          </ul>
        </div>

        <label className="fw-semibold mt-2">Description</label>
        <div className="border rounded p-2 bg-light">
          {hw?.description || "-"}
        </div>
      </div>

      {/* ================= VISIBILITY & STATUS ================= */}
      <div className="whitebox">
        <h3>Visibility & Status</h3>

        <div className="formbox searchsec">
          <ul>
            <li>
              <label className="fw-semibold">Documents Attached</label>
              <div>{hw?.documentsAttached === "Y" ? "Yes" : "No"}</div>
            </li>

            <li>
              <label className="fw-semibold">Visible to Parents</label>
              <div>{hw?.visibleToParents === "Y" ? "Yes" : "No"}</div>
            </li>

            <li>
              <label className="fw-semibold">Status</label>
              <span className="badge bg-success ms-2">
                {hw?.homeworkStatus}
              </span>
            </li>

            <li>
              <label className="fw-semibold">Created At</label>
              <div>{new Date(hw?.createdAt).toLocaleString()}</div>
            </li>
          </ul>
        </div>
      </div>

      {/* ================= ATTACHMENTS ================= */}
      <div className="whitebox">
        <h3>Attachments</h3>

        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "5%" }}>Sl.</th>
                <th>File Name</th>
                <th style={{ width: "20%" }}>Caption</th>
                <th style={{ width: "25%" }}>Description</th>
                <th style={{ width: "10%" }} className="text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {hw?.attachments.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-3">
                    No attachments available
                  </td>
                </tr>
              )}

              {hw?.attachments.map((file, index) => (
                <tr key={file.attachmentId}>
                  <td>{index + 1}</td>
                  <td className="fw-semibold">{file.fileName}</td>
                  <td>{file.caption || "-"}</td>
                  <td>{file.description || "-"}</td>
                  {checkIsImage(file.fileType) ? (
                    <td className="text-center">
                      <button onClick={() => setSelectedFile(file)}>
                        View
                      </button>
                    </td>
                  ) : (
                    <td className="text-center">
                      <button onClick={() => downloadFile(file)}>
                        <DownloadIcon />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

export default HomeworkView;
