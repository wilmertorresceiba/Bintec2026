import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { CODIGO_ERRORES_HTTP } from '@core/constants/codigo-errores-http';
import { TipoError } from '@core/constants/tipo-error';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ManejadorErroresService implements ErrorHandler {
  public handleError(error: string | Error): void {
    this.manejarError(error);
  }

  private manejarError(error: string | Error): void {
    if (error instanceof HttpErrorResponse) {
      this.manejarErrorHttp(error);
    } else {
      this.mostrarMensajeEnConsola(error, Error);
    }
  }

  private manejarErrorHttp(error: HttpErrorResponse): void {
    let mensaje: string;
    if (!navigator.onLine) {
      mensaje = CODIGO_ERRORES_HTTP.desconectado;
    } else {
      mensaje = `${
        CODIGO_ERRORES_HTTP[error.status] || CODIGO_ERRORES_HTTP.desconocido
      } (${error.url})`;
    }
    this.mostrarMensajeEnConsola(mensaje, HttpErrorResponse);
  }

  private obtenerTipoError(tipoError: typeof HttpErrorResponse | typeof Error): string {
    if (tipoError === HttpErrorResponse) {
      return TipoError.errorHttp;
    }
    return TipoError.errorAplicacion;
  }

  private mostrarMensajeEnConsola(
    error: string | Error,
    tipoError: typeof HttpErrorResponse | typeof Error
  ): void {
    const respuesta: { fecha: string; ubicacion: string; mensaje: string } = {
      fecha: new Date().toLocaleString(),
      ubicacion: window.location.href,
      mensaje: typeof error === 'string' ? error : error.message,
    };
    const tipoErrorMensaje: string = this.obtenerTipoError(tipoError);
    if (!environment.production) {
      console.error(tipoErrorMensaje, respuesta);
    }
  }
}
