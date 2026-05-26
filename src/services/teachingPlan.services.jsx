import { useQuery } from "@tanstack/react-query";
import { APIs } from "../utills/apis";
import axiosInstance from "../utills/axiosInstance";
import { useAppMutation } from "../reactQueryConfig/hooks/useAppMutation";
import { useAuth } from "../context/AuthContext";
import { useTeacherAssignedClasses } from "./teacherMaster.services";
import { useMemo } from "react";

export const useGetAllDailyLessonPlan = () =>
  useQuery({
    queryKey: [APIs.DAILYLESSIONPLAN],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.DAILYLESSIONPLAN);
      return data || [];
    },
  });

export const useCreateUpdatePlanner = () => {
  return useAppMutation({
    mutationFn: (body) => axiosInstance.post(APIs.DAILYLESSIONPLAN, body),
    successMsg: "Created successfully",
    errorMsg: "Failed to create",
    invalidateQueryKeys: [
      APIs.DAILYLESSIONPLAN,
      APIs.DAILYLESSIONPLAN__SEARCHDATA,
    ],
  });
};

export const useUpdatePlanner = () => {
  return useAppMutation({
    mutationFn: (body) => axiosInstance.post(APIs.DAILYLESSIONPLAN, body),
    successMsg: "Updated successfully",
    errorMsg: "Failed to update",
  });
};

export const useGetSections = () => {
  return useQuery({
    queryKey: [APIs.ALL_SECTION_ID_WITH_NAME],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.ALL_SECTION_ID_WITH_NAME);
      return data.data;
    },
  });
};

export const useGetDailylessionplanById = (id) => {
  return useQuery({
    queryKey: [APIs.DAILYLESSIONPLAN__ID],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.DAILYLESSIONPLAN__ID, {
        params: { daily_teaching_plan_id: id },
      });
      return data;
    },
    enabled: !!id,
  });
};

export const useGetDailylessionplanSearchData = ({
  academicYear,
  classCode,
  sectionId,
  syllabusName,
  day,
  dayDate,
}) => {
  return useQuery({
    queryKey: [
      APIs.DAILYLESSIONPLAN__SEARCHDATA,
      academicYear,
      classCode,
      sectionId,
      syllabusName,
      day,
      dayDate,
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.DAILYLESSIONPLAN__SEARCHDATA,
        {
          params: {
            page: 0,
            size: 10,
            academicYear,
            classCode,
            sectionId,
            syllabusName,
            day,
            dayDate,
          },
          paramsSerializer: (params) =>
            new URLSearchParams(params).toString().replace(/\+/g, "%20"),
        },
      );
      return data.data.content;
    },
    enabled:
      !!academicYear && !!classCode && !!sectionId && !!syllabusName && !!day,
  });
};

export const useGetDailylessionplanSearchDataForView = ({
  academicYear,
  classCode,
  sectionId,
  syllabusName,
  day,
  dayDate,
}) => {
  const params = {page: 0, size: 10};
  if(academicYear){
    params.academicYear = academicYear;
  }
  if(classCode){
    params.classCode = classCode;
  }
  if(sectionId){
    params.sectionId = sectionId;
  }
  if(syllabusName){
    params.syllabusName = syllabusName;
  }
  if(day){
    params.day = day;
  }
  if(dayDate){
    params.dayDate = dayDate;
  }

  const paramString = JSON.stringify(params);
  return useQuery({
    queryKey: [
      APIs.DAILYLESSIONPLAN__SEARCHDATA,
      paramString
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.DAILYLESSIONPLAN__SEARCHDATA,
        {
          params,
          paramsSerializer: (params) =>
            new URLSearchParams(params).toString().replace(/\+/g, "%20"),
        },
      );
      return data.data.content;
    },
    enabled: !!academicYear && !!classCode && !!sectionId && !!syllabusName
  });
};

export const useDeleteDailylessionPlanById = () => {
  return useAppMutation({
    mutationFn: () => axiosInstance.post(""),
    successMsg: "Deleted successfully",
    errorMsg: "Failed to delete",
    invalidateQueryKeys: [APIs.DAILYLESSIONPLAN],
  });
};

