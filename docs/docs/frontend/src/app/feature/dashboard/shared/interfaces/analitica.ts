export type PeriodoUso = 'anio' | 'mes' | 'dia';

export interface PuntoConsumo {
  clave: number;
  etiqueta: string;
  total: number;
  transacciones: number;
}

export interface ConsumoProducto {
  producto: string;
  total: number;
}

export interface SerieConsumo {
  periodo: PeriodoUso;
  anio: number;
  mes: number | null;
  total: number;
  promedio: number;
  transacciones: number;
  maximo: PuntoConsumo | null;
  puntos: PuntoConsumo[];
  porProducto: ConsumoProducto[];
  aniosDisponibles: number[];
}
