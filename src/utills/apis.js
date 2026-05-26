/**
 * __ => /
 * _ => - & camal case (e.g. classId => class-id)
 * Used to define API endpoints in a structured manner
 * Example: SHARE__ALL_SCHOOLE_ID_WITH_NAME translates to /api/v1/share/all-school-id-with-name
 */

export const APIs = {
  SHARE__ALL_SCHOOLE_ID_WITH_NAME: "/api/v1/share/all-school-id-with-name", // Get the list of classes
  SHARE__ALL_ACADEMIC_YEARS: "/api/v1/share/all-academic-years", // Get the list of academic years
  SYLLABUS__ACADEMIC_YEAR__CLASS_ID: "/api/v1/syllabus/academic-year/class-id", // Get syllabus by class and academic year
  SHARE__ALL_ACTIVITY_TYPES: "/api/v1/share/all-activity-types", // Get the list of activity types
  SYLLABUS_TOPICS__SYLLABUS_ID__SUBJECT_ID:
    "/api/v1/syllabus-topics/syllabus-id/subject-id", // Get topics by syllabus id and subject id
  SHARE__ALL_SUBJECT_ID_WITH_NAME: "/api/v1/share/all-subject-id-with-name", // Get subjects
  SYLLABUS_TOPICS__SYLLABUS_ID: "/api/v1/syllabus-topics/syllabus-id/", // Get topics by syllabus id
  SYLLABUS_TOPICS__ALL_SYLLABUS_ID__SUBJECT_ID:
    "/api/v1/syllabus-topics/all/syllabus-id/subject-id", // Get topics by syllabus id and subject id
  DAILY_ACTIVITIES__TOPIC_ID__SUBJECT_ID__CLASS_ID:
    "/api/v1/daily-activities/topic-id/subject-id/class-id", // Get daily activities by topic id, subject id and class id
  SUBJECT__ACTIVESUBJECT: "/api/v1/subject/activesubject",
  SHARE__TEACHER_INFO__CLASS_ID: "/api/v1/share/teacher-info/class-id/", // Get teachers by class id
  HOMEWORK__CREATE_HOMEWORK: "/api/v1/homework/create", // Create homework
  HOMEWORK__ALL: "/api/v1/homework/all", // Get homework list with pagination
  HOMEWORK__HOMEWORK_ID: "/api/v1/homework/homeworkId", // Get, update or delete homework by id

  ACADEMIC_YEAR: "/api/academicYear", // Create Academic Year APIs
  ACADEMIC_TERM: "/api/academicTerm", // Create or get Academic Term APIs

  BOOK__ALL: "/api/v1/book/all", // Get all books
  BOOK__SAVE_BOOK_RECORD: "/api/v1/book/save-book-record", // Save book record
  BOOK: "/api/v1/book", // Update or delete book by id

  SUBJECT__ALL: "/api/v1/subject/all", // Get all subjects
  SUBJECT: "/api/v1/subject", //  Delete subject by id
  SUBJECT__CREATE: "/api/v1/subject/create", // Create or Update subject

  STUDENTS__CLASS_ID: "/api/students/classId",
  STUDENT_HOMEWORK__ASSIGN_MULTIPLE: "/api/v1/student-homework/assign-multiple",
  STUDENT_HOMEWORK__ALL: "/api/v1/student-homework/all",
  HOMEWORK__ALL_ALLOTED: "/api/v1/homework/all-alloted",
  STUDENT_HOMEWORK__NOT_ASSIGNED: "api/v1/student-homework/not-assigned",
  TEACHER__DETAIL:`/api/v1/staff`,
  PUSH_NOTIFICATION__TEMPLATE__CODE_NAME:
    "/api/push-notification/template/code-name",
  PUSH_NOTIFICATION__TEMPLATE: "/api/push-notification/template/",
  STUDENTS__TRIGGER_PUSH_NOTIFICATION:
    "/api/students/trigger-push-notification",
  PARENT_NOTIFICATION: "/api/parent-notification/",
  CLASS__GET_ALL_CLASSES_BY_ACADEMIC_YEAR:
    "/api/v1/class/getAllClassesByAcademicYear",
  HOMEWORK__ALL_FORWARDED: "/api/v1/homework/all-forwarded",
  HOMEWORK__UPDATE_STATUS__HOMEWORK_ID: "/api/v1/homework/update-status/homeworkId",
  STUDENT_HOMEWORK__FORWARDED_HOMEWORK__ACTION: "/api/v1/student-homework/forwarded-homework/action",
  HOMEWORK__ALLOTMENT_ID: "/api/v1/homework/allotmentId/",
  THEME: "/api/v1/theme/",
  DAILYLESSIONPLAN: "/api/v1/dailylessionplan/",
  ALL_SECTION_ID_WITH_NAME: "/api/v1/share/all-section-id-with-name",
  DAILYLESSIONPLAN__ID:"/api/v1/dailylessionplan/id",
  DAILYLESSIONPLAN__SEARCHDATA: "/api/v1/dailylessionplan/searchdata",
  THEME__UPLOAD: "/api/v1/theme/upload",
  DAILYLESSIONPLAN__ALL_HOMEWORKS: "/api/v1/dailylessionplan/all-homeworks",
  DAILYLESSIONPLAN__HOMEWORK:"/api/v1/dailylessionplan/homework/",
  STUDENT_HOMEWORK__V2__NOT_ASSIGNED: "/api/v1/student-homework/v2/not-assigned",
  STUDENT_HOMEWORK__V2__ASSIGN_MULTIPLE: "/api/v1/student-homework/v2/assign-multiple",
  DAILY_LESSION_PLAN_MASTER: "/api/v1/dailylessionplanmaster/",
  DAILY_LESSION_PLAN_MASTER__MASTER_SEARCH_DATA: "/api/v1/dailylessionplanmaster/mastersearchdata",
  DAILY_LESSION_PLAN_MASTER__ID: "/api/v1/dailylessionplanmaster/id",
  HOMEWORK__V2__ALL_FORWARDED: "/api/v1/homework/v2/all-forwarded",
  STUDENT_HOMEWORK__V2__ALL: "/api/v1/student-homework/V2/all",
  STUDENT_HOMEWORK__UPDATE_ASSIGN_HOMEWORK: "/api/v1/student-homework/update-assign-homework",
  STUDENT_HOMEWORK__FORMWARDED_HOMEWORK__APPROVE: "/api/v1/student-homework/forwarded-homework/approve",
  STUDENT_HOMEWORK__FORMWARDED_HOMEWORK__REJECT: "/api/v1/student-homework/forwarded-homework/reject",
  THEME__CLASS_ID: "/api/v1/theme/classid",
  ACADEMIC_YEAR__ALL__ACTIVE: "/api/academicYear/all/active",
  SUPER_SYLLABUS_MASTER: "/api/v1/supersyllabusmaster/",
  SYLLABUS__ACADEMIC_YEAR: "/api/v1/syllabus/academic-year",
  STUDENT_HOMEWORK__V2__PARENT__ALL: "/api/v1/student-homework/V2/parent/all",
  VIEW__FILE: "/api/v1/view/download/file",
  DAILY_LESSION_PLAN__PLAN_NOT_ASSIGNED_TO_ALL: "/api/v1/dailylessionplan/plan-not-assigned-to-all",
  DAILY_LESSION_PLAN__PARENT__HOMEWORK: "/api/v1/dailylessionplan/parent/homework",
  NOTIFCATION_IMAGE: "/api/v1/notificationimage/",
  STUDENT_HOMEWORK__COMPLETION_STATUS: "/api/v1/student-homework/completion-status",
  DAILY_LESSION_PLAN__TOTAL_DAYS: "/api/v1/dailylessionplan/total-days",
  DAILY_LESSION_PLAN_MASTER__TOTAL_DAYS: "/api/v1/dailylessionplanmaster/total-days"
};

