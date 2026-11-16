import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import EstadoBadge from '../components/EstadoBadge';
import Modal from '../components/Modal';
import { Entrenador, EstadoUsuario, PlanEntrenamiento, Usuario } from '../types';

interface UsuarioForm {
  nombre: string;
  email: string;
  telefono: string;
  estado: EstadoUsuario;
  diasDisponibles: string;
  planEntrenamientoId: string;
  entrenadorId: string;
}

const emptyForm: UsuarioForm = {
  nombre: '',
  email: '',
  telefono: '',
  estado: 'Activo',
  diasDisponibles: '0',
  planEntrenamientoId: '',
  entrenadorId: '',
};

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [planes, setPlanes] = useState<PlanEntrenamiento[]>([]);
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState<UsuarioForm>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [assignUser, setAssignUser] = useState<Usuario | null>(null);
  const [assignEntrenadorId, setAssignEntrenadorId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);

  const load = async () => {
    const [u, p, e] = await Promise.all([
      api.get('/usuarios'),
      api.get('/planes-entrenamiento'),
      api.get('/entrenadores'),
    ]);
    setUsuarios(u.data);
    setPlanes(p.data);
    setEntrenadores(e.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (u: Usuario) => {
    setEditing(u);
    setForm({
      nombre: u.nombre,
      email: u.email,
      telefono: u.telefono ?? '',
      estado: u.estado,
      diasDisponibles: String(u.diasDisponibles),
      planEntrenamientoId: u.planEntrenamientoId ? String(u.planEntrenamientoId) : '',
      entrenadorId: u.entrenadorId ? String(u.entrenadorId) : '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono || null,
      estado: form.estado,
      diasDisponibles: Number(form.diasDisponibles) || 0,
      planEntrenamientoId: form.planEntrenamientoId ? Number(form.planEntrenamientoId) : null,
      entrenadorId: form.entrenadorId ? Number(form.entrenadorId) : null,
    };
    try {
      if (editing) await api.put(`/usuarios/${editing.id}`, payload);
      else await api.post('/usuarios', payload);
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: Usuario) => {
    if (!confirm(`¿Eliminar al usuario "${u.nombre}"?`)) return;
    await api.delete(`/usuarios/${u.id}`);
    await load();
  };

  const openAssign = (u: Usuario) => {
    setAssignUser(u);
    setAssignEntrenadorId('');
    setAssignError('');
  };

  const handleAssign = async (e: FormEvent) => {
    e.preventDefault();
    if (!assignUser) return;
    setAssignError('');
    setAssignSaving(true);
    try {
      await api.post(`/usuarios/${assignUser.id}/asignar-entrenador`, {
        entrenadorId: Number(assignEntrenadorId),
      });
      setAssignUser(null);
      await load();
    } catch (err) {
      setAssignError(getErrorMessage(err));
    } finally {
      setAssignSaving(false);
    }
  };

  if (loading) {
    return <p className="text-brand-gray">Cargando...</p>;
  }

  // ==== RENDER ====
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-yellow">Usuarios</h1>
        <button className="btn-primary" onClick={openCreate}>
          + Nuevo usuario
        </button>
      </div>

      <div className="bg-brand-dark border border-white/10 rounded-xl overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="table-th">Nombre</th>
              <th className="table-th">Email</th>
              <th className="table-th">Plan</th>
              <th className="table-th">Entrenador</th>
              <th className="table-th">Estado</th>
              <th className="table-th">Días</th>
              <th className="table-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-white/5">
                <td className="table-td font-medium">{u.nombre}</td>
                <td className="table-td">{u.email}</td>
                <td className="table-td">{u.planEntrenamiento?.nombre ?? 'Sin plan'}</td>
                <td className="table-td">{u.entrenador?.nombre ?? '—'}</td>
                <td className="table-td">
                  <EstadoBadge estado={u.estado} />
                </td>
                <td className="table-td">{u.diasDisponibles}</td>
                <td className="table-td">
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-secondary" onClick={() => openEdit(u)}>
                      Editar
                    </button>
                    <button className="btn-secondary" onClick={() => openAssign(u)}>
                      Entrenador
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => navigate(`/pagos?usuarioId=${u.id}`)}
                    >
                      Pago
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(u)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={7} className="table-td text-center text-brand-gray py-8">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

  // ==== MODALS ====
      <Modal
        open={modalOpen}
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nombre</label>
            <input
              className="input"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input
              className="input"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Estado</label>
              <select
                className="input"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoUsuario })}
              >
                <option value="Activo">Activo</option>
                <option value="EnMora">En mora</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
            <div>
              <label className="label">Días disponibles</label>
              <input
                className="input"
                type="number"
                min="0"
                value={form.diasDisponibles}
                onChange={(e) => setForm({ ...form, diasDisponibles: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Plan de entrenamiento</label>
            <select
              className="input"
              value={form.planEntrenamientoId}
              onChange={(e) => setForm({ ...form, planEntrenamientoId: e.target.value })}
            >
              <option value="">Sin plan</option>
              {planes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Entrenador (solo si tiene plan)</label>
            <select
              className="input"
              value={form.entrenadorId}
              onChange={(e) => setForm({ ...form, entrenadorId: e.target.value })}
            >
              <option value="">Sin entrenador</option>
              {entrenadores.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={assignUser !== null} title="Asignar entrenador" onClose={() => setAssignUser(null)}>
        {assignUser && !assignUser.planEntrenamientoId ? (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            Este usuario no tiene un plan de entrenamiento asignado. Asigna primero un plan para
            poder asignarle un entrenador.
          </div>
        ) : assignUser ? (
          <form onSubmit={handleAssign} className="space-y-4">
            <p className="text-sm text-brand-gray">
              Usuario: <span className="text-brand-silver font-medium">{assignUser.nombre}</span>
            </p>
            <div>
              <label className="label">Entrenador</label>
              <select
                className="input"
                value={assignEntrenadorId}
                onChange={(e) => setAssignEntrenadorId(e.target.value)}
                required
              >
                <option value="">Selecciona un entrenador</option>
                {entrenadores.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
            {assignError && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                {assignError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setAssignUser(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={assignSaving}>
                {assignSaving ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
