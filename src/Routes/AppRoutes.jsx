// AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "../auth/Login";
import AdminRoutes from "./AdminRoutes";
import TeacherRoutes from "./TeacherRoutes";
// import StudentRoutes from "./StudentRoutes";
import { useAuth } from "../context/AuthContext"; 
import Signup from "../auth/Signup";
import PublicRoute from "./PublicRoute";
import Unauthorized from "../pages/Unauthorized";
import Layout from "../components/Layout";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "../auth/ForgotPassword";
import AdmissionEnquiryForm from "../pages/student/AdmissionEnquiryForm";
import { PopupProvider } from "../context/PopupContext"; 
import { TeacherProvider } from "../context/TeacherProvider";
import { LoaderProvider } from "../context/LoaderContext";
import StudentRoutes from "./StudentRoutes";
import AppDownload from "../pages/student/AppDownload";
const AppRoutes = ({ logoUrl }) => {
  const { user, loading,isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }
 
  if (!user || !isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={ <PublicRoute> <Login /> </PublicRoute> } />
        <Route path="/signup" element={ <PublicRoute> <Signup /> </PublicRoute> } />
      <Route path="/forget-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/admission-enquiry" element={<PublicRoute><AdmissionEnquiryForm /></PublicRoute>} />
      <Route path="/app-download" element={<PublicRoute><AppDownload /></PublicRoute>} />

        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
const getDefaultPath = () => {
    const paths = {
      OWNER: "/admin/dashboard",
      ADMIN: "/admin/dashboard",
      TEACHER: "/teacher/dashboard",
      STUDENT: "/student/dashboard",
      PARENT: "/student/dashboard"
    };
    return paths[user.role] || "/login";
  };
  // logged-in user routes
  return (
   
<Routes>
  <Route path="/unauthorized" element={<Unauthorized />} />

  {/* <Route element={ <PopupProvider>  <Layout logoUrl={logoUrl} /> </PopupProvider> }> */}
  <Route element={ <LoaderProvider> <PopupProvider> <Layout logoUrl={logoUrl} /> </PopupProvider> </LoaderProvider> }>
    <Route element={<ProtectedRoute allowedRoles={["PARENT", "STUDENT"]} />}>
      <Route path="/student/*" element={<Outlet />}>
        {StudentRoutes()}
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
      <Route path="/teacher/*" element={<TeacherProvider><Outlet /></TeacherProvider>}>
        {TeacherRoutes()}
      </Route>
    </Route>

        {/* <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
      <Route path="/admin/*" element={<Outlet />}>
        {AdminRoutes()}
      </Route>
    </Route> */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "OWNER"]} />}>
          <Route path="/admin/*" element={<Outlet />}>
            {AdminRoutes()}
          </Route>
        </Route>

  </Route>

  <Route index element={<Navigate to={getDefaultPath()} replace />} />
  <Route path="*" element={<Navigate to={getDefaultPath()} replace />} />
</Routes>

  );
};

export default AppRoutes;