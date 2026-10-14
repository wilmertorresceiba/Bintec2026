import { EstadoProducto } from '@feature/dashboard/shared/interfaces/dashboard';

export const ETIQUETAS_ESTADO: Record<EstadoProducto, string> = {
  AL_DIA: 'Al día',
  EN_MORA: 'En mora',
  BLOQUEADA: 'Bloqueada',
};

const HORAS_POR_DIA: number = 24;
const MINUTOS_POR_HORA: number = 60;
const SEGUNDOS_POR_MINUTO: number = 60;
const MS_POR_SEGUNDO: number = 1000;

export const MS_POR_DIA: number =
  HORAS_POR_DIA * MINUTOS_POR_HORA * SEGUNDOS_POR_MINUTO * MS_POR_SEGUNDO;
