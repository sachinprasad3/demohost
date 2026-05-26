import React, { useState } from 'react'
import useAdmissionFormContext from '../../hooks/useAdmissionFormContext'
import FileUpload from './customField/FileUpload';
import { useNotification } from '../../context/NotificationContext';

const Step3DocumentUpload = React.memo(({ errors, loading, clearFieldError }) => {
  const { Step5DocumentUpload, formData, updateStudentDocuments, studentDocuments } = useAdmissionFormContext()
  const isFather = formData?.contacts?.find((con) => con.contactRelationshipCode === "FATHER");
  const isMother = formData?.contacts?.find((con) => con.contactRelationshipCode === "MOTHER");
  const isGuardian = formData?.contacts?.find((con) => con.contactRelationshipCode === "GUARDIAN");
  const [uploadStatus, setUploadStatus] = useState({});
  const { showNotification } = useNotification();

  // console.log("student document",studentDocuments)
  const MIN_SIZE = 20 * 1024;
  const MAX_SIZE = 100 * 1024;
  const handleFileUpload = (e, fieldName, ownerRelation) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png"];

  if (!allowedTypes.includes(file.type)) {
    showNotification({
      message: "Only JPG, JPEG, and PNG images are allowed.",
      type: "warning",
      duration: 2000,
    });

    e.target.value = "";
    return;
  }

  if (file.size < MIN_SIZE || file.size > MAX_SIZE) {
    clearFieldError(fieldName);

    showNotification({
      message: "File size must be between 20 KB and 100 KB",
      type: "error",
      duration: 2000,
    });

    setUploadStatus(prev => ({
      ...prev,
      [fieldName]: {
        progress: 0,
        status: "error",
        message: "File size must be between 20 KB and 100 KB",
      },
    }));

    e.target.value = "";
    return;
  }

  updateStudentDocuments(ownerRelation, fieldName, file);
  clearFieldError(fieldName);

  setUploadStatus(prev => ({
    ...prev,
    [fieldName]: { progress: 0, status: "uploading" },
  }));

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;

    setUploadStatus(prev => ({
      ...prev,
      [fieldName]: {
        progress,
        status: progress >= 100 ? "uploaded" : "uploading",
      },
    }));

    if (progress >= 100) clearInterval(interval);
  }, 200);
};


  return (
    <section className='whitebox'> 
      <div className="formbox stapform">
        <p className="text-sm text-gray-600 mb-2">
        <strong>Note:</strong> Document size should be between <strong>20 KB and 100 KB</strong>.
        </p> 
        <ul>

        {/* Child Photo */}
        <li className="fullsec"> 
        <FileUpload
        name="childPhoto"
        label="Child Photo"
        file={studentDocuments.childPhoto}
        uploadStatus={uploadStatus.childPhoto}
        error={errors.childPhoto}
        onChange={(e) => handleFileUpload(e, "childPhoto", "CANDIDATE")}
        /> 
        </li>

        {/* Child Aadhar */}
        <li className="fullsec">
        <FileUpload
          name="childAadhar"
          label="Child Aadhar"
          file={studentDocuments.childAadhar}
          uploadStatus={uploadStatus.childAadhar}
          error={errors.childAadhar}
          onChange={(file) => handleFileUpload(file, "childAadhar", "CANDIDATE")}
        />
        </li>

        {/* Child DOB Certificate */}
        <li className="fullsec">
        <FileUpload
          name="childDobCertificate"
          label="Child Dob Certificate"
          file={studentDocuments.childDobCertificate}
          uploadStatus={uploadStatus.childDobCertificate}
          error={errors.childDobCertificate}
          onChange={(file) => handleFileUpload(file, "childDobCertificate", "CANDIDATE")}
        />
        </li>

        {/* Father Photo */}
        {/* {isFather && ( */}
        <li className="fullsec">
          <FileUpload
            name="fatherPhoto"
            label="Father Photo"
            file={studentDocuments.fatherPhoto}
            uploadStatus={uploadStatus.fatherPhoto}
            error={errors.fatherPhoto}
            onChange={(file) => handleFileUpload(file, "fatherPhoto", "FATHER")}
          />
        </li>
        {/* )} */}

        {/* Mother Photo */}
        {/* {isMother && ( */}
        <li className="fullsec">
          <FileUpload
            name="motherPhoto"
            label="Mother Photo"
            file={studentDocuments.motherPhoto}
            uploadStatus={uploadStatus.motherPhoto}
            error={errors.motherPhoto}
            onChange={(file) => handleFileUpload(file, "motherPhoto", "MOTHER")}
          />
        </li>
        {/* )} */}

        {/* Guardian Photo */}
        {/* {isGuardian && ( */}
        <li className="fullsec">
          <FileUpload
            name="guardianPhoto"
            label="Guardian Photo"
            file={studentDocuments.guardianPhoto}
            uploadStatus={uploadStatus.guardianPhoto}
            error={errors.guardianPhoto}
            onChange={(file) => handleFileUpload(file, "guardianPhoto", "GUARDIAN")}
          />
        </li>
        {/* )} */}

        </ul>

      </div>
    </section>
  )
})

export default Step3DocumentUpload
