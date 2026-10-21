import { useContext } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  if (!token || !user) return <Navigate to="/login" replace />;
  return children;
};

ProtectedRoute.propTypes = { children: PropTypes.node.isRequired };
export default ProtectedRoute;