import { useCallback, useMemo } from "react";


import useAdmissionFormContext from "../../../hooks/useAdmissionFormContext";
import axiosInstance from "../../../utills/axiosInstance";
import { buildAdmissionPayload, buildContactPayload, buildLanguageFields, buildSiblingFields } from "./AdmissionHeleperFunction";
import useFetchCandidateDetails from "./useFetchCandidateDetails";
import useStep1ContactDetails from "./useStep1ContactDetails";

export default function useUpdateStudentDetailsByAdmin() {
  const {
    formData,
    candidateId,
    studentId,
    languages,
    siblings,
    setCandidateId,
    
    SetFamilyDetails,
    
    academicYear,
    studentDocuments
  } = useAdmissionFormContext();

 

  
  const admissionTarget = useMemo(() => {
    if (studentId) {
      return { mode: "STUDENT", id: studentId };
    }
    return { mode: "CANDIDATE", id: candidateId };
  }, [studentId, candidateId]);

  
  
  const saveCurrentStep = useCallback(async () => {
    try {
      // setAdmissionContextLoading(true);

      const finalFormData = {
        ...formData,
        ...buildLanguageFields(languages),
        ...buildSiblingFields(siblings),
      };

      const fd = new FormData();
      const admission = {};

      for (const key in finalFormData) {
        if (!["fatherPhoto", "motherPhoto", "childPhoto"].includes(key)) {
          admission[key] = finalFormData[key];
        }
      }

      if (admissionTarget.mode === "STUDENT") {
        admission.studentId = admissionTarget.id;
      } else {
        admission.candidateId = admissionTarget.id;
      }

      fd.append(
        "admission",
        new Blob([JSON.stringify(admission)], {
          type: "application/json",
        })
      );

      // const res = await axiosInstance.post(
      //   admissionTarget.mode === "STUDENT"
      //     ? "/api/students/update"
      //     : "/api/admissions",
      //   fd
      // );
      let res
if(admissionTarget.mode === "STUDENT"){
  const admissionPayload = buildAdmissionPayload(finalFormData);
console.log("admission payload",admissionPayload)
   res = await axiosInstance.post("/api/students/update",admissionPayload)

}else{
   res = await axiosInstance.post("/api/admissions",fd)

}
      // if (
      //   admissionTarget.mode === "CANDIDATE" &&
      //   res.data?.data?.candidateId
      // ) {
      //   localStorage.setItem("candidateId", res.data.data.candidateId);
      //   setCandidateId(res.data.data.candidateId);
      // }

      return { success: true };
    } catch (error) {
      console.error("saveCurrentStep error", error);
      return { success: false };
    } finally {
      // setAdmissionContextLoading(false);
    }
  }, [
    formData,
    languages,
    siblings,
    admissionTarget,
    // setAdmissionContextLoading,
    // setCandidateId,
  ]);

  
  const uploadDocuments = useCallback(async () => {
  try {
    if (!studentDocuments || !Object.keys(studentDocuments).length) {
      return { success: true, skipped: true };
    }

    // only NEW files
    const newDocs = Object.values(studentDocuments).filter(
      doc => doc.file instanceof File
    );

    if (!newDocs.length) {
      return { success: true, skipped: true };
    }

    const { mode, id } = admissionTarget;
console.log("id from upload doc",id)
    const formData = new FormData();

    const metadata = newDocs.map(doc => ({
      ownerId: doc.ownerId,
      ownerType: doc.ownerType,
      documentCode: doc.documentCode,
      academicYear: doc.academicYear,
      documentName: doc.documentName,
      documentStage: "ADMISSION_STAGE",
      ...(mode === "STUDENT"
        ? { studentId: id }
        : { candidateId: id }),
    }));

    formData.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      })
    );

    newDocs.forEach(doc => {
      formData.append("files", doc.file);
    });

    const res = await axiosInstance.post( "/api/admissions/upload",formData);

    return { success: true, data: res.data };
  } catch (error) {
    console.error("Upload failed:", error);
    return { success: false, error };
  }
}, [studentDocuments, admissionTarget]);


  /* -------------------------------------------------- */
  return {
    // saveFamilyDetails,
    saveCurrentStep,
    uploadDocuments,
    admissionTarget, 
  };
}
