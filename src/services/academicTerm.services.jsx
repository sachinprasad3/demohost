import { useQuery } from "@tanstack/react-query";
import { APIs } from "../utills/apis";
import axiosInstance from "../utills/axiosInstance";
import { useAppMutation } from "../reactQueryConfig/hooks/useAppMutation";

/* ===== LIST ===== */
export const useGetAcademicTerms = () => {
  return useQuery({
    queryKey: [APIs.ACADEMIC_TERM],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.ACADEMIC_TERM);
      return data || [];
    },
  });
};

/* ===== CREATE ===== */
export const useCreateAcademicTerm = () => {
  return useAppMutation({
    mutationFn: (payload) => axiosInstance.post(APIs.ACADEMIC_TERM, payload),
    successMsg: "Academic term created successfully",
    errorMsg: "Failed to create Academic term",
    invalidateQueryKeys: [APIs.ACADEMIC_TERM],
  });
};

/* ===== UPDATE ===== */
export const useUpdateAcademicTerm = () => {
  return useAppMutation({
    mutationFn: (payload) => axiosInstance.post(APIs.ACADEMIC_TERM, payload),
    successMsg: "Academic term updated successfully",
    errorMsg: "Failed to update Academic term",
    invalidateQueryKeys: [APIs.ACADEMIC_TERM],
  });
};

/* ===== DELETE ===== */
export const useDeleteAcademicTerm = () => {
  return useAppMutation({
    mutationFn: (term_id) =>
      axiosInstance.delete(APIs.ACADEMIC_TERM__DELETE, {
        params: { term_id },
      }),
    successMsg: "Academic term deleted successfully",
    errorMsg: "Failed to delete Academic term",
    invalidateQueryKeys: [APIs.ACADEMIC_TERM],
  });
};
