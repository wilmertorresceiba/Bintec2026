/** Error del login con el código estable que envía el backend (para decidir qué hacer). */
export class ErrorAutenticacion extends Error {
  public readonly codigo: string | null;

  constructor(mensaje: string, codigo: string | null) {
    super(mensaje);
    this.codigo = codigo;
  }
}

export const CODIGO_DESAFIO_INVALIDO: string = 'desafio_invalido';
export const CODIGO_CUENTA_BLOQUEADA: string = 'cuenta_bloqueada';
