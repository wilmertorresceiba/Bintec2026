import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SesionService } from '@core/services/sesion/sesion.service';
import type { HttpInterceptorFn, HttpRequest } from '@angular/common/http';

const NO_AUTORIZADO: number = 401;
const PROHIBIDO: number = 403;
// Un 401 en cualquiera de los pasos del login es "datos incorrectos", no una sesión vencida.
const RUTAS_LOGIN_API: readonly string[] = ['/auth/login', '/auth/verificar'];

export const autenticacionInterceptor: HttpInterceptorFn = (req, next) => {
  const router: Router = inject(Router);
  const sesion: SesionService = inject(SesionService);
  const token: string | null = sesion.token();
  const peticion: HttpRequest<unknown> = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(peticion).pipe(
    catchError(error => {
      switch (error.status) {
        case NO_AUTORIZADO:
          if (!RUTAS_LOGIN_API.some((ruta: string) => req.url.endsWith(ruta))) {
            sesion.cerrar();
            void router.navigate(['/login']);
          }
          return throwError(() => error);
        case PROHIBIDO:
          void router.navigate(['/dashboard']);
          return throwError(() => error);
        default:
          return throwError(() => error);
      }
    })
  );
};
