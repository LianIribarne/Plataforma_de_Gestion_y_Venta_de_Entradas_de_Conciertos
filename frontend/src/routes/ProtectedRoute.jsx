import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // No logueado → redirige a login
  if (!user) return <Navigate to="/login" replace />;

  // Rol no permitido → redirige a página de "no autorizado" o al login
  if (allowedRoles && allowedRoles.includes(user.rol)) {
    return <Navigate to="conciertos" replace />;
  }

  // Renderiza children si existen, si no usa Outlet para rutas anidadas
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
