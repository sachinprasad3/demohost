// import React, { lazy, Suspense } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

import { Navigate, Route } from "react-router-dom";
import { STUDENT_ROUTES } from "./StudentRoutesConfig";
import { Suspense } from "react";
import { useStudent } from "../context/StudentContext";

// // Pages
// // import StudentDashboard from "../pages/student/StudentDashboard";

// import Events from "../pages/student/Events";
// import Syllabus from "../pages/student/Syllabus";
// import Assignments from "../pages/student/Assignments";
// import Teachers from "../pages/student/Teachers";
// import StudentProfile from "../pages/student/StudentProfile";
// import Timetable from "../pages/student/Timetable";
// import ReportsPanel from "../components/ReportsPanel";
// import AdmissionForm from "../pages/student/AdmissionForm";

// import { useAuth } from "../context/AuthContext";
// import ProtectedRoute from "./ProtectedRoute";
// // import { ROLES } from "../utills/constants";
// import AdmissionFormProvider from "../context/AdmissionFormContext";
// import Layout from "../components/Layout";
// import ThemeSetting from "../pages/admin/ThemeSetting";
// import AdmissionFormView from "../pages/student/AdmissionFormView";
// import StudentFeeStructure from "../pages/student/StudentFeeStructure";
// import ExamPage from "../pages/student/ExamPage";
// import StudentResult from "../pages/student/StudentResult";
// import StudentAttendance from "../pages/student/StudentAttendance";
// import NotificationList from "../pages/student/NotificationList";
// import NotificationDetail from "../pages/student/NotificationDetails";
// import StudentAttendanceCalender from "../components/Attendance/StudentAttendanceCalender";
// import StudentClassActivity from "../pages/student/homework/StudentClassActivity";
// import StudentDashboard from "../pages/student/StudentDashboard";


// const StudentHomeworkList = lazy(
//   () => import("../pages/student/homework/StudentHomeworkList"),
// );
// const StudentHomeworkView = lazy(
//   () => import("../pages/student/homework/StudentHomeworkView"),
// );
// export const STUDENT_ROUTES = [
//   { path: "dashboard", element: <StudentDashboard />, label: "Dashboard" },
//   { path: "fees", element: <StudentFeeStructure />, label: "Fees" },
//   { path: "profile", element: <StudentProfile />, label: "Profile" },
//   { path: "timetable", element: <Timetable />, label: "Timetable" },
//   { path: "syllabus", element: <Syllabus />, label: "Syllabus" },
//   { path: "assignments", element: <Assignments />, label: "Assignments" },
//   { path: "events", element: <Events />, label: "Events" },
//   { path: "teachers", element: <Teachers />, label: "Teachers" },
//   { path: "reports", element: <ReportsPanel />, label: "Reports" },
//   { path: "exam", element: <ExamPage />, label: "Exam" },
//   { path: "results", element: <StudentResult />, label: "Results" },
//   { path: "attendance", element: <StudentAttendanceCalender />, label: "Attendance" },
//   { path: "admission-form-view", element: <AdmissionFormView />, label: "Admission Form View" },
//   { path: "theme-setting", element: <ThemeSetting />, label: "Theme Setting" },

//   {
//     path: "admission-form",
//     element: (
//       <AdmissionFormProvider>
//         <AdmissionForm />
//       </AdmissionFormProvider>
//     ),
//     label: "Admission Form"
//   },

//   { path: "homework-list", element: <StudentHomeworkList />, label: "Homework List" },
//   { path: "homework-list/view/:title", element: <StudentHomeworkView />, label: "Homework View" },

//   { path: "class-activity", element: <StudentClassActivity />, label: "Class Activity" },
//   { path: "class-activity/view/:title", element: <StudentHomeworkView />, label: "Class Activity View" },

//   { path: "notifications", element: <NotificationList />, label: "Notifications" },
//   { path: "notifications/:title", element: <NotificationDetail />, label: "Notification Detail" },
// ];
// const StudentRoutes = () => {
//   return (
//     <>
//       <Route index element={<Navigate to="dashboard" replace />} />
//       <Route path="dashboard" element={<StudentDashboard />} />
//       <Route path="fees" element={<StudentFeeStructure />} />
//       <Route path="profile" element={<StudentProfile />} />
//       <Route path="timetable" element={<Timetable />} />
//       <Route path="syllabus" element={<Syllabus />} />
//       <Route path="assignments" element={<Assignments />} />
//       <Route path="events" element={<Events />} />
//       <Route path="teachers" element={<Teachers />} />
//       <Route path="reports" element={<ReportsPanel />} />
//       <Route path="exam" element={<ExamPage />} />
//       <Route path="results" element={<StudentResult />} />
//     <Route path="attendance" element={<StudentAttendanceCalender/>} />
//       <Route path="admission-form-view" element={<AdmissionFormView />} />
//       <Route path="theme-setting" element={<ThemeSetting />} />

//       <Route
//         path="admission-form"
//         element={
//           <AdmissionFormProvider>
//             <AdmissionForm />
//           </AdmissionFormProvider>
//         }
//       />

//       <Route path="homework-list" element={<StudentHomeworkList />} />
//       <Route
//         path="homework-list/view/:title"
//         element={<StudentHomeworkView />}
//       />
//       <Route path="class-activity" element={<StudentClassActivity />} />
//       <Route
//         path="class-activity/view/:title"
//         element={<StudentHomeworkView />}
//       />
//       <Route path="notifications" element={<NotificationList />} />
//       <Route path="notifications/:title" element={<NotificationDetail />} />
//     </>
//   );
// };
const StudentRoutes = () => {
  const {activeStudent} = useStudent()
  const FilteredStudentRoutes = activeStudent?.data?.status === "INACTIVE" ? STUDENT_ROUTES.filter((route) => route.path === "dashboard") : STUDENT_ROUTES
  return(
    <>
          <Route index element={<Navigate to="dashboard" replace />} />
    
    {FilteredStudentRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <Suspense fallback={<div>Loading...</div>}>
              {route.element}
            </Suspense>
          }
        />
      ))}
      </>
  )
}

export default StudentRoutes;
