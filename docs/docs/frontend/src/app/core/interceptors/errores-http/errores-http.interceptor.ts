import { catchError, Observable, throwError } from 'rxjs';
import { CODIGO_ERRORES_HTTP } from '@core/constants/codigo-errores-http';
import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

export const erroresHttpInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse): Observable<never> => {
      let mensajeError: string = '';
      if (error.error instanceof ProgressEvent) {
        mensajeError = `${CODIGO_ERRORES_HTTP.desconectado}`;
      } else {
        mensajeError = CODIGO_ERRORES_HTTP[error.status] || CODIGO_ERRORES_HTTP.desconocido;
      }

      // 'Implementar lógica para mostrar mensaje al usuario'
      console.error(mensajeError);

      return throwError((): HttpErrorResponse => error);
    })
  );
};
