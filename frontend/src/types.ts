export type EstadoUsuario = 'Activo' | 'EnMora' | 'Inactivo';
export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia';

export interface PlanEntrenamiento {
  id: number;
  nombre: string;
  descripcion?: string;
  precioMensual: number;
  activo: boolean;
}

export interface Entrenador {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  especialidad?: string;
}

export interface Ejercicio {
  id: number;
  rutinaId: number;
  nombre: string;
  series: number;
  repeticiones: number;
  peso?: number;
  notas?: string;
}

export interface Rutina {
  id: number;
  usuarioId: number;
  nombre: string;
  descripcion?: string;
  fechaCreacion: string;
  ejercicios: Ejercicio[];
}

export interface Pago {
  id: number;
  usuarioId: number;
  monto: number;
  fechaPago: string;
  metodoPago: MetodoPago;
  diasAgregados: number;
  periodo?: string;
  usuario?: Usuario;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  fechaRegistro: string;
  estado: EstadoUsuario;
  diasDisponibles: number;
  planEntrenamientoId?: number;
  planEntrenamiento?: PlanEntrenamiento;
  entrenadorId?: number;
  entrenador?: Entrenador;
  rutinas?: Rutina[];
  pagos?: Pago[];
}
