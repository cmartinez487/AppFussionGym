import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import EstadoBadge from '../components/EstadoBadge';
import Modal from '../components/Modal';
import { MetodoPago, Pago, Usuario } from '../types';
import { formatDateTime, formatMoney } from '../utils';

interface PagoForm {
  monto: string;
  metodoPago: MetodoPago;
  diasAgregados: string;
  periodo: string;
}

const emptyForm: PagoForm = { monto: '', metodoPago: 'Efectivo', diasAgregados: '30', periodo: '' };

export default function Pagos() {
  const [searchParams] = useSearchParams();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [selected, setSelected] = useState<Usuario | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<PagoForm>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPagos = async (uid: string) => {
    const r = await api.get(`/usuarios/${uid}/pagos`);
    setPagos(r.data);
  };

  useEffect(() => {
    const init = async () => {
      const r = await api.get('/usuarios');
      const list = r.data as Usuario[];
      setUsuarios(list);
      setLoading(false);

      const preset = searchParams.get('usuarioId');
      if (preset) {
        setUsuarioId(preset);
        setSelected(list.find((u) => String(u.id) === preset) ?? null);
        await loadPagos(preset);
      }
    };
    init();
  }, []);

  const handleSelectUsuario = async (value: string) => {
    setUsuarioId(value);
    setSelected(usuarios.find((u) => String(u.id) === value) ?? null);
    if (value) await loadPagos(value);
    else setPagos([]);
  };

  const reloadPagos = async () => {
    if (!usuarioId) return;
    await loadPagos(usuarioId);
    const r = await api.get('/usuarios');
    const list = r.data as Usuario[];
    setUsuarios(list);
    setSelected(list.find((u) => String(u.id) === usuarioId) ?? null);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      monto: Number(form.monto),
      metodoPago: form.metodoPago,
      diasAgregados: Number(form.diasAgregados) || 30,
      periodo: form.periodo || null,
    };
    try {
      await api.post(`/usuarios/${usuarioId}/pagos`, payload);
      setModalOpen(false);
      await reloadPagos();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-brand-gray">Cargando...</p>;
  }

  // ==== RENDER ====
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-brand-yellow">Pagos</h1>
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
            + Registrar pago
          </button>
        </div>
      </div>

      {selected && (
        <div className="bg-brand-dark border border-white/10 rounded-xl p-5 flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-sm text-brand-gray">Usuario</p>
            <p className="font-bold text-brand-silver">{selected.nombre}</p>
          </div>
          <div>
            <p className="text-sm text-brand-gray">Estado</p>
            <div className="mt-1">
              <EstadoBadge estado={selected.estado} />
            </div>
          </div>
          <div>
            <p className="text-sm text-brand-gray">Días disponibles</p>
            <p className="font-bold text-brand-yellow text-xl">{selected.diasDisponibles}</p>
          </div>
          <div>
            <p className="text-sm text-brand-gray">Plan</p>
            <p className="font-medium text-brand-cyan">{selected.planEntrenamiento?.nombre ?? 'Sin plan'}</p>
          </div>
        </div>
      )}

      {!usuarioId ? (
        <div className="bg-brand-dark border border-white/10 rounded-xl p-10 text-center text-brand-gray">
          Selecciona un usuario para ver sus pagos.
        </div>
      ) : pagos.length === 0 ? (
        <div className="bg-brand-dark border border-white/10 rounded-xl p-10 text-center text-brand-gray">
          Este usuario no tiene pagos registrados.
        </div>
      ) : (
        <div className="bg-brand-dark border border-white/10 rounded-xl overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="table-th">Fecha</th>
                <th className="table-th">Monto</th>
                <th className="table-th">Método</th>
                <th className="table-th">Días agregados</th>
                <th className="table-th">Periodo</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="table-td">{formatDateTime(p.fechaPago)}</td>
                  <td className="table-td font-medium">{formatMoney(p.monto)}</td>
                  <td className="table-td">{p.metodoPago}</td>
                  <td className="table-td">{p.diasAgregados}</td>
                  <td className="table-td">{p.periodo ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} title="Registrar pago" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Monto</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Método de pago</label>
            <select
              className="input"
              value={form.metodoPago}
              onChange={(e) => setForm({ ...form, metodoPago: e.target.value as MetodoPago })}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>
          <div>
            <label className="label">Días agregados (mensualidad = 30)</label>
            <input
              className="input"
              type="number"
              min="1"
              value={form.diasAgregados}
              onChange={(e) => setForm({ ...form, diasAgregados: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Periodo</label>
            <input
              className="input"
              placeholder="Ej: Noviembre 2026"
              value={form.periodo}
              onChange={(e) => setForm({ ...form, periodo: e.target.value })}
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
              {saving ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
