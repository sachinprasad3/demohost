import { createContext, useCallback, useEffect } from "react";

export const AdmissionFormContext = createContext();

import { useState } from "react";

import axiosInstance from "../utills/axiosInstance";

import { getAcademicYear } from "../utills/constants"


import { buildLanguageFields, buildSiblingFields, mapGetDocumentsToState, parseLanguagesFromApi, parseSiblingsFromApi } from "../components/AmissionFormComponents/hooks/AdmissionHeleperFunction";

import { useAuth } from "./AuthContext";
import { useLocation } from "react-router-dom";
export default function AdmissionFormProvider({ children }) {
  const [admissionMode, setAdmissionMode] = useState("NEW");

  const [studentDocuments, setStudentDocuments] = useState([]);
  const academicYear = getAcademicYear()
  const [hasSibling, setHasSibling] = useState(false);
  const { user } = useAuth()
  const [candidateId, setCandidateId] = useState(null);
  const [formData, setFormData] = useState({});
  const [feePlanID, setFeePlanId] = useState([]);
  const [pickUpLocation, setPickUpLocation] = useState([]);
  const [AdmissionContextLoading, setAdmissionContextLoading] = useState(false);

  const [siblings, setSiblings] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [studentId, setStudentId] = useState(null)
const [userId, setUserId] = useState(null);
const location = useLocation();

const navigatedUserId = location.state?.userId;
console.log("naviagteduserid",navigatedUserId)
useEffect(() => {
  if (navigatedUserId) {
    setUserId(navigatedUserId);
    localStorage.setItem("appUserId", navigatedUserId);
    return;
  }

  const stored = localStorage.getItem("appUserId");
  if (stored) setUserId(stored);
}, [navigatedUserId]);




  const fetchCandidateDetails = useCallback(
    async ({ studentId, candidateId }) => {
      if (!studentId && !candidateId) return;

      try {
        const res = studentId
          ? await axiosInstance.get(
            `/api/students/data?studentId=${studentId}`
          )
          : await axiosInstance.get(
            `/api/admissions/fulldetails?candidateId=${candidateId}`
          );

        if (res.status !== 200 || !res.data) return;
        console.log("res from fetchcandidate", res)
        const data = res.data;
        const contacts = data.contacts || [];

        /* ---------- Documents ---------- */
        setStudentDocuments(
          mapGetDocumentsToState(data?.appDocDto)
        );

        /* ---------- Primary Contact ---------- */
        const primaryContactAcademic =
          contacts.find(c => c.primaryContactAcademic === "Y")
            ?.contactRelationshipCode || "";

        const selectedRelations = contacts.reduce((acc, c) => {
          if (c?.contactRelationshipCode) {
            acc[c.contactRelationshipCode] = true;
          }
          return acc;
        }, {});

        /* ---------- Transport ---------- */
        const transportFacility = data?.pickupLocationId
          ? "true"
          : "false";

        /* ---------- Main Form ---------- */
        setFormData(prev => ({
          ...prev,
          ...data,
          selectedRelations,
          primaryContactAcademic,
          transportFacility,
        }));

        /* ---------- Siblings ---------- */
        const parsedSiblings = parseSiblingsFromApi(data);
        setHasSibling(parsedSiblings.length > 0);
        setSiblings(parsedSiblings);

        /* ---------- Languages ---------- */
        setLanguages(parseLanguagesFromApi(data));

        /* ---------- Family ---------- */
        // contacts.forEach(contact => {
        //   SetFamilyDetails(
        //     contact.contactRelationshipCode,
        //     contact
        //   );
        // });
      } catch (error) {
        console.error("Fetch admission details error:", error);
      }
    },
    [
      setFormData,
      setStudentDocuments,
      setLanguages,
      setSiblings,
      setHasSibling,
      // SetFamilyDetails,
    ]
  );



  const updateFormData = useCallback((name, value) => {
    setFormData((prev) => {
      // transport rule
      if (name === "transportFacility") {


        return {
          ...prev,
          transportFacility: value,
          pickupLocationId: "",
          feePlanId: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  }, []);


  // useEffect(() => {
  //   if (user?.role !== "PARENT") return;

  //   const storedCandidateId = localStorage.getItem("candidateId");

  //   if (storedCandidateId) {
  //     setCandidateId(storedCandidateId);
  //     fetchCandidateDetails({ candidateId: storedCandidateId });
  //   } else {
  //     setCandidateId(null);
  //     setFormData({});
  //   }
  // }, [user?.role, fetchCandidateDetails]);


  useEffect(() => {
    if (user?.role !== "ADMIN" && user?.role !== "OWNER") return;


    const storedStudentId = localStorage.getItem("studentId");
    const storedCandidateId = localStorage.getItem("candidateId");

    if (storedStudentId) {
      setStudentId(storedStudentId);
      fetchCandidateDetails({ studentId: storedStudentId });
    } else if (storedCandidateId) {
      setCandidateId(storedCandidateId);
      fetchCandidateDetails({ candidateId: storedCandidateId });
    } else {
      setStudentId(null);
      setCandidateId(null);
      setFormData({});
    }
  }, [fetchCandidateDetails, user?.role]);

  const getAdmissionAddressId = (relationShipCode) => {

    const contact = formData.contacts?.find(
      (cont) => cont.contactRelationshipCode === relationShipCode
    );

    return contact?.admissionAddressId || null;
  };
  
  const saveCurrentStep = async () => {
    const languageFields = buildLanguageFields(languages);
    const siblingFields = buildSiblingFields(siblings);
    const finalFormData = {
      ...formData,
      ...languageFields,
      ...siblingFields,
       appUserId:userId

    };

    try {
      const fd = new FormData();
      const admission = {};
      for (const key in finalFormData) {
        if (key !== "fatherPhoto" && key !== "motherPhoto" && key !== "childPhoto") {
          admission[key] = finalFormData[key];
        }
      }
      if (candidateId) {
        admission.candidateId = Number(candidateId);
      }
      fd.append(
        "admission",
        new Blob([JSON.stringify(admission)], { type: "application/json" })
      );
      setAdmissionContextLoading(true);
      //  Send request
      const res = await axiosInstance.post("api/admissions", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (!candidateId && res.data?.data?.candidateId) {
        localStorage.setItem("candidateId", res.data.data.candidateId);
        setCandidateId(res.data.data.candidateId);
      }
      return { success: true, data: res.data };
    } catch (err) {
      console.error("Save Error:", err);
      return { success: false };
    } finally {
      setAdmissionContextLoading(false);
    }
  };
  const updateStudentDocuments = (ownerRelation, fieldDocumentName, file) => {
    let ownerId;
    let documentCode;
    let documentName;
    //  Resolve ownerId
    if (ownerRelation === "CANDIDATE") {
      ownerId = Number(formData?.candidateId);
    } else if (ownerRelation === "FATHER") {
      ownerId = Number(formData?.candidateId);
    } else if (ownerRelation === "MOTHER") {
      ownerId = Number(formData?.candidateId);
    } else if (ownerRelation === "GUARDIAN") {
      ownerId = Number(formData?.candidateId);
    }
    if (!ownerId) {
      console.warn("OwnerId not found for:", ownerRelation);
      return;
    }
    //  Resolve documentCode
    if (typeof fieldDocumentName === "string" && fieldDocumentName.endsWith("Photo")) {
      documentCode = 1;
      documentName = "PHOTO"
    } else if (typeof fieldDocumentName === "string" && fieldDocumentName.endsWith("Aadhar")) {
      documentCode = 5;
      documentName = "AADHAAR"

    } else if (typeof fieldDocumentName === "string" && fieldDocumentName.endsWith("DobCertificate")) {
      documentCode = 2;
      documentName = "DOB_CERTIFICATE"

    } else {
      console.warn("Unknown documentName:", documentName);
      return;
    }
    //  SAVE using documentName as KEY
    setStudentDocuments(prev => ({
      ...(prev || {}),
      [fieldDocumentName]: {
        ownerId,
        ownerType: ownerRelation,
        documentName,
        documentCode,
        file,
        academicYear,
        candidateId
      }
    }));
  };
  const uploadDocuments = async () => {
      setAdmissionContextLoading(true);
    try {
      if (!studentDocuments || !Object.keys(studentDocuments).length) {
        return { success: true, skipped: true };
      }

      // ?? Filter only new files
      const newDocs = Object.values(studentDocuments).filter(
        doc => doc.file instanceof File
      );

      //  No new files ? skip API
      if (!newDocs.length) {
        return { success: true, skipped: true };
      }

      const formData = new FormData();

      //  Metadata ONLY for new files
      const metadata = newDocs.map(doc => ({
        ownerId: doc.ownerId,
        ownerType: doc.ownerType,
        documentCode: doc.documentCode,
        documentName: doc.documentName,
        academicYear: doc.academicYear,
        candidateId: doc.candidateId,
        documentStage: "ADMISSION_STAGE"
      }));

      formData.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], {
          type: "application/json"
        })
      );

      //  Append ONLY new files
      newDocs.forEach(doc => {
        formData.append("files", doc.file);
      });
      //  DEBUG
      // for (let [key, value] of formData.entries()) {
      // }
//       for (let [key, value] of formData.entries()) {
//   console.log("KEY:", key);

//   if (value instanceof File) {
//     console.log("FILE:", {
//       name: value.name,
//       type: value.type,
//       size: value.size
//     });
//   } else if (value instanceof Blob) {
//     value.text().then(text => {
//       console.log("BLOB (metadata):", text);
//     });
//   } else {
//     console.log("VALUE:", value);
//   }
// }

      const res = await axiosInstance.post(
        "/api/admissions/upload",
        formData
      );

      return { success: true, data: res.data };
    } catch (error) {
      console.error("Upload failed:", error);
      return { success: false };
    }finally{
      setAdmissionContextLoading(false);

    }
  };




  const fetchFeePlanId = useCallback(async (joiningDate) => {
    // Guard: allow ADMIN + studentId even if joiningDate param is missing
  const isAdminOrOwner =
      user?.role === "ADMIN" || user?.role === "OWNER";
   if (!joiningDate && !(isAdminOrOwner && studentId)) return;

    try {
      const reqJoiningDate =
        user?.role === "ADMIN" || user?.role === "OWNER" && studentId
          ? formData?.joiningDate
          : joiningDate;

      let res;

      if (studentId) {
        res = await axiosInstance.get(
          `/api/fee-plans/estimates?studentId=${studentId}&joiningDate=${reqJoiningDate}`
        );
      } else {
        res = await axiosInstance.get(
          `/api/fee-plans/estimates?candidateId=${candidateId}&joiningDate=${reqJoiningDate}`
        );
      }

      // console.log("fee-plans", res);

      if (res?.status === 200) {
        setFeePlanId(Array.isArray(res.data?.data) ? res.data.data : []);
      }
    } catch (error) {
      console.error("Error in fetching fee plan id", error);
    }
  }, [candidateId, studentId, formData?.joiningDate, user?.role]);

  useEffect(() => {
    if (formData.joiningDate) {
      fetchFeePlanId(formData.joiningDate)
    }
  }, [formData.joiningDate, fetchFeePlanId])

  return (
    <AdmissionFormContext.Provider
      value={{
        formData,
        // SetFamilyDetails,
        setHasSibling,
        hasSibling,
        updateFormData,
        updateStudentDocuments,
        fetchCandidateDetails,
        setStudentDocuments,
        saveCurrentStep,
        candidateId,
        setCandidateId,
        // saveFamilyDetails,
        feePlanID,
        pickUpLocation,
        AdmissionContextLoading,
        admissionMode,
        uploadDocuments,
        setLanguages,
        setSiblings,
        languages,
        siblings,
        setFormData,
        setStudentId,
        studentId,
        // admissionContextErrors,
        studentDocuments

      }}
    >
      {children}
    </AdmissionFormContext.Provider>
  );
}

