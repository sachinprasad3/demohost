

import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../utills/axiosInstance";
import { useGetAllAdmittedStudentWithUserId } from "../services/admission.services";

const useStudentCandidateIds = (userId) => {
  const [candidateIdInfos, setCandidateIdInfos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
// const {data} = useGetAllAdmittedStudentWithUserId(userId)
  const fetchCandidateIds = useCallback(async () => {
    if (!userId) return [];

    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(`/api/v1/user/all/student-id/candidate-id`,
        { params: { userId } }
      );
// console.log("res fetch all candidateidinfo",res)
      const newData = res.data?.data ? [...res.data.data] : [];
      setCandidateIdInfos(newData); // triggers StudentProvider useEffect
      return newData; // return for immediate use
    } catch (err) {
      console.error("Failed to fetch candidate IDs", err);
      setError(err);
      setCandidateIdInfos([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch automatically when userId changes
  useEffect(() => {
    if (userId) fetchCandidateIds();
  }, [fetchCandidateIds, userId]);

  return {
    candidateIdInfos,
    loading,
    error,
    refetch: fetchCandidateIds, // can be awaited
  };
};

export default useStudentCandidateIds;
