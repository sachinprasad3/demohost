

import { useEffect, useState } from "react";
import { StudentContext } from "./StudentContext";
import { useAuth } from "./AuthContext";
import axiosInstance from "../utills/axiosInstance";
// import useStudentCandidateIds from "../hooks/useStudentCandidateIds";
import { useGetAllAdmittedStudentWithUserId } from "../services/admission.services";

export const StudentProvider = ({ children }) => {
  const { user } = useAuth();

  const [studentsData, setStudentsData] = useState([]);
  const [allCandidateDetails, setAllCandidateDetails] = useState({});
  const [studentsMap, setStudentsMap] = useState({});
  const [activeCandidateId, setActiveCandidateId] = useState(null);
  // const [loadingCandidates, setLoadingCandidates] = useState(true);
const {data:candidateIdInfos,isLoading: candidateIdsLoading,refetch} = useGetAllAdmittedStudentWithUserId(user?.userId)

  // const { candidateIdInfos, refetch } = useStudentCandidateIds(user?.userId);
const loadingCandidates =candidateIdsLoading ||(candidateIdInfos && Object.keys(studentsMap).length === 0);

  const normalizeStudents = (infos = [], details = {}) =>
    infos.map(c => ({
      candidateId: c.candidateId,
      studentId: c.studentId,
      status: c.studentId ? "ADMITTED" : "IN_PROGRESS",
      studentName: c.fullName,
      // studentImage: c.image,
      studentImage:c.documentInfos.find(d =>d?.ownerType === "CANDIDATE" &&d?.documentType?.documentName === "PHOTO")?.storagePath 

    }));

  /* Fetch all candidates details */
  const fetchAllCandidates = async (infos = []) => {
  if (!infos.length) return {};

 

  try {
    const responses = await Promise.all(
      infos.map(c => {
        if (c?.studentId) {
          return axiosInstance.get(
            `/api/students/data?studentId=${c?.studentId}`
          );
        } else {
          return axiosInstance.get(`/api/admissions/fulldetails?candidateId=${c.candidateId}`);
        }
      })
    );

    const details = responses.reduce((acc, res, idx) => {
      acc[infos[idx].candidateId] = res.data;
      return acc;
    }, {});
// console.log("details from fetchStudentByCandidateIdOrStudentid",details)

    setAllCandidateDetails(details);
    return details;
  } finally {
    // setLoadingCandidates(false);
  }
};

  const propagateCandidates = async (infos = []) => {
    if (!infos.length) {
      setStudentsData([]);
      setAllCandidateDetails({});
      return;
    }
    const candidateDetails = await fetchAllCandidates(infos);
    const normalized = normalizeStudents(infos, candidateDetails);
    setStudentsData(normalized);
    localStorage.setItem("studentsData", JSON.stringify(normalized));
  };

  useEffect(() => {
    if (candidateIdInfos?.length) propagateCandidates(candidateIdInfos);
  }, [candidateIdInfos]);

  
  useEffect(() => {
    if (!studentsData.length || !Object.keys(allCandidateDetails).length) return;
    const storedActiveCandidateId = localStorage.getItem("activeCandidateId")
    const map = {};
    studentsData.forEach(s => {
      map[s.candidateId] = { ...s, data: allCandidateDetails[s.candidateId] };
    });
    // console.log("i am running from all candidate details",allCandidateDetails)
    setStudentsMap(map);
    storedActiveCandidateId?setActiveCandidateId(storedActiveCandidateId):setActiveCandidateId(studentsData[0]?.candidateId);
    // setActiveCandidateId(prev => prev ?? studentsData[0]?.candidateId);
  }, [studentsData, allCandidateDetails]);

  
  useEffect(() => {
    if (!user) {
      setStudentsData([]);
      setAllCandidateDetails({});
      setStudentsMap({});
      setActiveCandidateId(null);
    }
  }, [user]);


  const switchStudent = async (candidateId, studentId) => {
    // console.log("candidateId",candidateId,"studentId",studentId)
  setActiveCandidateId(candidateId);
  localStorage.setItem("activeCandidateId", candidateId);

  await fetchStudentByCandidateIdOrStudentid({
    candidateId,
    studentId,   // optional
    force: true,
  });
};

  const fetchStudentByCandidateIdOrStudentid = async (
  {
  candidateId,
  studentId,
  force = false,
}
) => {
  const student = studentsMap[candidateId];
    console.log("student from studentmap",studentsMap)
  if (!student) return;
  if (student.loading) return;
  if (student.data && !force) return;

  setStudentsMap(prev => ({
    ...prev,
    [candidateId]: {
      ...prev[candidateId],
      loading: true,
      error: null,
    },
  }));
console.log("student id from fetchStudentByCandidateIdOrStudentid",studentId)
  try {
    const res = studentId
      ? await axiosInstance.get(
          `/api/students/data?studentId=${studentId}`
        )
      : await axiosInstance.get(
          `api/admissions/fulldetails?candidateId=${candidateId}`
        );
// console.log("student id from fetchStudentByCandidateIdOrStudentid res",res)

    setStudentsMap(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        data: res.data,
        loading: false,
        error: null,
      },
    }));
  } catch (err) {
    setStudentsMap(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        loading: false,
        error: err,
      },
    }));
  }
};
  const activeStudent = activeCandidateId ? studentsMap[activeCandidateId] : null;

  return (
    <StudentContext.Provider
      value={{
        loadingCandidates,
        candidates: Object.values(studentsMap),
        studentsMap,
        studentsData,
        activeCandidateId,
        activeStudent,
        isAdmitted: activeStudent?.status === "ADMITTED",
        isInProgress: activeStudent?.status === "IN_PROGRESS",
        switchStudent,
        propagateCandidates,
        refetchCandidateIds: refetch, 
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};
