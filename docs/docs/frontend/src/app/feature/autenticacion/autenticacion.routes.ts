import { Routes } from '@angular/router';

export const autenticacionRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@feature/autenticacion/components/login/login.component').then(m => m.LoginComponent),
  },
];