export const attendance_APIs = {
  CREATE_ATTENDANCE_STUDENT_ID: "/api/attendance/create",
  GET_ATTENDANCE_BY_DATE:"/api/attendance/studentAttendance",
  GET_ATTENDANCE_BY_STUDENTID: "/api/attendance",
   GET_ATTENDANCE_BY_CLASSID: "/api/attendance/attendanceSummaryByYearMonth"

}
export const admission_APIs = {
 GET_ALL_STUDENT_OF_PARENT: "/api/v1/user/all/student-id/candidate-id",
 GET_ALL_PARENTS_USER_ID: "/api/v1/auth/getAllParents"
 
}
export const whats_app_APIs = {
  GET_WHATS_APP_LOGIN_URL: "/api/whatsapp/login",
  GET_WHATS_APP_LOGIN_RECORDS: "/api/whatsapp/",
  GET_WHATS_APP_LOGOUT:"/api/whatsapp/log-out"
}


export const dashboard_APIs = {
  GET_ATTENDANCE_SUMMARY: "/api/attendance/summary-report",
  GET_DAILY_LESSON_PLAN_SUMMARY: "/api/v1/dashboard/summaryreport",
  // GET_BIRTHDAY_REPORT: "/api/v1/dashboard/birthdayreport",
  GET_BIRTHDAY_REPORT: "/api/v1/dashboard/dashboard",
  GET_FINANCE_DASHBOARD: "/api/v1/dashboard/master-get",
};

export const monthlySyllabus_APIs = {
  CREATE_MONTHLY_SYLLABUS: "/api/v1/monthly-syllabus/create",
  GET_ALL: "/api/v1/monthly-syllabus/all",
  DELETE_MONTHLY_PLAN: "/api/v1/monthly-syllabus/id"
};



export const banner_APIs = {
  SAVE_BANNERS: "/api/v1/banners/",
  GET_ALL_BANNERS: "/api/v1/banners/",
  GET_BANNERS_BY_ID: "/api/v1/banners/id",
  DELETE_BANNER: "/api/v1/banners/id"
};