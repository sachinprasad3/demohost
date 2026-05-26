import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleBasedRedirect } from "../utills/constants";

export default function PublicRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={getRoleBasedRedirect(user.role)} replace />;
  }

  return children;
}
