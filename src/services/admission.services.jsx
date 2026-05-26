import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utills/axiosInstance";
import { admission_APIs } from "../utills/apis";
import { useAppMutation } from "../reactQueryConfig/hooks/useAppMutation";
import { useNotification } from "../context/NotificationContext";

export const useFetchAllStudents = (userId) => {
  return useQuery({
    queryKey: ["candidate", userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        admission_APIs.GET_ALL_STUDENT_OF_PARENT,
        { params: { userId } }
      );
      return data?.data;
    },
    enabled: !!userId,        //  prevents API call if userId is missing
    // staleTime: 5 * 60 * 1000, //  cache for 5 minutes
  });
};

export const useGetAllParentsUserId = (filters, options = {}) => {
  return useQuery({
    queryKey: ["allParentsUserId", filters],

    queryFn: async () => {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

      const { data } = await axiosInstance.get(
        admission_APIs.GET_ALL_PARENTS_USER_ID,
        { params: cleanFilters }
      );

      return data;
    },

    ...options   // ? allows enabled override
  });
};
export const useSaveAdmissionContactsCandidate = () => {
  return useAppMutation({
    mutationFn: (payload) => {
      axiosInstance.post("/api/admission-contacts/", payload)
    },

    successMsg: "Family details saved successfully",
    errorMsg: "Failed to save family details",

    invalidateQueryKeys: [["candidate-contact-details"]],
  });
};
export const useSaveAdmissionContactsStudent = () => {
  return useAppMutation({
    mutationFn: (payload) => {
      axiosInstance.post("/api/student-contacts/update", payload)
    },

    successMsg: "Family details saved successfully",
    errorMsg: "Failed to save family details",

    invalidateQueryKeys: [["student-contact-details"]],
  });
};


export const useGetCandidateContactDetails = (candidateId, appUserId) => {
  return useQuery({
    queryKey: ["candidate-contact-details", candidateId, appUserId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/api/admission-contacts/getAdmissionContactDetails",
        {
          params: { appUserId, candidateId },
        }
      );
      return res.data;
    },
    enabled: !!candidateId,
  });
};
export const useGetStudentContactDetails = (studentId) => {
  return useQuery({
    queryKey: ["student-contact-details", studentId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/students/studentContacts/${studentId}`

      );
      return res.data.data || [];
    },
    enabled: !!studentId,
  });
};

export const useGetAllCandidateWithoutUserId = (filters, options = {}) => {
  return useQuery({
    queryKey: ["candidate-without-userId", filters],

    queryFn: async () => {
      const { data } = await axiosInstance.get(
        "/api/admissions/getAllCandidateWithoutUserId",
        { params: filters }
      );

      return data;
    },

    ...options
  });
};
export const useGetAllAdmittedStudentWithUserId = (userId) => {
  return useQuery({
    queryKey: ["admitted-candidate-with-userId", userId],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/v1/user/getAdmittedCandidateDetails",
        {
          params: { userId },
        }

      );

      return res.data.data;
    },
    enabled: !!userId,
  })
}

export const useGetNonAdmittedCandidateWithUserId = (userId) => {
  return useQuery({
    queryKey: ["non-admitted-candidate-with-userId", userId],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/admissions/getNonAdmittedCandidateDetails",
        {
          params: { userId },
        }

      );

      return res.data.data;
    },
    enabled: !!userId,
  })
}

// 

export const useEmailAvailabilityChecker = () => {
  const queryClient = useQueryClient();

  return async (email) => {
    if (!email) return null;

    return queryClient.fetchQuery({
      queryKey: ["check-email-already-exist", email],
      queryFn: async () => {
        const res = await axiosInstance.get("/api/v1/user/check-email", {
          params: { email }
        });

        return res.data;
      },
    });
  };
};

export const useMobileAvailabilityChecker = () => {
  const queryClient = useQueryClient();

  return async (mobile) => {
    if (!mobile) return null;

    return queryClient.fetchQuery({
      queryKey: ["check-mobile-already-exist", mobile],
      queryFn: async () => {
        const res = await axiosInstance.get("/api/v1/user/check-mobile", {
          params: { mobile }
        });

        return res.data;
      },
    });
  };
};

export const useHandleVerifyEmailBySendingOtp = () => {
      const { showNotification } = useNotification();
  
  return useMutation({
    mutationFn: async (email) => {
      console.log("email",email)
      const res = await axiosInstance.post(
        "/api/v1/user/verify-email-registration",
        null, 
        { params: { email } }
      );

      // Handle logical backend error
      if (res.data.error) {
        throw new Error(res.data.data?.msg || "Something went wrong");
      }

      return res.data.msg; // ?? return only message
    },

    onSuccess: (message) => {
      showNotification({
                message: message,
                type: "success",
                duration: 2000
            });
    },

    onError: (error) => {
      // alert(error.message);
        showNotification({
                message: error.response?.data?.data?.msg ||  error.message,
                type: "warning",
                duration: 2000
            });;
    }
  });
};

export const useVerifyOtpRegistration = () => {
  return useMutation({
    mutationFn: async ({ email, otp }) => {
      const res = await axiosInstance.post(
        "/api/v1/user/verify-otp-registration",
        null,
        {
          params: { email, otp }
        }
      );

      if (res.data.error) {
        throw new Error(res.data.data?.msg || "Invalid OTP");
      }

      return res.data.data?.msg;
    }
  });
};