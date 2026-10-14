export type TipoNotificacion = 'CREDITO_PREAPROBADO';

/** Una notificación está activa (PENDIENTE) hasta que el cliente la acepta o la rechaza. */
export type EstadoNotificacion = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha: string;
  estado: EstadoNotificacion;
}

/** Condiciones del crédito preaprobado. */
export interface DetalleOferta {
  monto: number;
  cuotas: number;
  tasaMensual: number;
  valorCuota: number;
  totalAPagar: number;
  fechaPrimeraCuota: string;
}

export interface DetalleNotificacion {
  notificacion: Notificacion;
  oferta: DetalleOferta | null;
}
