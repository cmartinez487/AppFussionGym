import { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Entrenadores from './pages/Entrenadores';
import Login from './pages/Login';
import Pagos from './pages/Pagos';
import Planes from './pages/Planes';
import Rutinas from './pages/Rutinas';
import Usuarios from './pages/Usuarios';

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="planes" element={<Planes />} />
        <Route path="entrenadores" element={<Entrenadores />} />
        <Route path="rutinas" element={<Rutinas />} />
        <Route path="pagos" element={<Pagos />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
