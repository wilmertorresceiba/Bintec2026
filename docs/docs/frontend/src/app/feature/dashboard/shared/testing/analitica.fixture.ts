/* eslint-disable @typescript-eslint/no-magic-numbers -- datos de prueba */
import { SerieConsumo } from '@feature/dashboard/shared/interfaces/analitica';

export const SERIE_MENSUAL_FIXTURE: SerieConsumo = {
  periodo: 'mes',
  anio: 2026,
  mes: null,
  total: 3_000_000,
  promedio: 250_000,
  transacciones: 30,
  maximo: { clave: 12, etiqueta: 'Dic', total: 900_000, transacciones: 9 },
  puntos: [
    { clave: 1, etiqueta: 'Ene', total: 100_000, transacciones: 2 },
    { clave: 2, etiqueta: 'Feb', total: 2_000_000, transacciones: 19 },
    { clave: 12, etiqueta: 'Dic', total: 900_000, transacciones: 9 },
  ],
  porProducto: [
    { producto: 'Visa Oro •••• 4821', total: 1_800_000 },
    { producto: 'Mastercard •••• 9034', total: 1_200_000 },
  ],
  aniosDisponibles: [2024, 2025, 2026],
};
