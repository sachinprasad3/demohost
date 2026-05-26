import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utills/axiosInstance";
import { APIs } from "../utills/apis";

/* ===== LIST ===== */
export const useGetTeachers = () =>
  useQuery({
    queryKey: [APIs.TEACHER__LIST],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.TEACHER__LIST);
      return data?.data || [];
    },
  });

/* ===== BY ID ===== */
export const useGetTeacherById = (teacherId) =>
  useQuery({
    queryKey: [APIs.TEACHER__DETAIL, teacherId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `${APIs.TEACHER__DETAIL}/${teacherId}`
      );
      return data?.data;
    },
    enabled: !!teacherId,
  });

/* ===== CREATE ===== */
export const useCreateTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => axiosInstance.post(APIs.TEACHER__CREATE, payload),
    onSuccess: () => qc.invalidateQueries([APIs.TEACHER__LIST]),
  });
};

/* ===== UPDATE ===== */
export const useUpdateTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => axiosInstance.put(APIs.TEACHER__UPDATE, payload),
    onSuccess: () => qc.invalidateQueries([APIs.TEACHER__LIST]),
  });
};

/* ===== DELETE ===== */
export const useDeleteTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teacherId) =>
      axiosInstance.delete(APIs.TEACHER__DELETE, {
        params: { teacherId },
      }),
    onSuccess: () => qc.invalidateQueries([APIs.TEACHER__LIST]),
  });
};

export const useTeacherAssignedClasses = (
  { teacherId, role }
) => {
  return useQuery({
    queryKey: ["teacher-assigned-classes", teacherId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/teachers/${teacherId}/assignedClasses`
      );
      return res.data.data || [];
    },
    enabled:  !!teacherId,

//     onSuccess: (data) => {
//   const permanentClass =data.find(cls => cls.assignmentStatus === "Permanent") || data[0];
// console.log("permanent class",permanentClass)
//   setActiveClassId(permanentClass?.classId ?? null);
// },


    onError: (error) => {
      console.error("Failed to fetch teacher profile", error);
    },

    // staleTime: 60 * 1000,        // 1 min
    refetchOnWindowFocus: true,  // auto refresh on tab focus
  });
};

export const useGetDayList = ({classId}) => {
  return useQuery({
    queryKey: [APIs.DAILY_LESSION_PLAN_MASTER__TOTAL_DAYS, classId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.DAILY_LESSION_PLAN_MASTER__TOTAL_DAYS, {
        params: {classId}
      });

      return data.data
    },
    enabled: !!classId,
  });
}