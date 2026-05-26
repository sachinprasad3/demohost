import { useQuery } from "@tanstack/react-query";
import { APIs } from "../utills/apis";
import axiosInstance from "../utills/axiosInstance";
import { useAppMutation } from "../reactQueryConfig/hooks/useAppMutation";

/* ===== LIST ===== */
export const useGetSubjects = () => {
  return useQuery({
    queryKey: [APIs.SUBJECT__ALL],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.SUBJECT__ALL);
      return data.data || [];
    },
  });
};

/* ===== CREATE ===== */
export const useCreateSubject = () => {
  return useAppMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post(APIs.SUBJECT__CREATE, payload);
      return data;
    },
    successMsg: "Subject created successfully",
    errorMsg: "Failed to create subject",
    invalidateQueryKeys: [APIs.SUBJECT__ALL, APIs.SUBJECT__ACTIVESUBJECT],
  });
};

export const useGetActiveSubjects = () => {
  return useQuery({
    queryKey: [APIs.SUBJECT__ACTIVESUBJECT],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.SUBJECT__ACTIVESUBJECT);
      return data.data || [];
    },
  });
};

/* ===== UPDATE ===== */
export const useUpdateSubject = () => {
  return useAppMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post(APIs.SUBJECT__CREATE, payload);
      return data;
    },
    successMsg: "Subject updated successfully",
    errorMsg: "Failed to update subject",
    invalidateQueryKeys: [APIs.SUBJECT__ALL, APIs.SUBJECT__ACTIVESUBJECT],
  });
};

/* ===== DELETE ===== */
export const useDeleteSubject = () => {
  return useAppMutation({
    mutationFn: async ({ subjectId, isCurrent }) => {
      const { data } = await axiosInstance.put(
        APIs.SUBJECT + `/${subjectId}` + `?isCurrent=${isCurrent}`,
      );
      return data;
    },
    successMsg: "Status changed successfully",
    errorMsg: "Failed to change status",
    invalidateQueryKeys: [APIs.SUBJECT__ALL, APIs.SUBJECT__ACTIVESUBJECT],
  });
};
