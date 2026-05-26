import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utills/axiosInstance";
import { APIs } from "../utills/apis";
import { useAppMutation } from "../reactQueryConfig/hooks/useAppMutation";
import { getCurrentAcademicYear } from "../utils";

/* ===== LIST ===== */
export const useGetAcademicYears = () => {
  return useQuery({
    queryKey: [APIs.ACADEMIC_YEAR],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.ACADEMIC_YEAR);
      
      const sorted = data.sort((a, b) =>
        a.academicYear.localeCompare(b.academicYear)
      );

      return sorted || [];
    },
  });
};

/** ========= Get All Active Academic Years ============ */
export const useGetActiveAcademicYears = () => {
  return useQuery({
    queryKey: [APIs.ACADEMIC_YEAR__ALL__ACTIVE],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.ACADEMIC_YEAR__ALL__ACTIVE);
      const sorted = data.data.sort((a, b) =>
        a.academicYear.localeCompare(b.academicYear)
      );

      return sorted || [];
    },
  });
};

export const useGetSingleCurrentAcademicYear = () => {
  return useQuery({
    queryKey: [APIs.ACADEMIC_YEAR__ALL__ACTIVE, 'current'],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.ACADEMIC_YEAR__ALL__ACTIVE);
      
      const currentYear = data.data.find((y) => y.isCurrent == 'Y')?.academicYear

      return currentYear;
    },
  });
};

export const useGetCurrentAcademicYears = ({isForTeacher = false}) => {

  if(isForTeacher){
    const currentAcaYear = getCurrentAcademicYear()
    return {data: [{academicYear: currentAcaYear}], isLoading: false}
  }

  return useQuery({
    queryKey: [APIs.ACADEMIC_YEAR__ALL__ACTIVE],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.ACADEMIC_YEAR__ALL__ACTIVE);
      const sorted = data.data.filter(y => y.isCurrent === 'Y').sort((a, b) =>
        a.academicYear.localeCompare(b.academicYear)
      );

      return sorted || [];
    },
  });
};

export const useGetAcademicYearsRoleBased = ({isTeacher}) => {
  if(isTeacher) return useGetCurrentAcademicYears({isForTeacher: isTeacher})
  
  return useGetActiveAcademicYears()
};

/* ===== CREATE ===== */
export const useCreateAcademicYear = () => {
  return useAppMutation({
    mutationFn: (payload) => axiosInstance.post(APIs.ACADEMIC_YEAR, payload),
    successMsg: "Academic year created successfully",
    errorMsg: "Failed to create Academic year",
    invalidateQueryKeys: [APIs.ACADEMIC_YEAR, APIs.ACADEMIC_YEAR__ALL__ACTIVE],
  });
};

/* ===== UPDATE ===== */
export const useUpdateAcademicYear = () => {
  return useAppMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post(APIs.ACADEMIC_YEAR, payload);
      return data;
    },
    successMsg: "Academic year updated successfully",
    errorMsg: "Failed to update Academic year",
    invalidateQueryKeys: [APIs.ACADEMIC_YEAR, APIs.ACADEMIC_YEAR__ALL__ACTIVE],
  });
};

/* ===== DELETE ===== */
export const useDeleteAcademicYear = () => {
  return useAppMutation({
    mutationFn: (academicYear) =>
      axiosInstance.delete(APIs.ACADEMIC_YEAR__DELETE, {
        params: { academicYear },
      }),
    successMsg: "Academic year deleted successfully",
    errorMsg: "Failed to delete Academic year",
    invalidateQueryKeys: [APIs.ACADEMIC_YEAR, APIs.ACADEMIC_YEAR__ALL__ACTIVE],
  });
};
