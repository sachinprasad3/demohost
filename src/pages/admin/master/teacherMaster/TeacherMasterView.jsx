import { useParams, useNavigate } from "react-router-dom";
import { useGetTeacherById } from "../../../../services/teacherMaster.services";

export default function TeacherMasterView() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { data: teacher, isLoading } = useGetTeacherById(teacherId);

  if (isLoading) return <div className="box">Loading...</div>;
  if (!teacher) return <div className="box">No data found</div>;

  return (
    <div className="container mt-4">
      <div className="box">
        <h2>Teacher Details</h2>

        <table className="table">
          <tbody>
            <tr>
              <th>School ID</th>
              <td>{teacher.schoolId}</td>
            </tr>
            <tr>
              <th>Staff No</th>
              <td>{teacher.staffNo}</td>
            </tr>
            <tr>
              <th>Full Name</th>
              <td>{teacher.fullName}</td>
            </tr>
            <tr>
              <th>Gender</th>
              <td>{teacher.gender}</td>
            </tr>
            <tr>
              <th>Date of Birth</th>
              <td>{teacher.dateOfBirth}</td>
            </tr>
            <tr>
              <th>Staff Type</th>
              <td>{teacher.staffType}</td>
            </tr>
            <tr>
              <th>Designation</th>
              <td>{teacher.designation}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{teacher.phone || "-"}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{teacher.email || "-"}</td>
            </tr>
            <tr>
              <th>Qualification</th>
              <td>{teacher.qualification || "-"}</td>
            </tr>
            <tr>
              <th>Specialization</th>
              <td>{teacher.specialization || "-"}</td>
            </tr>
            <tr>
              <th>Joining Date</th>
              <td>{teacher.joiningDate || "-"}</td>
            </tr>
            <tr>
              <th>Documents Uploaded</th>
              <td>{teacher.documentsUploaded === "Y" ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <th>Document Path</th>
              <td>{teacher.documentStoragePath || "-"}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{teacher.active === "Y" ? "Active" : "Inactive"}</td>
            </tr>
            <tr>
              <th>Effective From</th>
              <td>{teacher.effectiveFrom}</td>
            </tr>
            <tr>
              <th>Effective To</th>
              <td>{teacher.effectiveTo || "-"}</td>
            </tr>
          </tbody>
        </table>

        <button
          className="editBtn"
          onClick={() => navigate(`/teachers/edit/${teacherId}`)}
        >
          Edit
        </button>
        <button className="saveBtn" onClick={() => navigate("/teachers")}>
          Back
        </button>
      </div>
    </div>
  );
}
