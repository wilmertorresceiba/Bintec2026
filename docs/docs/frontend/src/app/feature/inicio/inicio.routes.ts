import { Routes } from '@angular/router';

export const inicioRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@feature/inicio/components/inicio/inicio.component').then(m => m.InicioComponent),
  },
];
