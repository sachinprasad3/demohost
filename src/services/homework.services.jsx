import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axiosInstance from "../utills/axiosInstance";
import { APIs } from "../utills/apis";
import { useState } from "react";
import { useAppMutation } from "../reactQueryConfig/hooks/useAppMutation";
import { getCurrentAcademicYear } from "../utils";
import { useTeacherAssignedClasses } from "./teacherMaster.services";
import { useAuth } from "../context/AuthContext";

export const limit = 10;

export const useGetClasses = (academicYear) => {
  let academicYearToUse = academicYear;

  if(!academicYearToUse) {
    academicYearToUse = getCurrentAcademicYear()
  }

  return useQuery({
    queryKey: [APIs.CLASS__GET_ALL_CLASSES_BY_ACADEMIC_YEAR, academicYearToUse],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.CLASS__GET_ALL_CLASSES_BY_ACADEMIC_YEAR +
          `?academicYear=${academicYearToUse}`,
      );
      return data?.data;
    },
    enabled: !!academicYearToUse,
  });
};

export const useGetAssignedClasses = ({ academicYear, isForTeacher }) => {
  if (isForTeacher) {
    const { user } = useAuth();
    const teacherId = user?.teacherInfo?.teacherId;
    const role = user?.role;
    return useTeacherAssignedClasses({ teacherId, role });
  }

  return useQuery({
    queryKey: [APIs.CLASS__GET_ALL_CLASSES_BY_ACADEMIC_YEAR, academicYear],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.CLASS__GET_ALL_CLASSES_BY_ACADEMIC_YEAR +
          `?academicYear=${academicYear}`,
      );
      return data?.data;
    },
    enabled: !!academicYear,
  });
};

export const useGetSyllabus = (classId, academicYear) => {
  return useQuery({
    queryKey: [APIs.SYLLABUS__ACADEMIC_YEAR__CLASS_ID, classId, academicYear],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.SYLLABUS__ACADEMIC_YEAR__CLASS_ID,
        {
          params: { classId, academicYear },
        },
      );

      return data?.data;
    },
    enabled: !!classId && !!academicYear,
  });
};

export const useGetTopics = (syllabusId, subjectId) => {
  return useQuery({
    queryKey: [
      APIs.SYLLABUS_TOPICS__ALL_SYLLABUS_ID__SUBJECT_ID,
      syllabusId,
      subjectId,
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.SYLLABUS_TOPICS__ALL_SYLLABUS_ID__SUBJECT_ID,
        {
          params: { syllabusId, subjectId },
        },
      );
      return data?.data;
    },
    enabled: !!syllabusId && !!subjectId,
  });
};

export const useGetTeachers = (classId) => {
  return useQuery({
    queryKey: [APIs.SHARE__TEACHER_INFO__CLASS_ID, classId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.SHARE__TEACHER_INFO__CLASS_ID + classId, // Assuming classId is 1 for example
      );
      return data?.data;
    },
    enabled: !!classId,
  });
};

export const useGetActivities = (syllabusTopicId, subjectId, classId) => {
  return useQuery({
    queryKey: [
      APIs.DAILY_ACTIVITIES__TOPIC_ID__SUBJECT_ID__CLASS_ID,
      syllabusTopicId,
      subjectId,
      classId,
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.DAILY_ACTIVITIES__TOPIC_ID__SUBJECT_ID__CLASS_ID,
        {
          params: {
            syllabusTopicId,
            subjectId,
            classId,
          },
        },
      );
      return data?.data;
    },
    enabled: !!syllabusTopicId && !!subjectId && !!classId,
  });
};

export const useCreateHomework = () => {
  return useAppMutation({
    mutationFn: async (homeworkData) => {
      const { data } = await axiosInstance.post(
        APIs.HOMEWORK__CREATE_HOMEWORK,
        homeworkData,
      );
      return data;
    },
    successMsg: "Homework created successfully",
    errorMsg: "Failed to create homework",
    invalidateQueryKeys: [APIs.HOMEWORK__ALL],
  });
};

