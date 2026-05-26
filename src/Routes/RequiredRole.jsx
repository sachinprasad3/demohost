// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const RequireRole = ({ allowed, children }) => {
//   const { user } = useAuth();

//   if (!user) return <Navigate to="/login" replace />;
//   if (!allowed.includes(user.role))
//     return <Navigate to="/unauthorized" replace />;

//   return children;
// };

// export default RequireRole;
