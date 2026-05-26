import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "../reactQueryConfig/hooks/useAppMutation";
import { APIs, attendance_APIs } from "../utills/apis";
import axiosInstance from "../utills/axiosInstance";
export const useCreateAttendance = () => {
    return useAppMutation({
        mutationFn: (payload) => axiosInstance.post(attendance_APIs.CREATE_ATTENDANCE_STUDENT_ID, payload),
        successMsg: "Attendance saved successfully",
        errorMsg: "Failed to save Attendance",
        invalidateQueryKeys: [["attendance"]]
    });
}


export const useGetAttendance = ( classId,attendanceDate) => {
  return useQuery({
    queryKey: ["attendance",classId, attendanceDate],

    queryFn: async () => {
      const { data } = await axiosInstance.get(
        attendance_APIs.GET_ATTENDANCE_BY_DATE,
        {
          params: {
            ...(classId && { classId }),
            attendanceDate
          }
        }
      );
      console.log("data from useGetAttendance",data)
      return data;
    },

    enabled: Boolean(attendanceDate) && Boolean(classId), 
  });
};




export const useGetStudentByClass = (classId) => {
  return useQuery({
    queryKey: ["student", classId],

    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `${APIs.STUDENTS__CLASS_ID}/${classId}`
      );
      return data;
    },

    select: (response) => response?.data ?? [], // ✅ OBJECT → ARRAY
    enabled: !!classId,
  });
};




export const useGetStudentAttendanceByStudentId = (
  studentId,
  fromAttendanceDate,
  toAttendanceDate,
  attendanceStatus
) => {
  return useQuery({
    queryKey: ["attendance",studentId,fromAttendanceDate,toAttendanceDate,attendanceStatus ],

    queryFn: async () => {
      const { data } = await axiosInstance.get(
        attendance_APIs.GET_ATTENDANCE_BY_STUDENTID,
        {
          params: {
            studentId,
            fromAttendanceDate,
            toAttendanceDate,
            ...(attendanceStatus && { attendanceStatus })
          }
        }
      );
      return data;
    },

    enabled: !!studentId && !!fromAttendanceDate,
  });
};

export const useGetStudentAttendanceByClassId = (
  classId,
  academicYear ,
  month
) => {
  return useQuery({
    queryKey: ["attendance",classId,academicYear ,month ],

    queryFn: async () => {
      const { data } = await axiosInstance.get(
        attendance_APIs.GET_ATTENDANCE_BY_CLASSID,
        {
          params: {
            classId,
            academicYear ,
            month,
            
          }
        }
      );
      return data;
    },

    enabled: !!classId && !!academicYear  && !!month,
  });
};

