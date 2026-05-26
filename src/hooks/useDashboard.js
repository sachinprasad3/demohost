import { useQuery } from "@tanstack/react-query";
import { getAttendanceSummary,getDailyLessonPlanSummary,getBirthdayReport, getFinanceDashboard } from "../services/dashboard.service";

export const useDashboardAttendanceSummary = (date) => {
  return useQuery({
    queryKey: ["dashboard-attendance-summary", date],
    queryFn: () => getAttendanceSummary(date),
    enabled: !!date,
  });
};

export const useDashboardDailyLessonPlanSummary = (date) => {
  return useQuery({
    queryKey: ["dashboard-daily-lesson-plan-summary", date],
    queryFn: () => getDailyLessonPlanSummary(date),
    enabled: !!date,
  });
};

export const useDashboardBirthdayReport = () => {
  return useQuery({
    queryKey: ["dashboard-birthday-report"],
    queryFn: getBirthdayReport,
  });
};


export const useDashboardFinanceReport = () => {
  return useQuery({
    queryKey: ["dashboard-finance-report"],
    queryFn: getFinanceDashboard,
  });
};
