export type MarcaTarjeta = 'VISA' | 'MASTERCARD' | 'AMEX';
export type EstadoProducto = 'AL_DIA' | 'EN_MORA' | 'BLOQUEADA';
export type TipoCredito = 'Libre inversión' | 'Vehículo' | 'Vivienda';
export type TipoCuenta = 'Cuenta de Ahorros' | 'Ahorro Programado';
export type EstadoCuenta = 'ACTIVA' | 'INACTIVA' | 'BLOQUEADA';
export type TipoMovimiento = 'COMPRA' | 'PAGO' | 'AVANCE' | 'CUOTA_CREDITO';

export interface TarjetaCredito {
  id: string;
  marca: MarcaTarjeta;
  nombre: string;
  ultimosDigitos: string;
  cupoTotal: number;
  cupoUtilizado: number;
  pagoMinimo: number;
  pagoTotal: number;
  fechaLimitePago: string;
  estado: EstadoProducto;
}

export interface Credito {
  id: string;
  tipo: TipoCredito;
  numero: string;
  montoOriginal: number;
  saldoCapital: number;
  valorCuota: number;
  cuotasPagadas: number;
  cuotasTotales: number;
  tasaMensual: number;
  proximoPago: string;
  estado: EstadoProducto;
}

export interface Movimiento {
  id: string;
  fecha: string;
  descripcion: string;
  producto: string;
  tipo: TipoMovimiento;
  valor: number;
}

export interface ResumenFinanciero {
  deudaTotal: number;
  cupoDisponible: number;
  pagoMensualEstimado: number;
  proximoVencimiento: string;
}

export interface DashboardDatos {
  resumen: ResumenFinanciero;
  tarjetas: TarjetaCredito[];
  creditos: Credito[];
  movimientos: Movimiento[];
}

export interface CuentaAhorro {
  id: string;
  tipo: TipoCuenta;
  numero: string;
  saldoTotal: number;
  saldoDisponible: number;
  saldoRetenido: number;
  rendimientosMes: number;
  tasaEfectivaAnual: number;
  fechaApertura: string;
  estado: EstadoCuenta;
}