export const useGetHomeworkList = ({ search, filters, status = "ACTIVE" }) => {
  const [page, setPage] = useState(0);
  const params = { page, size: limit };

  if (search) {
    params.homeworkTitle = search;
  }
  if (status) {
    params.homeworkStatus = status;
  }
  if (filters?.date) {
    params.assignedDate = filters.date;
  }
  if (filters.academicYear) {
    params.academicYear = filters.academicYear;
  }
  if (filters.classId) {
    params.classId = filters.classId;
  }
  if (filters.syllabusId) {
    params.syllabusId = filters.syllabusId;
  }
  if (filters.activityId) {
    params.activityId = filters.activityId;
  }
  if (filters.subjectId) {
    params.subjectId = filters.subjectId;
  }
  if (filters.topicId) {
    params.topicId = filters.topicId;
  }

  const stringParams = JSON.stringify(params);

  const query = useQuery({
    queryKey: [APIs.HOMEWORK__ALL, stringParams],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.HOMEWORK__ALL, {
        params,
      });

      return {
        data: data.data.content,
        totalPages: data?.data?.totalPages,
      };
    },
  });

  const totalPages = query?.data?.totalPages;
  const pagination = {
    totalPages,
    page,
    hasPreviousPage: page > 0,
    hasNextPage: page < totalPages - 1,
  };

  const nextPage = () => pagination?.hasNextPage && setPage((p) => p + 1);

  const prevPage = () => pagination?.hasPreviousPage && setPage((p) => p - 1);

  return {
    ...query,
    ...pagination,
    setPage,
    nextPage,
    prevPage,
  };
};

export const useGetHomeworkById = (hwId) => {
  return useQuery({
    queryKey: [APIs.HOMEWORK__HOMEWORK_ID, hwId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.HOMEWORK__HOMEWORK_ID + `/${hwId}`,
      );
      return data?.data;
    },
    enabled: !!hwId,
  });
};

export const useGetStudents = ({ classId, homeworkId }) => {
  const academicYear = getCurrentAcademicYear();
  return useQuery({
    queryKey: [
      APIs.STUDENT_HOMEWORK__NOT_ASSIGNED,
      classId,
      homeworkId,
      academicYear,
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.STUDENT_HOMEWORK__NOT_ASSIGNED,
        {
          params: { classId, homeworkId, academicYear },
        },
      );

      return data?.data;
    },
    enabled: !!classId && !!homeworkId,
  });
};

export const useAssignHomework = () => {
  return useAppMutation({
    mutationFn: async (assignData) => {
      const { data } = await axiosInstance.post(
        APIs.STUDENT_HOMEWORK__ASSIGN_MULTIPLE,
        assignData,
      );
      return data;
    },
    successMsg: "Homework assigned successfully",
    errorMsg: "Failed to assign homework",
  });
};

export const useGetAllottedHomeworkList = ({ search, filters, status }) => {
  const [page, setPage] = useState(0);
  const params = { page, size: limit };

  if (search) {
    params.homeworkTitle = search;
  }
  if (status) {
    params.homeworkAllotmentStatus = status;
  }
  if (filters?.date) {
    params.date = filters.date;
  }
  if (filters.academicYear) {
    params.academicYear = filters.academicYear;
  }
  if (filters.classId) {
    params.classId = filters.classId;
  }
  if (filters.syllabusId) {
    params.syllabusId = filters.syllabusId;
  }
  if (filters.activityId) {
    params.activityId = filters.activityId;
  }
  if (filters.subjectId) {
    params.subjectId = filters.subjectId;
  }
  if (filters.topicId) {
    params.topicId = filters.topicId;
  }

  const stringParams = JSON.stringify(params);

  const query = useQuery({
    queryKey: [APIs.HOMEWORK__ALL_ALLOTED, stringParams],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.HOMEWORK__ALL_ALLOTED, {
        params,
      });

      return {
        data: data.data.content,
        totalPages: data?.data?.totalPages,
      };
    },
  });

  const totalPages = query?.data?.totalPages;
  const pagination = {
    totalPages,
    page,
    hasPreviousPage: page > 0,
    hasNextPage: page < totalPages - 1,
  };

  const nextPage = () => pagination?.hasNextPage && setPage((p) => p + 1);

  const prevPage = () => pagination?.hasPreviousPage && setPage((p) => p - 1);

  return {
    ...query,
    ...pagination,
    setPage,
    nextPage,
    prevPage,
  };
};

