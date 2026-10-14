import { Routes } from '@angular/router';
import { invitadoGuard } from '@core/guards/invitado/invitado.guard';
import { seguridadGuard } from '@core/guards/seguridad/seguridad.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadChildren: () =>
      import('@feature/autenticacion/autenticacion.routes').then(m => m.autenticacionRoutes),
  },
  {
    path: 'dashboard',
    canActivate: [seguridadGuard],
    loadChildren: () => import('@feature/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