export const useGetDailylessionplanMasterSearchData = ({
  classCode,
  day,
}) => {
  return useQuery({
    queryKey: [
      APIs.DAILY_LESSION_PLAN_MASTER__MASTER_SEARCH_DATA,
      classCode,
      day,
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.DAILY_LESSION_PLAN_MASTER__MASTER_SEARCH_DATA,
        {
          params: { classCode, day },
          paramsSerializer: (params) =>
            new URLSearchParams(params).toString().replace(/\+/g, "%20"),
        },
      );
      return data;
    },
    enabled: !!classCode && !!day,
  });
};

export const useGetDailylessionplanMasterSearchDataForView = ({
  classCode,
  day,
}) => {
  const params = {};
  if(classCode){
    params.classCode = classCode;
  }
  if(day){
    params.day = day;
  }

  const paramString = JSON.stringify(params);
  return useQuery({
    queryKey: [
      APIs.DAILY_LESSION_PLAN_MASTER__MASTER_SEARCH_DATA,
      paramString
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.DAILY_LESSION_PLAN_MASTER__MASTER_SEARCH_DATA,
        {
          params,
          paramsSerializer: (params) =>
            new URLSearchParams(params).toString().replace(/\+/g, "%20"),
        },
      );
      return data;
    },
    // enabled: !!classCode && !!day,
  });
};

export const useCreateUpdateMasterPlanner = () => {
  return useAppMutation({
    mutationFn: (body) =>
      axiosInstance.post(APIs.DAILY_LESSION_PLAN_MASTER, body),
    successMsg: "Created successfully",
    errorMsg: "Failed to create",
    invalidateQueryKeys: [
      APIs.DAILYLESSIONPLAN,
      APIs.DAILYLESSIONPLAN__SEARCHDATA,
      APIs.DAILY_LESSION_PLAN_MASTER__MASTER_SEARCH_DATA,
    ],
  });
};

export const useGetDailylessionplanMasterById = (id) => {
  return useQuery({
    queryKey: [APIs.DAILY_LESSION_PLAN_MASTER__ID, id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.DAILY_LESSION_PLAN_MASTER__ID,
        {
          params: { daily_teaching_plan_id: id },
        },
      );
      return data;
    },
    enabled: !!id,
  });
};

/** It's common hook that handled for get Template and Plan (Hw) accourding to isTemplete Flag By there ID */
export const useGetMasterDailyLessionplanById = ({ isTemplate, id }) => {
  /** It's for getting templates */
  if (isTemplate) return useGetDailylessionplanMasterById(id);

  /** It's for getting teaching plan or it also called homework */
  return useGetDailylessionplanById(id);
};

/** It's common hook that handled for get Templates and Plan (Hw) accourding to isTemplete Flag */
export const useGetMasterDailyLessionplanSearch = (details) => {
  const {
    isForView = false,
    isTemplate,
    dayDate,
    academicYear,
    ...rest
  } = details;
  /** It's for getting templates */
  const templateData = useGetDailylessionplanMasterSearchData(rest);

  if (isTemplate) return templateData;

  /** It's for getting teaching plan or it also called homework */
  const academicPlan = useGetDailylessionplanSearchData({
    dayDate,
    academicYear,
    ...rest,
  });

  // IMPORTANT: wait for plan API to finish
  const isPlanLoading =
    academicPlan.isLoading || academicPlan.isFetching;

  // Only fallback AFTER plan API is done
  if (
    !isPlanLoading &&
    !academicPlan?.data?.length &&
    templateData?.data?.length > 0 &&
    !isForView
  ) {
    return templateData;
  }

  return academicPlan;
};

/** It's common hook that handled for create Templates and Plan (Hw) accourding to isTemplete Flag */
export const useCreateUpdateMsterDailyLessionplan = ({ isTemplate }) => {
  /** It's for creating templates */
  if (isTemplate) return useCreateUpdateMasterPlanner();

  /** It's for creating teaching plan or it also called homework */
  return useCreateUpdatePlanner();
};