export const useGetAllottedStudentList = ({
  allotmentId,
  assignmentStatus,
}) => {
  const [page, setPage] = useState(0);
  const params = { page, size: 200, allotmentId, assignmentStatus };

  const stringParams = JSON.stringify(params);

  const query = useQuery({
    queryKey: [APIs.STUDENT_HOMEWORK__ALL, stringParams],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.STUDENT_HOMEWORK__ALL, {
        params,
      });

      return {
        data: data.data.content,
        totalPages: data?.data?.totalPages,
      };
    },
    enabled: !!allotmentId,
  });

  const totalPages = query?.data?.totalPages;
  const pagination = {
    totalPages,
    page,
    hasPreviousPage: page > 0,
    hasNextPage: page < totalPages - 1,
  };

  const nextPage = () => pagination?.hasNextPage && setPage((p) => p + 1);

  const prevPage = () => pagination?.hasPreviousPage && setPage((p) => p - 1);

  return {
    ...query,
    ...pagination,
    setPage,
    nextPage,
    prevPage,
  };
};

export const useGetForwardedHomeworkList = ({ search, filters, status }) => {
  const [page, setPage] = useState(0);
  const params = { page, size: limit, homeworkAllotmentStatus: "FORWARDED" };

  if (search) {
    params.homeworkTitle = search;
  }
  if (status) {
    params.homeworkAllotmentStatus = status;
  }
  if (filters?.date) {
    params.date = filters.date;
  }
  if (filters.academicYear) {
    params.academicYear = filters.academicYear;
  }
  if (filters.classId) {
    params.classId = filters.classId;
  }
  if (filters.syllabusId) {
    params.syllabusId = filters.syllabusId;
  }
  if (filters.activityId) {
    params.activityId = filters.activityId;
  }
  if (filters.subjectId) {
    params.subjectId = filters.subjectId;
  }
  if (filters.topicId) {
    params.topicId = filters.topicId;
  }

  const stringParams = JSON.stringify(params);

  const query = useQuery({
    queryKey: [APIs.HOMEWORK__ALL_FORWARDED, stringParams],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.HOMEWORK__ALL_FORWARDED, {
        params,
      });

      return {
        data: data.data.content,
        totalPages: data?.data?.totalPages,
      };
    },
  });

  const totalPages = query?.data?.totalPages;
  const pagination = {
    totalPages,
    page,
    hasPreviousPage: page > 0,
    hasNextPage: page < totalPages - 1,
  };

  const nextPage = () => pagination?.hasNextPage && setPage((p) => p + 1);

  const prevPage = () => pagination?.hasPreviousPage && setPage((p) => p - 1);

  return {
    ...query,
    ...pagination,
    setPage,
    nextPage,
    prevPage,
  };
};

export const useUpdateHomeworkStatus = () => {
  return useAppMutation({
    mutationFn: async ({ hwId, status }) => {
      const { data } = await axiosInstance(
        APIs.HOMEWORK__UPDATE_STATUS__HOMEWORK_ID +
          `/${hwId}?homeworkStatus=${status}`,
      );
      return data;
    },
    successMsg: "Status updated successfully",
    errorMsg: "Failed to updated status",
    invalidateQueryKeys: [APIs.HOMEWORK__ALL],
  });
};

