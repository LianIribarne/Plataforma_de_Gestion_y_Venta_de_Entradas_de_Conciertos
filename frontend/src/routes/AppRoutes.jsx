import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Eventos from '../pages/eventos';
import EventoInfo from '../pages/eventoInfo';
import CrearEvento from '../pages/CrearEvento';
import CrearArtista from '../pages/CrearArtista';
import Usuarios from '../pages/usuarios';
import CrearOrganizador from '../pages/crearOrganizador';
import Pagos from '../pages/pagos';
import Entradas from '../pages/entradas';
import Register from '../pages/register';
import Login from '../pages/login';
import ProcesoPago from '../pages/procesoPago';
// import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/eventos" replace />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/eventos/:slug" element={<EventoInfo />} />
        <Route path="/eventos/crear_evento" element={<CrearEvento />} />
        <Route path="/eventos/crear_artista" element={<CrearArtista />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/usuarios/crear_organizador" element={<CrearOrganizador />} />
        <Route path="/pagos" element={<Pagos />} />
        <Route path="/entradas" element={<Entradas />} />
        <Route path="/pagos/proceso_pago" element={<ProcesoPago />} />
      </Route>
    </Routes>
  );
}
