import { dashboard_APIs } from "../utills/apis";
import axiosInstance from "../utills/axiosInstance";

export const getAttendanceSummary = async (date) => {
  const response = await axiosInstance.get(
    dashboard_APIs.GET_ATTENDANCE_SUMMARY,
    { params: { date } }
  );

  return response.data;
};


export const getDailyLessonPlanSummary = async (date) => {
  const response = await axiosInstance.get(
    dashboard_APIs.GET_DAILY_LESSON_PLAN_SUMMARY,
    { params: { date } }
  );

  return response.data;
};

export const getBirthdayReport = async () => {
  const response = await axiosInstance.get(
    dashboard_APIs.GET_BIRTHDAY_REPORT,
  );

  return response.data;
};

export const getFinanceDashboard = async () => {
  const response = await axiosInstance.get(
    dashboard_APIs.GET_FINANCE_DASHBOARD
  );

  return response.data;
};


