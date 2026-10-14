import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SesionService } from '@core/services/sesion/sesion.service';
import type { CanActivateFn, UrlTree } from '@angular/router';

export const seguridadGuard: CanActivateFn = (): boolean | UrlTree => {
  const router: Router = inject(Router);
  return inject(SesionService).autenticado() ? true : router.createUrlTree(['/login']);
};
