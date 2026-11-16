import { useEffect, useState } from 'react';
import api from '../api';
import EstadoBadge from '../components/EstadoBadge';
import { Entrenador, Pago, PlanEntrenamiento, Usuario } from '../types';
import { formatMoney } from '../utils';

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [planes, setPlanes] = useState<PlanEntrenamiento[]>([]);
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/usuarios'),
      api.get('/planes-entrenamiento'),
      api.get('/entrenadores'),
      api.get('/pagos'),
    ])
      .then(([u, p, e, pa]) => {
        setUsuarios(u.data);
        setPlanes(p.data);
        setEntrenadores(e.data);
        setPagos(pa.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-brand-gray">Cargando...</p>;
  }

  const activos = usuarios.filter((u) => u.estado === 'Activo').length;
  const enMora = usuarios.filter((u) => u.estado === 'EnMora').length;
  const inactivos = usuarios.filter((u) => u.estado === 'Inactivo').length;
  const ingresos = pagos.reduce((acc, p) => acc + p.monto, 0);

  const cards = [
    { label: 'Usuarios totales', value: String(usuarios.length), color: 'text-brand-yellow' },
    { label: 'Activos', value: String(activos), color: 'text-green-400' },
    { label: 'En mora', value: String(enMora), color: 'text-red-400' },
    { label: 'Inactivos', value: String(inactivos), color: 'text-brand-gray' },
    { label: 'Planes', value: String(planes.length), color: 'text-brand-cyan' },
    { label: 'Entrenadores', value: String(entrenadores.length), color: 'text-brand-cyan' },
    { label: 'Ingresos totales', value: formatMoney(ingresos), color: 'text-brand-yellow' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-yellow">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-brand-dark border border-white/10 rounded-xl p-5">
            <p className="text-sm text-brand-gray">{c.label}</p>
            <p className={`text-3xl font-bold mt-2 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-brand-dark border border-white/10 rounded-xl">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-brand-silver">Usuarios en mora</h2>
        </div>
        {enMora === 0 ? (
          <p className="px-5 py-4 text-sm text-brand-gray">No hay usuarios en mora. 🎉</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="table-th">Nombre</th>
                <th className="table-th">Email</th>
                <th className="table-th">Días disponibles</th>
                <th className="table-th">Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios
                .filter((u) => u.estado === 'EnMora')
                .map((u) => (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="table-td font-medium">{u.nombre}</td>
                    <td className="table-td">{u.email}</td>
                    <td className="table-td">{u.diasDisponibles}</td>
                    <td className="table-td">
                      <EstadoBadge estado={u.estado} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
