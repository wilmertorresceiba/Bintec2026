/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  Credito,
  DashboardDatos,
  Movimiento,
  TarjetaCredito,
} from '@feature/dashboard/shared/interfaces/dashboard';

const MS_POR_DIA: number = 24 * 60 * 60 * 1000;

/** Fecha ISO relativa a hoy, para que la demo siempre se vea vigente. */
const desdeHoy: (dias: number) => string = (dias: number): string =>
  new Date(Date.now() + dias * MS_POR_DIA).toISOString();

const TARJETAS: TarjetaCredito[] = [
  {
    id: 'tc-1',
    marca: 'VISA',
    nombre: 'Visa Oro',
    ultimosDigitos: '4821',
    cupoTotal: 8_000_000,
    cupoUtilizado: 3_250_000,
    pagoMinimo: 325_000,
    pagoTotal: 3_250_000,
    fechaLimitePago: desdeHoy(6),
    estado: 'AL_DIA',
  },
  {
    id: 'tc-2',
    marca: 'MASTERCARD',
    nombre: 'Mastercard Platinum',
    ultimosDigitos: '9034',
    cupoTotal: 15_000_000,
    cupoUtilizado: 13_100_000,
    pagoMinimo: 1_310_000,
    pagoTotal: 13_100_000,
    fechaLimitePago: desdeHoy(2),
    estado: 'AL_DIA',
  },
];

const CREDITOS: Credito[] = [
  {
    id: 'cr-2',
    tipo: 'Vehículo',
    numero: '•••• 7745',
    montoOriginal: 58_000_000,
    saldoCapital: 41_900_000,
    valorCuota: 1_540_000,
    cuotasPagadas: 20,
    cuotasTotales: 60,
    tasaMensual: 1.18,
    proximoPago: desdeHoy(14),
    estado: 'AL_DIA',
  },
  {
    id: 'cr-3',
    tipo: 'Vivienda',
    numero: '•••• 3382',
    montoOriginal: 210_000_000,
    saldoCapital: 187_500_000,
    valorCuota: 2_380_000,
    cuotasPagadas: 24,
    cuotasTotales: 240,
    tasaMensual: 0.89,
    proximoPago: desdeHoy(21),
    estado: 'EN_MORA',
  },
];

const MOVIMIENTOS: Movimiento[] = [
  {
    id: 'mv-1',
    fecha: desdeHoy(-1),
    descripcion: 'Supermercado Éxito',
    producto: 'Visa Oro •••• 4821',
    tipo: 'COMPRA',
    valor: -286_400,
  },
  {
    id: 'mv-2',
    fecha: desdeHoy(-2),
    descripcion: 'Pago cuota crédito de vehículo',
    producto: 'Crédito •••• 7745',
    tipo: 'CUOTA_CREDITO',
    valor: -1_540_000,
  },
  {
    id: 'mv-3',
    fecha: desdeHoy(-3),
    descripcion: 'Netflix',
    producto: 'Mastercard •••• 9034',
    tipo: 'COMPRA',
    valor: -44_900,
  },
  {
    id: 'mv-4',
    fecha: desdeHoy(-5),
    descripcion: 'Abono a tarjeta',
    producto: 'Visa Oro •••• 4821',
    tipo: 'PAGO',
    valor: 900_000,
  },
  {
    id: 'mv-5',
    fecha: desdeHoy(-6),
    descripcion: 'Avance en cajero',
    producto: 'Mastercard •••• 9034',
    tipo: 'AVANCE',
    valor: -500_000,
  },
];

const deudaTarjetas: number = TARJETAS.reduce((suma, t) => suma + t.cupoUtilizado, 0);
const deudaCreditos: number = CREDITOS.reduce((suma, c) => suma + c.saldoCapital, 0);
const cupoDisponible: number = TARJETAS.reduce(
  (suma, t) => suma + t.cupoTotal - t.cupoUtilizado,
  0
);
const pagoMensual: number =
  TARJETAS.reduce((suma, t) => suma + t.pagoMinimo, 0) +
  CREDITOS.reduce((suma, c) => suma + c.valorCuota, 0);

export const DASHBOARD_FIXTURE: DashboardDatos = {
  resumen: {
    deudaTotal: deudaTarjetas + deudaCreditos,
    cupoDisponible,
    pagoMensualEstimado: pagoMensual,
    proximoVencimiento: TARJETAS[1].fechaLimitePago,
  },
  tarjetas: TARJETAS,
  creditos: CREDITOS,
  movimientos: MOVIMIENTOS,
};
