import { FormEvent, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api';
import Modal from '../components/Modal';
import { PlanEntrenamiento } from '../types';
import { formatMoney } from '../utils';

interface PlanForm {
  nombre: string;
  descripcion: string;
  precioMensual: string;
  activo: boolean;
}

const emptyForm: PlanForm = { nombre: '', descripcion: '', precioMensual: '', activo: true };

export default function Planes() {
  const [planes, setPlanes] = useState<PlanEntrenamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlanEntrenamiento | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const r = await api.get('/planes-entrenamiento');
    setPlanes(r.data);
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

  const openEdit = (p: PlanEntrenamiento) => {
    setEditing(p);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      precioMensual: String(p.precioMensual),
      activo: p.activo,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = { ...form, precioMensual: Number(form.precioMensual) };
    try {
      if (editing) await api.put(`/planes-entrenamiento/${editing.id}`, payload);
      else await api.post('/planes-entrenamiento', payload);
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: PlanEntrenamiento) => {
    if (!confirm(`¿Eliminar el plan "${p.nombre}"?`)) return;
    await api.delete(`/planes-entrenamiento/${p.id}`);
    await load();
  };

  if (loading) {
    return <p className="text-brand-gray">Cargando...</p>;
  }

  // ==== RENDER ====
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-yellow">Planes de entrenamiento</h1>
        <button className="btn-primary" onClick={openCreate}>
          + Nuevo plan
        </button>
      </div>

      <div className="bg-brand-dark border border-white/10 rounded-xl overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="table-th">Nombre</th>
              <th className="table-th">Descripción</th>
              <th className="table-th">Precio mensual</th>
              <th className="table-th">Estado</th>
              <th className="table-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {planes.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="table-td font-medium">{p.nombre}</td>
                <td className="table-td">{p.descripcion ?? '-'}</td>
                <td className="table-td">{formatMoney(p.precioMensual)}</td>
                <td className="table-td">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      p.activo
                        ? 'bg-green-500/15 text-green-400 border-green-500/30'
                        : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                    }`}
                  >
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="table-td space-x-2">
                  <button className="btn-secondary" onClick={() => openEdit(p)}>
                    Editar
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(p)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {planes.length === 0 && (
              <tr>
                <td colSpan={5} className="table-td text-center text-brand-gray py-8">
                  No hay planes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing ? 'Editar plan' : 'Nuevo plan'} onClose={() => setModalOpen(false)}>
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
            <label className="label">Descripción</label>
            <textarea
              className="input"
              rows={2}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Precio mensual</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={form.precioMensual}
              onChange={(e) => setForm({ ...form, precioMensual: e.target.value })}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-brand-silver">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            />
            Plan activo
          </label>

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
    </div>
  );
}
