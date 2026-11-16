import { FormEvent, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api';
import Modal from '../components/Modal';
import { Rutina, Usuario } from '../types';
import { formatDate } from '../utils';

interface EjercicioForm {
  nombre: string;
  series: string;
  repeticiones: string;
  peso: string;
  notas: string;
}

interface RutinaForm {
  nombre: string;
  descripcion: string;
  ejercicios: EjercicioForm[];
}

const emptyEjercicio = (): EjercicioForm => ({
  nombre: '',
  series: '3',
  repeticiones: '12',
  peso: '',
  notas: '',
});

const emptyForm = (): RutinaForm => ({ nombre: '', descripcion: '', ejercicios: [emptyEjercicio()] });

export default function Rutinas() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Rutina | null>(null);
  const [form, setForm] = useState<RutinaForm>(emptyForm());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsuarios = async () => {
    const r = await api.get('/usuarios');
    setUsuarios(r.data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadRutinas = async (uid: number) => {
    const r = await api.get(`/usuarios/${uid}/rutinas`);
    setRutinas(r.data);
  };

  const handleSelectUsuario = (value: string) => {
    setUsuarioId(value);
    if (value) loadRutinas(Number(value));
    else setRutinas([]);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setError('');
    setModalOpen(true);
  };

  const openEdit = (r: Rutina) => {
    setEditing(r);
    setForm({
      nombre: r.nombre,
      descripcion: r.descripcion ?? '',
      ejercicios: r.ejercicios.map((e) => ({
        nombre: e.nombre,
        series: String(e.series),
        repeticiones: String(e.repeticiones),
        peso: e.peso != null ? String(e.peso) : '',
        notas: e.notas ?? '',
      })),
    });
    setError('');
    setModalOpen(true);
  };

  const addEjercicio = () =>
    setForm((f) => ({ ...f, ejercicios: [...f.ejercicios, emptyEjercicio()] }));

  const removeEjercicio = (i: number) =>
    setForm((f) => ({ ...f, ejercicios: f.ejercicios.filter((_, idx) => idx !== i) }));

  const updateEjercicio = (i: number, patch: Partial<EjercicioForm>) =>
    setForm((f) => ({
      ...f,
      ejercicios: f.ejercicios.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      ejercicios: form.ejercicios.map((ej) => ({
        nombre: ej.nombre,
        series: Number(ej.series),
        repeticiones: Number(ej.repeticiones),
        peso: ej.peso ? Number(ej.peso) : null,
        notas: ej.notas || null,
      })),
    };
    try {
      if (editing) await api.put(`/rutinas/${editing.id}`, payload);
      else await api.post(`/usuarios/${usuarioId}/rutinas`, payload);
      setModalOpen(false);
      await loadRutinas(Number(usuarioId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: Rutina) => {
    if (!confirm(`¿Eliminar la rutina "${r.nombre}"?`)) return;
    await api.delete(`/rutinas/${r.id}`);
    await loadRutinas(Number(usuarioId));
  };

  if (loading) {
    return <p className="text-brand-gray">Cargando...</p>;
  }

  // ==== RENDER ====
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-brand-yellow">Rutinas</h1>
        <div className="flex items-center gap-3">
          <select
            className="input w-64"
            value={usuarioId}
            onChange={(e) => handleSelectUsuario(e.target.value)}
          >
            <option value="">Selecciona un usuario</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
          <button className="btn-primary" onClick={openCreate} disabled={!usuarioId}>
            + Nueva rutina
          </button>
        </div>
      </div>

      {!usuarioId ? (
        <div className="bg-brand-dark border border-white/10 rounded-xl p-10 text-center text-brand-gray">
          Selecciona un usuario para ver sus rutinas.
        </div>
      ) : rutinas.length === 0 ? (
        <div className="bg-brand-dark border border-white/10 rounded-xl p-10 text-center text-brand-gray">
          Este usuario no tiene rutinas registradas.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rutinas.map((r) => (
            <div key={r.id} className="bg-brand-dark border border-white/10 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div>
                  <h3 className="font-bold text-brand-yellow">{r.nombre}</h3>
                  <p className="text-xs text-brand-gray mt-1">{formatDate(r.fechaCreacion)}</p>
                </div>
                <div className="space-x-2 shrink-0">
                  <button className="btn-secondary" onClick={() => openEdit(r)}>
                    Editar
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(r)}>
                    Eliminar
                  </button>
                </div>
              </div>
              {r.descripcion && <p className="text-sm text-brand-silver mb-3">{r.descripcion}</p>}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-brand-gray text-xs">
                    <th className="py-2 text-left">Ejercicio</th>
                    <th className="py-2 text-left">Series</th>
                    <th className="py-2 text-left">Reps</th>
                    <th className="py-2 text-left">Peso</th>
                  </tr>
                </thead>
                <tbody>
                  {r.ejercicios.map((e) => (
                    <tr key={e.id} className="border-b border-white/5">
                      <td className="py-2 text-brand-silver">{e.nombre}</td>
                      <td className="py-2">{e.series}</td>
                      <td className="py-2">{e.repeticiones}</td>
                      <td className="py-2">{e.peso != null ? `${e.peso} kg` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

  // ==== MODALS ====
      <Modal
        open={modalOpen}
        title={editing ? 'Editar rutina' : 'Nueva rutina'}
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
            <label className="label">Descripción</label>
            <textarea
              className="input"
              rows={2}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-brand-silver text-sm">Ejercicios</h4>
              <button type="button" className="btn-secondary" onClick={addEjercicio}>
                + Agregar
              </button>
            </div>
            {form.ejercicios.map((ej, i) => (
              <div key={i} className="border border-white/10 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-brand-gray">Ejercicio {i + 1}</span>
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300 text-sm"
                    onClick={() => removeEjercicio(i)}
                  >
                    Quitar
                  </button>
                </div>
                <input
                  className="input"
                  placeholder="Nombre del ejercicio"
                  value={ej.nombre}
                  onChange={(e) => updateEjercicio(i, { nombre: e.target.value })}
                  required
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="label text-xs">Series</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={ej.series}
                      onChange={(e) => updateEjercicio(i, { series: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Repeticiones</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={ej.repeticiones}
                      onChange={(e) => updateEjercicio(i, { repeticiones: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Peso (kg)</label>
                    <input
                      className="input"
                      type="number"
                      step="0.5"
                      min="0"
                      value={ej.peso}
                      onChange={(e) => updateEjercicio(i, { peso: e.target.value })}
                    />
                  </div>
                </div>
                <input
                  className="input"
                  placeholder="Notas (opcional)"
                  value={ej.notas}
                  onChange={(e) => updateEjercicio(i, { notas: e.target.value })}
                />
              </div>
            ))}
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
