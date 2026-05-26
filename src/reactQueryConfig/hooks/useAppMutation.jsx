import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../context/NotificationContext";

export const useAppMutation = ({
  mutationFn,
  successMsg,
  errorMsg,
  invalidateQueryKeys = [],
  onSuccessNotificationVisible = true,
  onErrorNotificationVisible = true,
}) => {
  const qc = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      if (onSuccessNotificationVisible) {
        showNotification({
          message: data?.data?.message || successMsg,
          type: "success",
          duration: 2000,
        });
      }

      invalidateQueryKeys.forEach((key) => {
        qc.invalidateQueries({
          queryKey: Array.isArray(key) ? [...key] : [key],
        });
      });
    },
    onError: (error) => {
      if (onErrorNotificationVisible) {
        showNotification({
          message: error?.response?.data?.data?.errorMessage || errorMsg,
          type: "error",
          duration: 2000,
        });
      }
    },
  });
};
