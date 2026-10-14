import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpService } from '@core/services/http/http.service';
import { environment } from '@env/environment';
import {
  Credenciales,
  RespuestaDesafio,
  RespuestaLogin,
  SegundoFactor,
} from '@feature/autenticacion/shared/interfaces/respuesta-login';
import { ErrorAutenticacion } from './error-autenticacion';

const NO_AUTORIZADO: number = 401;
const ENTIDAD_NO_PROCESABLE: number = 422;
const BLOQUEADA: number = 423;
const SIN_CONEXION: number = 0;

const MENSAJE_SIN_CONEXION: string = 'No pudimos conectar con el servidor. Inténtalo de nuevo.';
const MENSAJE_DATOS_INVALIDOS: string = 'Revisa los datos ingresados.';
const MENSAJE_GENERICO: string = 'Tuvimos un problema al iniciar sesión. Inténtalo de nuevo.';

type SolicitudLogin = Credenciales;

interface SolicitudVerificacion extends SegundoFactor {
  desafio: string;
}

interface CuerpoError {
  detail?: unknown;
  code?: unknown;
}

/** Login en dos pasos: 1) correo y clave → desafío; 2) clave de cajero + código → sesión. */
@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  private readonly http: HttpService = inject(HttpService);

  public iniciarSesion(correo: string, clave: string): Observable<RespuestaDesafio> {
    return this.http
      .doPost<SolicitudLogin, RespuestaDesafio>(`${environment.endpoint}/auth/login`, {
        correo: correo.trim(),
        clave,
      })
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => this.convertir(error))));
  }

  public verificar(
    desafio: string,
    claveCajero: string,
    codigoSeguridad: string
  ): Observable<RespuestaLogin> {
    return this.http
      .doPost<SolicitudVerificacion, RespuestaLogin>(`${environment.endpoint}/auth/verificar`, {
        desafio,
        claveCajero,
        codigoSeguridad,
      })
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => this.convertir(error))));
  }

  private convertir(error: HttpErrorResponse): ErrorAutenticacion {
    const cuerpo: CuerpoError | null = error.error as CuerpoError | null;
    const codigo: string | null = typeof cuerpo?.code === 'string' ? cuerpo.code : null;
    const detalle: string | null = typeof cuerpo?.detail === 'string' ? cuerpo.detail : null;
    switch (error.status) {
      case NO_AUTORIZADO:
      case BLOQUEADA:
        return new ErrorAutenticacion(detalle ?? MENSAJE_GENERICO, codigo);
      case ENTIDAD_NO_PROCESABLE:
        return new ErrorAutenticacion(MENSAJE_DATOS_INVALIDOS, codigo);
      case SIN_CONEXION:
        return new ErrorAutenticacion(MENSAJE_SIN_CONEXION, codigo);
      default:
        return new ErrorAutenticacion(MENSAJE_GENERICO, codigo);
    }
  }
}
