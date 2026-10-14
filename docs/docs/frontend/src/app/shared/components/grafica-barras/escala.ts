/* eslint-disable @typescript-eslint/no-magic-numbers -- utilidades numéricas de geometría de la gráfica */

const FACTORES_AGRADABLES: readonly number[] = [1, 2, 2.5, 5, 10];

/** Redondea hacia arriba a un máximo "agradable" (1, 2, 2.5, 5 × 10^n) para el eje Y. */
export function escalaAgradable(maximo: number): number {
  if (maximo <= 0) {
    return 1;
  }
  const magnitud: number = 10 ** Math.floor(Math.log10(maximo));
  const factor: number = FACTORES_AGRADABLES.find(f => f * magnitud >= maximo) ?? 10;
  return factor * magnitud;
}

/** Cada cuántos puntos se muestra la etiqueta del eje X para que no se solapen. */
export function pasoEtiquetas(cantidad: number, maximoVisibles: number): number {
  return Math.max(1, Math.ceil(cantidad / maximoVisibles));
}
