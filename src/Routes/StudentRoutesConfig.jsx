import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
// import StudentDashboard from "../pages/student/StudentDashboard";

import Events from "../pages/student/Events";
import Syllabus from "../pages/student/Syllabus";
import Assignments from "../pages/student/Assignments";
import Teachers from "../pages/student/Teachers";
import StudentProfile from "../pages/student/StudentProfile";
import Timetable from "../pages/student/Timetable";
import ReportsPanel from "../components/ReportsPanel";
import AdmissionForm from "../pages/student/AdmissionForm";

import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
// import { ROLES } from "../utills/constants";
import AdmissionFormProvider from "../context/AdmissionFormContext";
import Layout from "../components/Layout";
// import ThemeSetting from "../pages/admin/ThemeSetting";
import AdmissionFormView from "../pages/student/AdmissionFormView";
import StudentFeeStructure from "../pages/student/StudentFeeStructure";
import ExamPage from "../pages/student/ExamPage";
import StudentResult from "../pages/student/StudentResult";
import StudentAttendance from "../pages/student/StudentAttendance";
import NotificationList from "../pages/student/NotificationList";
import NotificationDetail from "../pages/student/NotificationDetails";
import StudentAttendanceCalender from "../components/Attendance/StudentAttendanceCalender";
import StudentClassActivity from "../pages/student/homework/StudentClassActivity";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentSyllabus from "../pages/student/StudentSyllabus";


const StudentHomeworkList = lazy(
  () => import("../pages/student/homework/StudentHomeworkList"),
);
const StudentHomeworkView = lazy(
  () => import("../pages/student/homework/StudentHomeworkView"),
);
export const STUDENT_ROUTES = [
  { path: "dashboard", element: <StudentDashboard />, label: "Dashboard" },
  { path: "fees", element: <StudentFeeStructure />, label: "Fees" },
  { path: "profile", element: <StudentProfile />, label: "Profile" },
  { path: "timetable", element: <Timetable />, label: "Timetable" },
  // { path: "syllabus", element: <Syllabus />, label: "Syllabus" },
  { path: "syllabus", element: <StudentSyllabus />, label: "Syllabus" },
  { path: "assignments", element: <Assignments />, label: "Assignments" },
  { path: "events", element: <Events />, label: "Events" },
  { path: "teachers", element: <Teachers />, label: "Teachers" },
  { path: "reports", element: <ReportsPanel />, label: "Reports" },
  { path: "exam", element: <ExamPage />, label: "Exam" },
  { path: "results", element: <StudentResult />, label: "Results" },
  { path: "attendance", element: <StudentAttendanceCalender />, label: "Attendance" },
  // { path: "admission-form-view", element: <AdmissionFormView />, label: "Admission Form View" },
  // { path: "theme-setting", element: <ThemeSetting />, label: "Theme Setting" },

  // {
  //   path: "admission-form",
  //   element: (
  //     <AdmissionFormProvider>
  //       <AdmissionForm />
  //     </AdmissionFormProvider>
  //   ),
  //   label: "Admission Form"
  // },

  { path: "homework-list", element: <StudentHomeworkList />, label: "Homework List" },
  { path: "homework-list/view/:title", element: <StudentHomeworkView />, label: "Homework View" },

  { path: "class-activity", element: <StudentClassActivity />, label: "Class Activity" },
  { path: "class-activity/view/:title", element: <StudentHomeworkView />, label: "Class Activity View" },

  { path: "notifications", element: <NotificationList />, label: "Notifications" },
  { path: "notifications/:title", element: <NotificationDetail />, label: "Notification Detail" },
];