import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Conciertos from '../pages/Conciertos';
import InfoConcierto from '../pages/InfoConcierto';
import Usuarios from '../pages/Usuarios';
import Lugares from '../pages/Lugares';
import Artistas from '../pages/Artistas';
import DetallesOrganizador from '../pages/DetallesOrganizador';
import DetallesCliente from '../pages/DetallesCliente';
import Pagos from '../pages/Pagos';
import PagosConcierto from '../pages/PagosConcierto';
import Entradas from '../pages/entradas';
import Register from '../pages/register';
import Login from '../pages/Login';
import ProcesoPago from '../pages/procesoPago';
import Perfil from '../pages/Perfil';
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="conciertos" replace />} />

        {/* CONCIERTOS */}
        <Route path="conciertos" element={<Conciertos />} />
        <Route path="conciertos/:slug" element={<InfoConcierto />} />

        {/* PERFIL */}
        <Route path="perfil" element={<Perfil />} />

        {/* -----CLIENTE----- */}
        <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Organizador']} />}>
          {/* PAGOS */}
          <Route path="pagos" element={<Pagos />} />
          <Route path="pagos/proceso_pago" element={<ProcesoPago />} />

          {/* ENTRADAS */}
          <Route path="entradas" element={<Entradas />} />
        </Route>
        {/* -----CLIENTE----- */}

        {/* -----ADMIN/ORGANIZADOR----- */}
        <Route element={<ProtectedRoute allowedRoles={['Cliente']} />}>
          <Route path="pagos_concierto" element={<PagosConcierto />} />
        </Route>
        {/* -----ADMIN/ORGANIZADOR----- */}

        {/* -----ADMIN----- */}
        <Route element={<ProtectedRoute allowedRoles={['Cliente', 'Organizador']} />}>
          {/* USUARIOS */}
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="usuarios/detalle_organizador" element={<DetallesOrganizador />} />
          <Route path="usuarios/detalle_cliente" element={<DetallesCliente />} />

          {/* LUGARES */}
          <Route path="lugares" element={<Lugares />} />
          
          {/* ARTISTAS */}
          <Route path="artistas" element={<Artistas />} />
        </Route>
        {/* -----ADMIN----- */}
      </Route>
    </Routes>
  );
}
