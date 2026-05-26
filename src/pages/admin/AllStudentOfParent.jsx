import React, { useEffect, useMemo, useState } from 'react'
import { useFetchAllStudents, useGetAllAdmittedStudentWithUserId, useGetNonAdmittedCandidateWithUserId } from '../../services/admission.services'
import { useLocation, useNavigate } from 'react-router-dom'
import { getImageUrl } from '../../utills/constants';
import { Button, Card } from 'react-bootstrap';
// import { formatDate } from 'react-datepicker/dist/dist/date_utils.js';
import { getFullName } from '../../utils';
import { Eye, Plus } from 'lucide-react';


const filterAdmittedAndPendingStudent = (students = []) => {
    const admittedStudent = students.filter(s => s?.studentId);
    const pendingAdmission = students.filter(
        s => !s?.studentId && s?.candidateId
    );

    return { admittedStudent, pendingAdmission };
};
const AllStudentOfParent = () => {
    const { state } = useLocation();
    const navigate = useNavigate()
    const userId = state?.userId ?? null;

  // const { data: students = [], isLoading } = useFetchAllStudents(userId)
  const { data: admittedStudent , isLoading: admittedStudentLoading } = useGetAllAdmittedStudentWithUserId(userId)
  const { data: pendingAdmission , isLoading: pendingAdmissionLoading } = useGetNonAdmittedCandidateWithUserId(userId)

  // console.log("students from AllStudentPaent", students);
  const [activeTab, setActiveTab] = useState("admitted");
  // const { admittedStudent = [], pendingAdmission = [] } = useMemo(
  //   () => filterAdmittedAndPendingStudent(students),
  //   [students]
  // );
  // const studentsData = activeTab === "admitted" ? admittedStudent : pendingAdmission;
  // console.log("admittedStudent", admittedStudent)
  // console.log("pendingAdmission", pendingAdmission)
const studentsData =activeTab === "admitted"? admittedStudent ?? []: pendingAdmission ?? [];




  const handleCardClick = (student) => {
    // console.log("student from cardclick", student)
    if (student?.studentId) {
      navigate(`/admin/profile?studentId=${student.studentId}`)
    } else if (student?.candidateId) {

      localStorage.setItem("candidateId", student?.candidateId)
      localStorage.removeItem("studentId")
      navigate("/admin/admission-form?mode=edit", { state: { candidateId: student?.candidateId, userId } })
    }
  };
  const startNewAdmission = () => {
    localStorage.removeItem("candidateId");
    localStorage.removeItem("studentId");
    localStorage.removeItem("appUserId")

    navigate("/admin/admission-form?mode=new",{ state: {  userId } });
  };

  if (admittedStudentLoading || pendingAdmissionLoading) {
  return (
    <div className="text-center mt-4">
      Loading students...
    </div>
  );
}





  return (
    <div className='mainpro'>
      <div className=" container ">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">

          {/* Tabs Section */}
          {pendingAdmission?.length !== 0 && <div className="tabs">
            <button className={`tab ${activeTab === "admitted" ? "activeTab" : ""}`} onClick={() => setActiveTab("admitted")}>Admitted Students</button>
            {pendingAdmission?.length !== 0 && <button className={`tab ${activeTab === "nonAdmitted" ? "activeTab" : ""}`} onClick={() => setActiveTab("nonAdmitted")}>Non-Admitted Students</button>}
          </div>}

  {/* Admit Button */}
  <button
    type="button"
    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
    onClick={startNewAdmission}
  >
    <Plus size={16} />
    Admit another student
  </button>
</div>



                {(activeTab === "admitted" || activeTab === "nonAdmitted") && (
                    studentsData?.length > 0 ? (
                        <div className="dashboard-grid">

                            <ul>
  {/* STUDENT CARDS */}
  {studentsData.map((student, i) => {
    const photoDoc = student?.documentInfos?.find(
      docs =>
        docs?.ownerType === "CANDIDATE" &&
        docs?.documentType?.documentName === "PHOTO"
    );

                  const photoPath = photoDoc?.storagePath;
                  const imageSrc = photoPath? getImageUrl(photoPath): "/images/icon/profile.png";


                  return (
                    <li
                      key={student?.id ?? i}
                      onClick={() => handleCardClick(student)}
                    >
                      <Card className="dashboard-card">
                        <Card.Body className="cardbody">
                          <div className="icon-wrapper mb-2">
                            <img
                              src={imageSrc}
                              alt="studentImage"
                              className="dashboard-icon"
                              style={{ objectFit: "contain", maxHeight: "100%" }}
                            />
                          </div>
                          <p className="fw-semibold mb-0">
                            {student?.fullName}
                          </p>
                        </Card.Body>
                      </Card>
                    </li>
                  );
                })}

                {/* CREATE CARD — ONLY ONE, AT LAST */}
                {/* {activeTab === "nonAdmitted" && (
                  <li key="create-card" onClick={startNewAdmission}>
                    <Card className="dashboard-card">
                      <Card.Body className="cardbody ">
                        <div className="icon-wrapper mb-2">
                          <Plus size={36} className="create-icon" />
                        </div>
                        <p className="fw-semibold mb-0">
                          Admit another student
                        </p>
                      </Card.Body>
                    </Card>
                  </li>
                )} */}
              </ul>

            </div>
          ) : (
            <div className="box">
              <h5 className="fw-semibold mb-2">Apply for Admission</h5>
              <p>
                You haven’t applied for any admission yet. Start by submitting your
                first application.
              </p>
              <Button size="lg" className="saveBtn" onClick={startNewAdmission}>
                Apply Now
              </Button>
            </div>
          )
        )}



            </div>


        </div>
    )
}

export default AllStudentOfParent
