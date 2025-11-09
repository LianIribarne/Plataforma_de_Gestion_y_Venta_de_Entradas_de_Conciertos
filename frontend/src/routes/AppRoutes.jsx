import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Eventos from '../pages/Eventos';
import EventoInfo from '../pages/EventoInfo';
import CrearEvento from '../pages/CrearEvento';
import Usuarios from '../pages/Usuarios';
import CrearOrganizador from '../pages/CrearOrganizador';
import Pagos from '../pages/Pagos';
import Entradas from '../pages/Entradas';
import Register from '../pages/Register';
import Login from '../pages/Login';
// import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/eventos" replace />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="/eventos/:slug" element={<EventoInfo />} />
        <Route path="/eventos/crear_evento" element={<CrearEvento />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/usuarios/crear_organizador" element={<CrearOrganizador />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="entradas" element={<Entradas />} />
      </Route>
    </Routes>
  );
}
