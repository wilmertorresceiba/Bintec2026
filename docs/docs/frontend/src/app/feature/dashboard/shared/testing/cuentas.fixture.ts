import { CuentaAhorro } from '@feature/dashboard/shared/interfaces/dashboard';

export const CUENTAS_FIXTURE: CuentaAhorro[] = [
  {
    id: 'ca-1',
    tipo: 'Cuenta de Ahorros',
    numero: '•••• 5538',
    saldoTotal: 4_850_000,
    saldoDisponible: 4_720_000,
    saldoRetenido: 130_000,
    rendimientosMes: 8_450,
    tasaEfectivaAnual: 1.5,
    fechaApertura: '2022-10-12T00:00:00Z',
    estado: 'ACTIVA',
  },
  {
    id: 'ca-2',
    tipo: 'Ahorro Programado',
    numero: '•••• 7021',
    saldoTotal: 12_300_000,
    saldoDisponible: 12_300_000,
    saldoRetenido: 0,
    rendimientosMes: 48_200,
    tasaEfectivaAnual: 4.8,
    fechaApertura: '2025-04-20T00:00:00Z',
    estado: 'ACTIVA',
  },
];
