// // routes/TeacherRoutes.jsx
// import React, { lazy } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import ProtectedRoute from "./ProtectedRoute";
// import DailyActivityUpload from "../pages/teacher/DailyActivityUpload";
// import TeacherDashboard from "../pages/teacher/TeacherDashboard";
// // import TeacherLessonPlans from "../pages/teacher/TeacherLessonPlans";
// import TeacherDailyActivities from "../pages/teacher/TeacherDailyActivities";
// import TeacherProfile from "../pages/teacher/TeacherProfile";
// const HomeworkList = lazy(
//   () => import("../pages/teacher/homework/HomeworkList"),
// );
// const TeacherHomeworkView = lazy(
//   () => import("../pages/teacher/homework/TeacherHomeworkView"),
// );
// import Events from "../pages/student/Events";
// import StudentAttendance from "../pages/teacher/MarkStudentAttendance";
// import MarkStudentAttendance from "../pages/teacher/MarkStudentAttendance";
// import StudentAttendanceHistory from "../pages/admin/StudentAttendanceHistory";
// import AcademicPlanView from "../pages/admin/AcademicPlanView";
// const AllottedHomeworkView = lazy(
//   () => import("../pages/teacher/homework/AllottedHomeworkView"),
// );
// const AllottedHomework = lazy(
//   () => import("../pages/teacher/homework/AllottedHomework"),
// );

import { Navigate, Route } from "react-router-dom";
import { TEACHER_ROUTES } from "./TeacherRoutesConfig";

// export const TEACHER_ROUTES = [
//   { path: "dashboard", element: <TeacherDashboard />, label: "Dashboard" },
//   { path: "profile", element: <TeacherProfile />, label: "Profile" },

//   { path: "mark-attendance", element: <MarkStudentAttendance />, label: "Mark Attendance" },
//   { path: "attendance-History", element: <StudentAttendanceHistory />, label: "Attendance History" },

//   { path: "daily-activity-upload", element: <DailyActivityUpload />, label: "Daily Activity Upload" },
//   { path: "activities-list", element: <TeacherDailyActivities />, label: "Activities List" },

//   { path: "homework-list", element: <HomeworkList />, label: "Homework List" },
//   { path: "homework/view/:id", element: <TeacherHomeworkView />, label: "Homework View" },

//   { path: "allotted-homework", element: <AllottedHomework />, label: "Allotted Homework" },
//   { path: "allotted-homework/view/:title", element: <AllottedHomeworkView />, label: "Allotted Homework View" },

//   { path: "events", element: <Events />, label: "Events" },

//   { path: "view-planner", element: <AcademicPlanView />, label: "View Planner" },
// ];

// export default function TeacherRoutes() {

//   return (
//     <>
//       <Route index element={<Navigate to="dashboard" replace />} /> 
//       <Route path="dashboard" element={<TeacherDashboard />} />
//       <Route path="profile" element={<TeacherProfile />} />
//       {/* <Route path="mark-attendence" element={<StudentAttendance  />} /> */}
//       <Route path="mark-attendance" element={<MarkStudentAttendance  />} />
//       <Route path="attendance-History" element={<StudentAttendanceHistory  />} />
//       <Route path="daily-activity-upload" element={<DailyActivityUpload  />} />
//       {/* <Route path="lesson-plan" element={<TeacherLessonPlans  />} /> */}
//       <Route path="activities-list" element={<TeacherDailyActivities  />} />
//       <Route path="homework-list" element={<HomeworkList />} />
//       <Route path="homework/view/:id" element={<TeacherHomeworkView />} />
//       <Route path="allotted-homework" element={<AllottedHomework />} />
//       <Route path="allotted-homework/view/:title" element={<AllottedHomeworkView />} />
//       <Route path="events" element={<Events />} />
//       <Route path="view-planner" element={<AcademicPlanView  />} />

//     </>
//   );
// }

export default function TeacherRoutes() {
  return (
    <>
      <Route index element={<Navigate to="dashboard" replace />} />

      {TEACHER_ROUTES.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}
    </>
  );
}


