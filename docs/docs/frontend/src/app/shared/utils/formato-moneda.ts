const LOCALE: string = 'es-CO';
const MONEDA: string = 'COP';

const FORMATO_COMPLETO: Intl.NumberFormat = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: MONEDA,
  maximumFractionDigits: 0,
});

const FORMATO_COMPACTO: Intl.NumberFormat = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: MONEDA,
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Pesos colombianos sin decimales: `$ 1.234.000`. */
export function formatearPesos(valor: number): string {
  return FORMATO_COMPLETO.format(valor);
}

/** Pesos en notación compacta para ejes de gráficas: `$ 1,2 M`. */
export function formatearPesosCompacto(valor: number): string {
  return FORMATO_COMPACTO.format(valor);
}
