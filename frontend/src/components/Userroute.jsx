import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserRoute = ({ children }) => {
  const { user, token } = useAuth();

  if (token && user?.rol === "usuario") {
    return children;
  }

  return <Navigate to="/login" />;
};

export default UserRoute;