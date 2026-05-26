import { useQuery } from "@tanstack/react-query";
import { APIs } from "../utills/apis";
import { useAppMutation } from "../reactQueryConfig/hooks/useAppMutation";
import axiosInstance from "../utills/axiosInstance";

export const useGetThemes = () => {
  return useQuery({
    queryKey: [APIs.THEME],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.THEME);

      return data;
    },
  });
};

export const useGetThemesByClassId = (classId) => {
  
  return useQuery({
    queryKey: [APIs.THEME__CLASS_ID, classId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.THEME__CLASS_ID, {
        params: { classId },
      });
      return data;
    },
    enabled: classId !== undefined && classId !== null && classId !== "", // Enable the query only if classId is provided
  });
};

export const useCreateTheme = () => {
    return useAppMutation({
        mutationFn: (body) => axiosInstance.post(APIs.THEME, body),
        successMsg: 'Theme saved successfully',
        errorMsg: 'Failed to save theme',
        invalidateQueryKeys: [APIs.THEME]
    })
}

export const useUploadTheme = () => {
    return useAppMutation({
        mutationFn: (body) => axiosInstance.post(APIs.THEME__UPLOAD, body),
        successMsg: 'Theme saved successfully',
        errorMsg: 'Failed to save theme',
        invalidateQueryKeys: [APIs.THEME, APIs.THEME__CLASS_ID]
    })
}