export const useGetHomeworkByAllotmentId = (allotmentId) => {
  return useQuery({
    queryKey: [APIs.HOMEWORK__ALLOTMENT_ID, allotmentId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.HOMEWORK__ALLOTMENT_ID + `${allotmentId}`,
      );
      return data?.data;
    },
    enabled: !!allotmentId,
  });
};

export const useGetStudentHomework = ({
  filters,
  studentId,
  assignmentStatus,
}) => {
  const [page, setPage] = useState(0);
  const params = { page, size: 200, studentId, assignmentStatus };

  if (filters?.date) {
    params.date = filters.date;
  }
  if (filters.academicYear) {
    params.academicYear = filters.academicYear;
  }
  if (filters.classId) {
    params.classId = filters.classId;
  }
  if (filters.syllabusId) {
    params.syllabusId = filters.syllabusId;
  }
  if (filters.activityId) {
    params.activityId = filters.activityId;
  }
  if (filters.subjectId) {
    params.subjectId = filters.subjectId;
  }
  if (filters.topicId) {
    params.topicId = filters.topicId;
  }

  const stringParams = JSON.stringify(params);

  const query = useQuery({
    queryKey: [APIs.STUDENT_HOMEWORK__ALL, stringParams],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.STUDENT_HOMEWORK__ALL, {
        params,
      });

      return {
        data: data.data.content,
        totalPages: data?.data?.totalPages,
      };
    },
    enabled: !!studentId,
  });

  const totalPages = query?.data?.totalPages;
  const pagination = {
    totalPages,
    page,
    hasPreviousPage: page > 0,
    hasNextPage: page < totalPages - 1,
  };

  const nextPage = () => pagination?.hasNextPage && setPage((p) => p + 1);

  const prevPage = () => pagination?.hasPreviousPage && setPage((p) => p - 1);

  return {
    ...query,
    ...pagination,
    setPage,
    nextPage,
    prevPage,
  };
};

export const useUpdateAssignedHw = () => {
  return useAppMutation({
    mutationFn: (body) =>
      axiosInstance.put(APIs.STUDENT_HOMEWORK__UPDATE_ASSIGN_HOMEWORK, body),
    successMsg: "Updated successfully",
    errorMsg: "Failed to updated",
    invalidateQueryKeys: [APIs.STUDENT_HOMEWORK__V2__ALL],
  });
};

export const assignmentStatusList = [
  { id: "ASSIGNED", value: "ASSIGNED" },
  { id: "SUBMITTED", value: "SUBMITTED" },
  { id: "CHECKED", value: "CHECKED" },
  { id: "LATE_SUBMISSION", value: "LATE_SUBMISSION" },
  { id: "NOT_SUBMITTED", value: "NOT_SUBMITTED" },
];

// export const gradeList = [
//   { id: "A+", value: "A+" },
//   { id: "A", value: "A" },
//   { id: "B+", value: "B+" },
//   { id: "B", value: "B" },
//   { id: "C+", value: "C+" },
//   { id: "C", value: "C" },
//   { id: "D+", value: "D+" },
//   { id: "D", value: "D" },
// ];

export const gradeList = [
  { id: 1, value: "⭐" },
  { id: 2, value: "⭐⭐" },
  { id: 3, value: "⭐⭐⭐" },
  { id: 4, value: "⭐⭐⭐⭐" },
  { id: 5, value: "⭐⭐⭐⭐⭐" },
];

export const submissionType = [
  { id: "READING", value: "READING" },
  { id: "WRITING", value: "WRITING" },
  { id: "PRACTICE", value: "PRACTICE" },
  { id: "PROJECT", value: "PROJECT" },
  { id: "ORAL", value: "ORAL" },
  { id: "CREATIVE", value: "CREATIVE" },
  { id: "WORKSHEET", value: "WORKSHEET" },
];

/** New Hw workflow */

