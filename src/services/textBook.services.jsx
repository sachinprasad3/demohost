import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utills/axiosInstance";
import { APIs } from "../utills/apis";
import { useAppMutation } from "../reactQueryConfig/hooks/useAppMutation";

/* ===== LIST ===== */
export const useGetTextBooks = () => {
  return useQuery({
    queryKey: [APIs.BOOK__ALL],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.BOOK__ALL);
      return data?.data || [];
    },
  });
};

/* ===== CREATE ===== */
export const useCreateTextBook = () => {
  return useAppMutation({
    mutationFn: (payload) =>
      axiosInstance.post(APIs.BOOK__SAVE_BOOK_RECORD, payload),
    successMsg: "Text book created successfully",
    errorMsg: "Failed to create text book",
    invalidateQueryKeys: [APIs.BOOK__ALL],
  });
};

/* ===== UPDATE ===== */
export const useUpdateTextBook = () => {
  return useAppMutation({
    mutationFn: async (payload) => {
      const { textBookId, ...rest } = payload;
      const { data } = await axiosInstance.put(
        APIs.BOOK + `/${textBookId}`,
        rest
      );
      return data;
    },
    successMsg: "Text book updated successfully",
    errorMsg: "Failed to update text book",
    invalidateQueryKeys: [APIs.BOOK__ALL],
  });
};

/* ===== DELETE ===== */
export const useDeleteTextBook = () => {
  return useAppMutation({
    mutationFn: async (textBookId) => {
      const { data } = await axiosInstance.delete(APIs.BOOK + `/${textBookId}`);
      return data;
    },
    successMsg: "Text book deleted successfully",
    errorMsg: "Failed to delete text book",
    invalidateQueryKeys: [APIs.BOOK__ALL],
  });
};
