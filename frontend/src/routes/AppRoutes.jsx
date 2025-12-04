import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Conciertos from '../pages/Conciertos';
import InfoConcierto from '../pages/InfoConcierto';
import AnaliticaConcierto from '../pages/AnaliticaConcierto';
import Usuarios from '../pages/Usuarios';
import DetallesOrganizador from '../pages/DetallesOrganizador';
import Pagos from '../pages/pagos';
import Entradas from '../pages/entradas';
import Register from '../pages/register';
import Login from '../pages/Login';
import ProcesoPago from '../pages/procesoPago';
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

        <Route element={<ProtectedRoute allowedRoles={['cliente']} />}>
          <Route path="analitica" element={<AnaliticaConcierto />} />
        </Route>

        {/* USUARIOS */}
        <Route element={<ProtectedRoute allowedRoles={['cliente', 'organizador']} />}>
          <Route path="usuarios" element={<Usuarios />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['cliente']} />}>
          <Route path="detalle_organizador" element={<DetallesOrganizador />} />
        </Route>

        {/* PAGOS */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'organizador']} />}>
          <Route path="pagos" element={<Pagos />} />
          <Route path="pagos/proceso_pago" element={<ProcesoPago />} />
        </Route>

        {/* ENTRADAS */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'organizador']} />}>
          <Route path="entradas" element={<Entradas />} />
        </Route>
      </Route>
    </Routes>
  );
}