export const useApproveHomework = () => {
  return useAppMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.put(
        APIs.STUDENT_HOMEWORK__FORMWARDED_HOMEWORK__APPROVE,
        payload,
      );

      return data;
    },
    successMsg: "Approved successfully",
    errorMsg: "Failed to approve",
    invalidateQueryKeys: [APIs.HOMEWORK__V2__ALL_FORWARDED],
  });
};

export const useRejectHomework = () => {
  return useAppMutation({
    mutationFn: async (allotmentId) => {
      const { data } = await axiosInstance.get(
        APIs.STUDENT_HOMEWORK__FORMWARDED_HOMEWORK__REJECT,
        { params: { allotmentId } },
      );

      return data;
    },
    successMsg: "Rejected successfully",
    errorMsg: "Failed to reject",
    invalidateQueryKeys: [APIs.HOMEWORK__V2__ALL_FORWARDED],
  });
};

export const useGetDailyTeachingPlanHomeworkList = ({ filters }) => {
  const params = { size: 10 };

  if (filters.academicYear) {
    params.academicYear = filters.academicYear;
  }
  if (filters.classCode) {
    params.classCode = filters.classCode;
  }
  if (filters.syllabusName) {
    params.syllabusName = filters.syllabusName;
  }
  if (filters.sectionId) {
    params.sectionId = filters.sectionId;
  }
  if (filters.date) {
    params.dayDate = filters.date;
  }

  const query = useInfiniteQuery({
    queryKey: [APIs.DAILYLESSIONPLAN__SEARCHDATA, filters],

    queryFn: async ({ pageParam = 0 }) => {
      params.page = pageParam;

      const { data } = await axiosInstance.get(
        APIs.DAILYLESSIONPLAN__SEARCHDATA,
        {
          params,
          paramsSerializer: (params) =>
            new URLSearchParams(params).toString().replace(/\+/g, "%20"),
        },
      );

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

    enabled: !!filters.academicYear && !!filters?.classCode && !!filters.date,
  });

  return {
    ...query,
    list: query.data?.pages.flatMap((page) => page.content) ?? [],
  };
};

export const useGetDailyTeachingPlanNotAssignedToAll = ({ filters }) => {
  const params = { size: 10 };

  if (filters.academicYear) {
    params.academicYear = filters.academicYear;
  }
  if (filters.classCode) {
    params.classCode = filters.classCode;
  }
  if (filters.syllabusName) {
    params.syllabusName = filters.syllabusName;
  }
  if (filters.sectionId) {
    params.sectionId = filters.sectionId;
  }
  if (filters.date) {
    params.dayDate = filters.date;
  }

  const query = useInfiniteQuery({
    queryKey: [APIs.DAILY_LESSION_PLAN__PLAN_NOT_ASSIGNED_TO_ALL, filters],

    queryFn: async ({ pageParam = 0 }) => {
      params.page = pageParam;

      const { data } = await axiosInstance.get(
        APIs.DAILY_LESSION_PLAN__PLAN_NOT_ASSIGNED_TO_ALL,
        {
          params,
          paramsSerializer: (params) =>
            new URLSearchParams(params).toString().replace(/\+/g, "%20"),
        },
      );

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

    enabled: !!filters.academicYear && !!filters?.classCode && !!filters.date,
  });

  return {
    ...query,
    list: query.data?.pages.flatMap((page) => page.content) ?? [],
  };
};

export const useGetDailyTeachingPlanHwById = (id) => {
  return useQuery({
    queryKey: [APIs.DAILYLESSIONPLAN__ID, id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.DAILYLESSIONPLAN__ID, {
        params: { daily_teaching_plan_id: id },
      });

      return data;
    },
    enabled: !!id,
  });
};

export const useGetDailyTeachingPlanHwByPlanIdAndAllotmentId = ({allotmentId, dailyTeachingPlanId}) => {
  return useQuery({
    queryKey: [APIs.DAILY_LESSION_PLAN__PARENT__HOMEWORK, dailyTeachingPlanId, allotmentId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.DAILY_LESSION_PLAN__PARENT__HOMEWORK, {
        params: { dailyTeachingPlanId, allotmentId },
      });

      return data.data;
    },
    enabled: !!dailyTeachingPlanId && !!allotmentId,
  });
};

