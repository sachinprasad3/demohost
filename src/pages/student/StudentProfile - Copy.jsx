import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";
import { useStudent } from "../../context/StudentContext";
import axiosInstance from "../../utills/axiosInstance";
import { useNotification } from "../../context/NotificationContext";
import { extractStudentDetails } from "../../utills/constants";
import { useSearchParams } from "react-router-dom";
import useClassSection from "../../hooks/useClassSection";


export default function StudentProfile() { 
  const [error, setError] = useState(null);
  const [studentDetails, setStudentDetails] = useState([]);
const {getClassNameById} = useClassSection()
  // ? HOOK MUST COME FIRST
  const [searchParams] = useSearchParams();
  const { activeStudent } = useStudent();
  const { showNotification } = useNotification();

  // ? NOW it is safe to read query params
  const studentIdFromQuery = searchParams.get("studentId");
  const candidateIdFromQuery = searchParams.get("candidateId");

  const studentId   = studentIdFromQuery ?? activeStudent?.studentId;
  const candidateId = candidateIdFromQuery ?? activeStudent?.candidateId;



useEffect(() => {
  const fetchStudetDetails = async () => {
    if (!studentId) return;
  
    try {
      const res = await axiosInstance.get(
        `/api/students/data?studentId=${studentId}`
      );
  
      const rawDataMap = res?.data;
  
      if (!rawDataMap || Object.keys(rawDataMap).length === 0) {
        setError("No student data found");
        return;
      }
  
      // ? KEY FIX
      // const responseData = Object.values(rawDataMap)[0];
  
      const extractedResponse = extractStudentDetails(rawDataMap);
      setStudentDetails(extractedResponse);
      // console.log("extractedResponse from fetchStudentDetails",extractedResponse)
  
    } catch (err) {
      console.error("error in fetching studentDetails", err);
      showNotification({
        message:
          err?.response?.data?.message ||
          err?.message ||
          "failed to fetch student details",
        type: "error",
        duration: 2000,
      });
    }
  };
  
  
  // Load student ID from localStorage
  
    fetchStudetDetails()
  }, [studentId]);

 const showFatherDetails =Object.values(studentDetails?.fatherDetails || {}).some( v => v !== null && v !== undefined && v !== "" && v !== "Y" && v !== "N");
 const showMotherDetails = Object.values(studentDetails?.motherDetails || {}).some( v => v !== null && v !== undefined && v !== "" && v !== "Y" && v !== "N");
 const showGuardianDetails = Object.values(studentDetails?.guardianDetails || {}).some( v => v !== null && v !== undefined && v !== "" && v !== "Y" && v !== "N");

  
  if (error)
    return (
      <div className="container py-4 text-center">
        <h5 className="text-danger">Error</h5>
        <p className="text-muted">{error}</p>
      </div>
    );
  if (!studentDetails)
    return (
      <div className="container py-4 text-center">
        <h5 className="text-danger">No student data found.</h5>
        {/* <p>Please log in again.</p> */}
      </div>
    );
const InfoRow = ({ label, value }) => {
  if (value === null || value === undefined || value === "") return null;
// console.log("value",value,"label",label)
  return (
    <div>
      <strong>{label}:</strong> {value}
    </div>
  );
};
 

  return (
 
<div className="mainpro">
  <div className="container">

    {/* TOP CARD */}
    <div className="whitebox">
      <div className="card-body text-center pb-2">
        <div className="proimg">
          <img
            src={studentDetails?.personalDetails?.studentImage || "/images/defaultuser.jpg"}
            alt= {studentDetails?.personalDetails?.StudentName} 
          />
        </div>

        <h6 className="fw-semibold mb-0">
        {studentDetails?.personalDetails?.studentName} 
        </h6>

        <small className="text-muted d-block mb-1">
          Class: {getClassNameById(studentDetails?.personalDetails?.classId)}
        </small>
        <small className="text-muted d-block mb-1">
          Roll No.: {studentDetails?.personalDetails?.rollNumber}
        </small>

        <small className="text-muted">
          Admission No: {studentDetails?.personalDetails?.admissionRegistrationNo}
        </small>
      </div>
    </div>

    <div className="mt-3 formbox profileview">

      {/* PERSONAL DETAILS */}
      <div className="col-md-4">
        <div className="whitebox">
          <h4>Personal Details</h4>
          <div className="row">
            <InfoRow label="Gender" value={studentDetails?.personalDetails?.gender} />
            <InfoRow label="DOB" value={studentDetails?.personalDetails?.dateOfBirth} />
            <InfoRow label="Place of Birth" value={studentDetails?.placeOfBirth} />
            <InfoRow label="Blood Group" value={studentDetails?.personalDetails?.bloodGroup} />
            <InfoRow label="Height" value={studentDetails?.personalDetails?.heightInInches} />
            <InfoRow label="Weight" value={studentDetails?.personalDetails?.weightInKg} />
            <InfoRow label="Nationality" value={studentDetails?.personalDetails?.nationality} />
            <InfoRow label="Religion" value={studentDetails?.personalDetails?.religion} />
            <InfoRow label="Home Language" value={studentDetails?.homeLanguage} />
            <InfoRow label="Section Name" value={studentDetails?.personalDetails?.sectionName} />
            <InfoRow label=" Admission No" value={studentDetails?.personalDetails?.homeLanguage} />
              <InfoRow label=" Joining Date" value={studentDetails?.personalDetails?.joiningDate} />
              <InfoRow label=" Primary Contact Details" value={studentDetails?.personalDetails?.primaryContact} />
              {/* <InfoRow label=" Fee Payer" value={studentDetails?.personalDetails?.feePayer} /> */}
              <InfoRow label=" Emergency Contact" value={studentDetails?.personalDetails?.emergencyContact} />




          </div>
        </div>
      </div>

      {/* CONTACT DETAILS */}
      <div className="col-md-4">
        {/* <div className="whitebox">
          <h4>Contact Details</h4>
          <div className="row">
            <InfoRow label="Student Mobile" value={studentDetails?.mobile} />
            <InfoRow label="Email" value={studentDetails?.email} />
            <InfoRow label="Home Address" value={studentDetails?.homeAddress} />
            <InfoRow label="Current Address" value={studentDetails?.address} />
          </div>
        </div> */}

        {/* FATHER DETAILS */}
        {showFatherDetails && <div className="whitebox">
          <div >
          <h4 className="d-inline-block">Father Details</h4>
          {studentDetails?.personalDetails?.feePayer === "FATHER" && <span className="text-green font fs-6 fw-bold m-3">(Fee Payer)</span>}
          </div>
          <div className="row">
            <InfoRow label="Name" value={studentDetails?.fatherDetails?.contactName} />
            <InfoRow label="Email" value={studentDetails?.fatherDetails?.contactEmail} />
            <InfoRow label="Occupation" value={studentDetails?.fatherDetails?.contactOccupation} />
            <InfoRow label="Contact" value={studentDetails?.fatherDetails?.phonePrimary} />
            <InfoRow label="Address" value={studentDetails?.fatherDetails?.addressLine1} />
            <InfoRow label="State" value={studentDetails?.fatherDetails?.state} />
            <InfoRow label="City" value={studentDetails?.fatherDetails?.city} />
            <InfoRow label="Pincode" value={studentDetails?.fatherDetails?.pinCode} />


          </div>
        </div>}
      </div>

      {/* MOTHER + EMERGENCY */}
      <div className="col-md-4">

        {showMotherDetails && <div className="whitebox">
          <h4 className="d-inline-block">Mother Details</h4>
          {studentDetails?.personalDetails?.feePayer === "MOTHER" && <span className="text-green font fs-6 fw-bold m-3">(Fee Payer)</span>}

          <div className="row">
             <InfoRow label="Name" value={studentDetails?.motherDetails?.contactName} />
            <InfoRow label="Email" value={studentDetails?.motherDetails?.contactEmail} />
            <InfoRow label="Occupation" value={studentDetails?.motherDetails?.contactOccupation} />
            <InfoRow label="Contact" value={studentDetails?.motherDetails?.phonePrimary} />
            <InfoRow label="Address" value={studentDetails?.motherDetails?.addressLine1} />
            <InfoRow label="State" value={studentDetails?.motherDetails?.state} />
            <InfoRow label="City" value={studentDetails?.motherDetails?.city} />
            <InfoRow label="Pincode" value={studentDetails?.motherDetails?.pinCode} />
          </div>
        </div>}

        {showGuardianDetails && <div className="whitebox">
          <h4 className="d-inline-block">Guardian Details</h4>
          {studentDetails?.personalDetails?.feePayer === "GUARDIAN" && <span className="text-green font fs-6 fw-bold m-3">(Fee Payer)</span>}

          <div className="row">
            <InfoRow label="Name" value={studentDetails?.guardianDetails?.contactName} />
            <InfoRow label="Email" value={studentDetails?.guardianDetails?.contactEmail} />
            <InfoRow label="Occupation" value={studentDetails?.guardianDetails?.contactOccupation} />
            <InfoRow label="Contact" value={studentDetails?.guardianDetails?.phonePrimary} />
            <InfoRow label="Address" value={studentDetails?.guardianDetails?.addressLine1} />
            <InfoRow label="State" value={studentDetails?.guardianDetails?.state} />
            <InfoRow label="City" value={studentDetails?.guardianDetails?.city} />
            <InfoRow label="Pincode" value={studentDetails?.guardianDetails?.pinCode} />
          </div>
        </div>}

        {/* <div className="whitebox">
          <h4>Emergency Contact</h4>
          <div className="row">
            <InfoRow label="Name" value={studentDetails?.emergencyName} />
            <InfoRow label="Phone" value={studentDetails?.emergencyPhone} />
            <InfoRow label="Relation" value={studentDetails?.emergencyRelation} />
          </div>
        </div> */}
      </div>

      {/* MEDICAL DETAILS */}
      {/* <div className="col-md-4">
        <div className="whitebox">
          <h4>Medical Information</h4>
          <div className="row">
            <InfoRow label="Medical Info" value={studentDetails?.medicalInfo} />
            <InfoRow label="Medication" value={studentDetails?.medication} />
          </div>
        </div>
      </div> */}

      {/* PREVIOUS SCHOOL */}
      {/* <div className="col-md-4">
        <div className="whitebox">
          <h4>Previous School</h4>
          <div>
            <InfoRow label="School" value={studentDetails?.previousSchool} />
            <InfoRow label="Admission Date" value={studentDetails?.admissionDate} />
          </div>
        </div>
      </div> */}

      {/* LOGIN DETAILS */}
      {/* <div className="col-md-4">
        <div className="whitebox">
          <h4>Login Details</h4>
          <InfoRow label="Username" value={studentDetails?.username} />
          <InfoRow label="Password" value={studentDetails?.password} />
        </div>
      </div> */}

    </div>
  </div>
</div>

  );
}
