import { TipoMovimiento } from '@feature/dashboard/shared/interfaces/dashboard';

export interface FiltroReporte {
  desde: string;
  hasta: string;
  tipo: TipoMovimiento | '';
}
