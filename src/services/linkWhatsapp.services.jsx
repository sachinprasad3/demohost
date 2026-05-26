import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { whats_app_APIs } from "../utills/apis";
import axiosInstance from "../utills/axiosInstance";




export const useWhatsAppLogin = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const response = await axiosInstance.get(
        `${whats_app_APIs.GET_WHATS_APP_LOGIN_URL}?userid=${userId}`,
        { responseType: "arraybuffer" }
      );
      return response.data;
    },

    retry: false, 

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [whats_app_APIs.GET_WHATS_APP_LOGIN_RECORDS],
      });

      options.onSuccess?.(data);
    },

    onError: (error) => {
      options.onError?.(error);
    },
  });
};


export const useGetWhatsAppLoginRecords = () => {
  return useQuery({
    queryKey: [whats_app_APIs.GET_WHATS_APP_LOGIN_RECORDS],
    queryFn: async () => {
      const response = await axiosInstance.get(
        whats_app_APIs.GET_WHATS_APP_LOGIN_RECORDS
      );
      return response.data;
    },
  });
};


export const useWhatsAppLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.get(
        whats_app_APIs.GET_WHATS_APP_LOGOUT
      );
      return res.data;
    },
  });
};







