import { FormEvent, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api';
import Modal from '../components/Modal';
import { Entrenador } from '../types';

interface EntrenadorForm {
  nombre: string;
  email: string;
  telefono: string;
  especialidad: string;
}

const emptyForm: EntrenadorForm = { nombre: '', email: '', telefono: '', especialidad: '' };

export default function Entrenadores() {
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Entrenador | null>(null);
  const [form, setForm] = useState<EntrenadorForm>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const r = await api.get('/entrenadores');
    setEntrenadores(r.data);
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

  const openEdit = (t: Entrenador) => {
    setEditing(t);
    setForm({
      nombre: t.nombre,
      email: t.email,
      telefono: t.telefono ?? '',
      especialidad: t.especialidad ?? '',
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
      especialidad: form.especialidad || null,
    };
    try {
      if (editing) await api.put(`/entrenadores/${editing.id}`, payload);
      else await api.post('/entrenadores', payload);
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: Entrenador) => {
    if (!confirm(`¿Eliminar al entrenador "${t.nombre}"?`)) return;
    await api.delete(`/entrenadores/${t.id}`);
    await load();
  };

  if (loading) {
    return <p className="text-brand-gray">Cargando...</p>;
  }

  // ==== RENDER ====
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-yellow">Entrenadores</h1>
        <button className="btn-primary" onClick={openCreate}>
          + Nuevo entrenador
        </button>
      </div>

      <div className="bg-brand-dark border border-white/10 rounded-xl overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="table-th">Nombre</th>
              <th className="table-th">Email</th>
              <th className="table-th">Teléfono</th>
              <th className="table-th">Especialidad</th>
              <th className="table-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entrenadores.map((t) => (
              <tr key={t.id} className="border-b border-white/5">
                <td className="table-td font-medium">{t.nombre}</td>
                <td className="table-td">{t.email}</td>
                <td className="table-td">{t.telefono ?? '-'}</td>
                <td className="table-td">{t.especialidad ?? '-'}</td>
                <td className="table-td space-x-2">
                  <button className="btn-secondary" onClick={() => openEdit(t)}>
                    Editar
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(t)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {entrenadores.length === 0 && (
              <tr>
                <td colSpan={5} className="table-td text-center text-brand-gray py-8">
                  No hay entrenadores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Editar entrenador' : 'Nuevo entrenador'}
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
          <div>
            <label className="label">Especialidad</label>
            <input
              className="input"
              value={form.especialidad}
              onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
              placeholder="Ej: Musculación"
            />
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
    </div>
  );
}
