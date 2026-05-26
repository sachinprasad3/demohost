import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAppMutation } from "../reactQueryConfig/hooks/useAppMutation";
import axiosInstance from "../utills/axiosInstance";
import { APIs } from "../utills/apis";
import qs from "qs";

export const useSendReminder = () => {
  return useAppMutation({
    mutationFn: async (payload) => {
      const formData = new FormData();
      const {
        isAllSelectActive,
        medium,
        selectedData,
        unSelectedData,
        filter,
        title,
        message,
      } = payload;

      const params = {
        selected: !isAllSelectActive,
        
        medium,
        message,
      };
      if(title) params.title = title;

      if (filter?.searchText) params.searchName = filter?.searchText;

      if (filter?.phonePrimary) params.phonePrimary = filter?.phonePrimary;

      if (filter?.className) params.className = filter?.className;

      if (filter?.academicYear) params.academicYear = filter?.academicYear;

      if (filter?.status) params.status = filter?.status;

      // multiple studentId values
      if (!isAllSelectActive) {
        params.studentId = selectedData.map((s) => s.studentId);
      } else {
        params.studentId = unSelectedData;
      }

      const { data } = await axiosInstance.post(
        APIs.STUDENTS__TRIGGER_PUSH_NOTIFICATION,
        formData,
        {
          params,
          paramsSerializer: (params) =>
            qs.stringify(params, {
              arrayFormat: "repeat", // KEY LINE
            }),
        },
      );
      return data;
    },
    successMsg: "Reminder sent successfully",
    errorMsg: "Faild to send reminder",
  });
};

export const useGetTemplates = () => {
  return useQuery({
    queryKey: [APIs.PUSH_NOTIFICATION__TEMPLATE__CODE_NAME],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.PUSH_NOTIFICATION__TEMPLATE__CODE_NAME,
      );
      return data.data;
    },
  });
};

export const useGetTemplateByCodeName = (codeName) => {
  return useQuery({
    queryKey: [APIs.PUSH_NOTIFICATION__TEMPLATE, codeName],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.PUSH_NOTIFICATION__TEMPLATE + codeName,
      );
      return data.data;
    },
    enabled: !!codeName,
  });
};

export const useCreateNewTemplate = () => {
  return useAppMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post("lsdfsj", payload);
      return data;
    },
    successMsg: "Template created successfully",
    errorMsg: "Faild to create template",
    queryKey: [APIs.PUSH_NOTIFICATION__TEMPLATE__CODE_NAME],
  });
};

export const useGetNotificationById = (notifiId) => {
  return useQuery({
    queryKey: [APIs.PARENT_NOTIFICATION, notifiId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.PARENT_NOTIFICATION + notifiId,
      );
      return data.data;
    },
    enabled: !!notifiId,
  });
};

// export const useGetSelectedData = () => {
//   return useQuery({
//     queryKey: [],
//     queryFn: async () => {
//       const { data } = await axiosInstance.get("");
//       return data.data;
//     },
//   });
// };


export const uploadNotificationImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const {data} = await axiosInstance.post(APIs.NOTIFCATION_IMAGE, formData);
    
    const cleanUrl = data.filePath.replace(/[\[\]]/g, "");
    return cleanUrl;
  } catch (error) {
    throw new Error("Failed to upload file");
  }
};

// export const useGetParentAllNotification = () => {
//   return useQuery({
//     queryKey: [APIs.PARENT_NOTIFICATION],
//     queryFn: async () => {
//       const { data } = await axiosInstance.get(
//         APIs.PARENT_NOTIFICATION,
//       );
//       return data.data;
//     }
//   });
// };

export const useGetParentAllNotification = () => {
  const params = { size: 10 };

  const paramsString = new URLSearchParams(params).toString();

  const query = useInfiniteQuery({
    queryKey: [APIs.PARENT_NOTIFICATION, paramsString],

    queryFn: async ({ pageParam = 0 }) => {
      params.page = pageParam;

      const { data } = await axiosInstance.get(APIs.PARENT_NOTIFICATION, {
        params,
        paramsSerializer: (params) =>
          new URLSearchParams(params).toString().replace(/\+/g, "%20"),
      });

      return {
        content: data.data.content,
        totalPages: data.data.totalPages,
        page: pageParam,
      };
    },

    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });

  return {
    ...query,
    list: query.data?.pages.flatMap((page) => page.content) ?? [],
  };
};

export const useGetStudentDetails = ({ studentId }) => {
  return useQuery({
    queryKey: ["/api/students/data", studentId],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/students/data", {
        params: { studentId },
      });

      return data;
    },
    enabled: !!studentId,
  });
};