export const useGetDailyTeachingPlanHwForActivityAndHomework = ({ isClassActivity, allotmentId, dailyTeachingPlanId }) => {
  if(isClassActivity) return useGetDailyTeachingPlanHwById(dailyTeachingPlanId);

  return useGetDailyTeachingPlanHwByPlanIdAndAllotmentId({allotmentId, dailyTeachingPlanId});
}

export const useGetStudentsForTeachingPlan = ({ classId, teachingPlanId }) => {
  const academicYear = getCurrentAcademicYear();
  return useQuery({
    queryKey: [
      APIs.STUDENT_HOMEWORK__V2__NOT_ASSIGNED,
      classId,
      teachingPlanId,
      academicYear,
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        APIs.STUDENT_HOMEWORK__V2__NOT_ASSIGNED,
        {
          params: {
            classId,
            dailyTeachingPlanId: teachingPlanId,
            academicYear,
          },
        },
      );

      return data?.data;
    },
    enabled: !!classId && !!teachingPlanId,
  });
};

export const useAssignHomeworkV2 = () => {
  return useAppMutation({
    mutationFn: async (assignData) => {
      const { data } = await axiosInstance.post(
        APIs.STUDENT_HOMEWORK__V2__ASSIGN_MULTIPLE,
        assignData,
      );
      return data;
    },
    successMsg: "Homework assigned successfully",
    errorMsg: "Failed to assign homework",
  });
};