export const useGetSuperSyllabusMaster = () => {
  return useQuery({
    queryKey: [APIs.SUPER_SYLLABUS_MASTER],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.SUPER_SYLLABUS_MASTER);
      return data;
    },
  });
};
// export const useGetSyllabusByAcademicYear = ({
//   academicYear,
//   isForTeacher = false,
// }) => {
//   if (isForTeacher) {
//     const { user } = useAuth();
//     const teacherId = user?.teacherInfo?.teacherId;
//     const role = user?.role;
//     return useTeacherAssignedClasses({ teacherId, role });
//   }

//   return useQuery({
//     queryKey: [APIs.SYLLABUS__ACADEMIC_YEAR, academicYear],
//     queryFn: async () => {
//       const { data } = await axiosInstance.get(APIs.SYLLABUS__ACADEMIC_YEAR, {
//         params: { academicYear },
//       });
//       return data.data;
//     },
//     enabled: !!academicYear,
//   });
// };

export const useGetSyllabusByAcademicYear = ({
  academicYear,
  isForTeacher = false,
}) => {
  const { user } = useAuth();
  const teacherId = user?.teacherInfo?.teacherId;
  const role = user?.role;

  // 1?? Get assigned classes (ONLY for teacher)
  const assignedClassesQuery = useTeacherAssignedClasses(
    isForTeacher
      ? { teacherId, role }
      : {},
  );

  // 2?? Get all syllabus for academic year
  const syllabusQuery = useQuery({
    queryKey: [APIs.SYLLABUS__ACADEMIC_YEAR, academicYear],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.SYLLABUS__ACADEMIC_YEAR,
        { params: { academicYear } }
      );
      return data.data;
    },
    enabled: !!academicYear,
  });

  // 3?? If NOT teacher ? return directly
  if (!isForTeacher) {
    return syllabusQuery;
  }

  // 4?? Filter syllabus based on assigned classes
  const filteredSyllabus = useMemo(() => {
    if (
      !assignedClassesQuery.data ||
      !syllabusQuery.data
    ) {
      return [];
    }

    const assignedClassIds = assignedClassesQuery.data.map(
      (c) => c.classId
    );

    return syllabusQuery.data.filter((syll) =>
      assignedClassIds.includes(syll.classId)
    );
  }, [assignedClassesQuery.data, syllabusQuery.data]);

  return {
    isLoading:
      assignedClassesQuery.isLoading ||
      syllabusQuery.isLoading,
    isError:
      assignedClassesQuery.isError ||
      syllabusQuery.isError,
    data: filteredSyllabus,
  };
};

export const useGetAllClasses = () => {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/v1/class/getAllClasses");
      
      return Array.isArray(data?.data) ? data?.data : [];
    },
  });
};


export const useGetAllActiveAcademicYear = () => {
  return useQuery({
    queryKey:["active-academic-years"],
    queryFn: async () => {
      const {data} = await axiosInstance.get(`/api/academicYear/all/active`);
     
      return Array.isArray(data?.data) ? data?.data : [];
    },
  });
};

export const useGetSuperSyllabusByClassId = (classId) => {
  return useQuery({
    queryKey: ["super-syllabus-by-classId", classId], // ? FIXED
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        "/api/v1/supersyllabusmaster/by-class-id",
        { params: { classId } },
      );

      return data || {};
    },
    enabled: !!classId,
  });
};

export const useGetAllSuperSyllabus = () => {
  return useQuery({
    queryKey: ["all-super-syllabus"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/v1/supersyllabusmaster/");

      return Array.isArray(data) ? data : [];
    },
    
  });
};

export const useGetDayList = ({academicYear, classCode, syllabusName}) => {
  return useQuery({
    queryKey: [APIs.DAILY_LESSION_PLAN__TOTAL_DAYS, academicYear, classCode, syllabusName],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.DAILY_LESSION_PLAN__TOTAL_DAYS, {
        params: {academicYear, classCode, syllabusName}
      });

      return data.data
    },
    enabled: !!academicYear && !!classCode && !!syllabusName,
  });
}