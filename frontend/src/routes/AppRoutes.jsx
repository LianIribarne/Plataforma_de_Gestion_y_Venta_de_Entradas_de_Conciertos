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
import Login from '../pages/login';
import ProcesoPago from '../pages/procesoPago';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/conciertos" replace />} />

        {/* CONCIERTOS */}
        <Route path="/conciertos" element={<Conciertos />} />
        <Route path="/conciertos/:slug" element={<InfoConcierto />} />
        <Route path="/analitica" element={<AnaliticaConcierto />} />

        {/* USUARIOS */}
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/detalle_organizador" element={<DetallesOrganizador />} />

        {/* PAGOS */}
        <Route path="/pagos" element={<Pagos />} />
        <Route path="/pagos/proceso_pago" element={<ProcesoPago />} />

        {/* ENTRADAS */}
        <Route path="/entradas" element={<Entradas />} />
      </Route>
    </Routes>
  );
}
