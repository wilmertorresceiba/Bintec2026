import { UsuarioSesion } from '@core/interfaces/usuario-sesion';

/** Paso 1 superado: aún no hay sesión, falta el segundo factor. */
export interface RespuestaDesafio {
  desafio: string;
  requiereSegundoFactor: boolean;
}

/** Paso 2 superado: sesión completa. */
export interface RespuestaLogin {
  token: string;
  usuario: UsuarioSesion;
}

export interface Credenciales {
  correo: string;
  clave: string;
}

export interface SegundoFactor {
  claveCajero: string;
  codigoSeguridad: string;
}