export const useGetForwardedHomeworkListV2 = ({ filters, status }) => {
  const params = { size: limit, homeworkAllotmentStatus: "FORWARDED" };

  if (status) {
    params.homeworkAllotmentStatus = status;
  }
  if(filters?.homeworkAllotmentStatusForParent){
    params.homeworkAllotmentStatusForParent = filters?.homeworkAllotmentStatusForParent;
  }
  if(filters?.isDistinct){
    params.isDistinct = filters.isDistinct
  }
  if (filters?.date) {
    params.date = filters.date;
  }
  if (filters.academicYear) {
    params.academicYear = filters.academicYear;
  }
  if (filters.classId) {
    params.classId = filters.classId;
  }
  if (filters.syllabusId) {
    params.syllabusId = filters.syllabusId;
  }
  if (filters.activityId) {
    params.activityId = filters.activityId;
  }
  if (filters.subjectId) {
    params.subjectId = filters.subjectId;
  }
  if (filters.topicId) {
    params.topicId = filters.topicId;
  }
  if(filters.sortBy){
    params.sortedBy = filters.sortBy;
  }

  const query = useInfiniteQuery({
    queryKey: [APIs.HOMEWORK__V2__ALL_FORWARDED, status, filters],

    queryFn: async ({ pageParam = 0 }) => {
      params.page = pageParam;

      const { data } = await axiosInstance.get(
        APIs.HOMEWORK__V2__ALL_FORWARDED,
        {
          params,
          paramsSerializer: (params) =>
            new URLSearchParams(params).toString().replace(/\+/g, "%20"),
        },
      );

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

export const useGetAllottedStudentListV2 = ({
  allotmentId,
  assignmentStatus,
  homeworkAllotmentStatus,
}) => {
  const [page, setPage] = useState(0);
  const params = {
    page,
    size: 200,
    allotmentId,
    assignmentStatus,
    homeworkAllotmentStatus,
  };

  const stringParams = JSON.stringify(params);

  const query = useQuery({
    queryKey: [APIs.STUDENT_HOMEWORK__V2__ALL, stringParams],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.STUDENT_HOMEWORK__V2__ALL, {
        params,
      });

      return {
        data: data.data.content,
        totalPages: data?.data?.totalPages,
      };
    },
    enabled: !!allotmentId,
  });

  const totalPages = query?.data?.totalPages;
  const pagination = {
    totalPages,
    page,
    hasPreviousPage: page > 0,
    hasNextPage: page < totalPages - 1,
  };

  const nextPage = () => pagination?.hasNextPage && setPage((p) => p + 1);

  const prevPage = () => pagination?.hasPreviousPage && setPage((p) => p - 1);

  return {
    ...query,
    ...pagination,
    setPage,
    nextPage,
    prevPage,
  };
};

export const useGetStudentHomeworkListV2Parent = ({
  filters,
  studentId,
  homeworkAllotmentStatus,
}) => {
  const academicYear = getCurrentAcademicYear();
  const params = { size: 10, studentId, academicYear };

  if (homeworkAllotmentStatus) {
    params.homeworkAllotmentStatus = homeworkAllotmentStatus;
  }

  if (filters.classId) {
    params.classId = filters.classId;
  }

  const query = useInfiniteQuery({
    queryKey: [
      APIs.STUDENT_HOMEWORK__V2__PARENT__ALL,
      params,
    ],

    queryFn: async ({ pageParam = 0 }) => {
      params.page = pageParam;

      const { data } = await axiosInstance.get(APIs.STUDENT_HOMEWORK__V2__PARENT__ALL, {
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

export const useGetStudentHomeworkListV2 = ({
  filters,
  studentId,
  homeworkAllotmentStatus,
}) => {
  const academicYear = getCurrentAcademicYear();
  const params = { size: 200, studentId, academicYear };

  if (homeworkAllotmentStatus) {
    params.homeworkAllotmentStatus = homeworkAllotmentStatus;
  }

  if (filters.classId) {
    params.classId = filters.classId;
  }

  const query = useInfiniteQuery({
    queryKey: [
      APIs.STUDENT_HOMEWORK__V2__ALL,
      studentId,
      homeworkAllotmentStatus,
      filters,
    ],

    queryFn: async ({ pageParam = 0 }) => {
      params.page = pageParam;

      const { data } = await axiosInstance.get(APIs.STUDENT_HOMEWORK__V2__ALL, {
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

export const useGetStudentHomeworkDetails = ({ assignmentId }) => {
  const [page, setPage] = useState(0);
  const params = { page, size: 200, assignmentId };

  const stringParams = JSON.stringify(params);

  const query = useQuery({
    queryKey: [APIs.STUDENT_HOMEWORK__V2__ALL, stringParams],
    queryFn: async () => {
      const { data } = await axiosInstance.get(APIs.STUDENT_HOMEWORK__V2__ALL, {
        params,
      });

      return {
        data: data.data.content,
        totalPages: data?.data?.totalPages,
      };
    },
    enabled: !!assignmentId,
  });

  const totalPages = query?.data?.totalPages;
  const pagination = {
    totalPages,
    page,
    hasPreviousPage: page > 0,
    hasNextPage: page < totalPages - 1,
  };

  const nextPage = () => pagination?.hasNextPage && setPage((p) => p + 1);

  const prevPage = () => pagination?.hasPreviousPage && setPage((p) => p - 1);

  return {
    ...query,
    ...pagination,
    setPage,
    nextPage,
    prevPage,
  };
};

export const useMarkHomeworkAsComplete = () => {
  return useAppMutation({
    mutationFn: async (body) => {
      const { data } = await axiosInstance.put(
        APIs.STUDENT_HOMEWORK__COMPLETION_STATUS,body
      );
      return data;
    },
    successMsg: "Homework marked as complete",
    errorMsg: "Failed to mark homework",
    invalidateQueryKeys: [APIs.HOMEWORK__V2__ALL_FORWARDED],
  });
}