const BOM_UTF8: string = '﻿';
const SEPARADOR: string = ';';

function escapar(valor: string | number): string {
  const texto: string = String(valor);
  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** Arma el contenido CSV (separador `;`, compatible con Excel en configuración regional es-CO). */
export function construirCsv(
  encabezados: readonly string[],
  filas: readonly (string | number)[][]
): string {
  const lineas: string[] = [encabezados, ...filas].map(fila => fila.map(escapar).join(SEPARADOR));
  return `${BOM_UTF8}${lineas.join('\r\n')}`;
}

/** Descarga el contenido como archivo en el navegador. */
export function descargarCsv(nombreArchivo: string, contenido: string): void {
  const url: string = URL.createObjectURL(
    new Blob([contenido], { type: 'text/csv;charset=utf-8' })
  );
  const enlace: HTMLAnchorElement = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}
