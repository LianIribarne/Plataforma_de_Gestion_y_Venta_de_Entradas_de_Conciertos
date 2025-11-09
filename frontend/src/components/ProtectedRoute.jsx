// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const userRol = localStorage.getItem('rol');

  if (!userRol) {
    // No está logueado
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRol)) {
    // Rol no autorizado
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
