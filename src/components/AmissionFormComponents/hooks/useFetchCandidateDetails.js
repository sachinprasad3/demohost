

import { useCallback } from "react";
import axiosInstance from "../../../utills/axiosInstance";
import useAdmissionFormContext from "../../../hooks/useAdmissionFormContext";

import {
  mapGetDocumentsToState,
  parseLanguagesFromApi,
  parseSiblingsFromApi,
} from "./AdmissionHeleperFunction";

export default function useFetchCandidateDetails() {
  const {
    setFormData,
    setStudentDocuments,
    setLanguages,
    setSiblings,
    setHasSibling,
    // SetFamilyDetails,
  } = useAdmissionFormContext();

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
  console.log("res from fetchCandidateDetails",res)

        if (res.status !== 200 || !res.data) return;

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

  return { fetchCandidateDetails };
}
