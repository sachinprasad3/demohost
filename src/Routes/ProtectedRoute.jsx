



import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();

 
  if (!isAuthenticated) return <Navigate to="/login" />;


  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;

  
  return children ? children : <Outlet />;
};

export default ProtectedRoute;

