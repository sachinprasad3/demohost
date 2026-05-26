import React, {  useState } from "react";
import "../../css/teacherProfile.css";
import { Mail, Phone, MapPin, BookOpen, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useGetTeacherById, useTeacherAssignedClasses } from "../../services/teacherMaster.services";
import { getInitials } from "../../utills/constants";
import { useTeacher } from "../../context/TeacherProvider";
import { useLocation } from "react-router-dom";
import Popup from "../../components/Popup";

export default function TeacherProfile() {
const location = useLocation()
  const { user } = useAuth();
  const role = user?.role;
  const teacherInfo = user?.teacherInfo || {};
const teacherId = location?.state?.teacherId?location?.state?.teacherId:teacherInfo?.teacherId;
const teacherProviderData = useTeacher();
let teacherProviderLoading = teacherProviderData?.teacherProviderLoading;
const {data: assignedClassesRes = []} = useTeacherAssignedClasses({ teacherId, role });
const assignedClasses = teacherProviderData?.assignedClasses?teacherProviderData?.assignedClasses:assignedClassesRes;
const [showImagePopup, setShowImagePopup] = useState(false);
const [preview, setPreview] = useState(null);
  const { data: teacher = {} } = useGetTeacherById(teacherId)
  // console.log("teacher",assignedClassesRes)
  const classTeacher = assignedClasses?.find((cls) => cls?.assignmentStatus === "Permanent")
  const classString = assignedClasses?.map(cls => cls.className).join(", ");
  const profilePhoto = teacher?.documents?.find((doc) => (doc?.documentName === "TEACHER_PHOTO"))?.storagePath;
  const groupedDocuments = React.useMemo(() => {
    return (teacher?.documents || []).reduce((acc, doc) => {
      const owner = doc.ownerType || "UNKNOWN";
      if(owner === "TEACHER"&& doc?.documentName === "TEACHER_PHOTO") {
        return acc;
      }
      if (!acc[owner]) acc[owner] = [];
      acc[owner].push(doc);

      return acc;
    }, {});
  }, [teacher?.documents]);

  if (teacherProviderLoading) return <div>Loading</div>
  // console.log("Object.entries(groupedDocuments)", groupedDocuments.length)h


  return (
    <div className="container">
      {/* Header */}
      <div className="profile-header">
        <div className="teacherimg ">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={teacher?.fullName || "Teacher"}
              className="img-fluid rounded-circle"
              
            />
          ) : (
            <span className="fw-semibold">
              {getInitials(teacher?.fullName || "")}
            </span>
          )}
        </div>

        <div>
          <h3>{teacher?.fullName}</h3>
          <p>{teacher?.designation}</p>
          {classTeacher?.className?(<p>Class Teacher : {classTeacher?.className}</p>):(user?.role === "ADMIN" && (<h5 className="alert alert-info p-1">Class is not assigned</h5>))}
          {assignedClasses?.length !== 0 && <p>Assigned classes : {classString}</p>}

          {teacher?.staffNo && <span className="emp-id">Employee ID: {teacher?.staffNo}</span>}
        </div>
      </div>

      {/* Details */}
      <div className="profile-card">
        {/* <div className="info-row">
          <BookOpen size={18} />
          <span><strong>Subjects:</strong> {teacher?.subjects?.join(", ")}</span>
        </div> */}

        {/* <div className="info-row">
          <Calendar size={18} />
          <span><strong>Experience:</strong> {teacher?.experience}</span>
        </div> */}
        <div className="info-row">
          <BookOpen size={18} />
          <span><strong>Qualification:</strong> {teacher?.qualification}</span>
        </div>

        <div className="info-row">
          <Mail size={18} />
          <span>{teacher?.email}</span>
        </div>

        <div className="info-row">
          <Phone size={18} />
          <span>{teacher?.phone}</span>
        </div>

        {/* <div className="info-row">
          <MapPin size={18} />
          <span>{teacher.address}</span>
        </div> */}

        <div className="info-row">
          <Calendar size={18} />
          <span><strong>Joining Date:</strong> {teacher.joiningDate}</span>
        </div>
      </div>
      {Object.values(groupedDocuments)?.length !== 0 &&
        // <div className="col-md-4">
          <div className="whitebox mt-3">
            
            {Object.entries(groupedDocuments).map(([ownerType, docs]) => (
              <div key={ownerType} className="formbox documents">
                <h4 >
                  {`${ownerType} Documents`}
                </h4>

                <ul>
                  {docs.map((doc) => (
                    <li key={doc.documentId}>
                      <div>{doc.documentName.replace("_", " ")}</div>
                      <div className="docimg" onClick={(e) => { e.preventDefault(); e.stopPropagation();  setPreview(doc.storagePath); setShowImagePopup(true);}}>
                        <img src={`${doc.storagePath}?v=${Date.now()}`} alt={doc.documentName}  />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        }
        {showImagePopup && (
            <Popup
              title="Image Preview"
              onClose={() => setShowImagePopup(false)}
              closeOnOutsideClick={true}
              overlayClass="image-preview-overlay"
            >
              <div className="image-preview-wrapper">
                <img src={preview} alt="Full Preview" />
              </div>
            </Popup>
          )}
    </div>
  );
}
