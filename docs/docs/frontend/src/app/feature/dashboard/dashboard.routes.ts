import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@feature/dashboard/components/inicio/inicio.component').then(m => m.InicioComponent),
  },
  {
    path: 'productos',
    data: { miga: 'Mis productos' },
    children: [
      { path: '', redirectTo: 'cuentas', pathMatch: 'full' },
      {
        path: 'cuentas',
        data: { miga: 'Cuentas de ahorro' },
        loadComponent: () =>
          import('@feature/dashboard/components/cuentas/cuentas.component').then(
            m => m.CuentasComponent
          ),
      },
      {
        path: 'tarjetas',
        data: { miga: 'Tarjetas' },
        loadComponent: () =>
          import('@feature/dashboard/components/tarjetas/tarjetas.component').then(
            m => m.TarjetasComponent
          ),
      },
      {
        path: 'creditos',
        data: { miga: 'Créditos' },
        loadComponent: () =>
          import('@feature/dashboard/components/creditos/creditos.component').then(
            m => m.CreditosComponent
          ),
      },
    ],
  },
  {
    path: 'oferta-credito/:id',
    data: { miga: 'Crédito preaprobado' },
    loadComponent: () =>
      import('@feature/dashboard/components/oferta-credito/oferta-credito.component').then(
        m => m.OfertaCreditoComponent
      ),
  },
  {
    path: 'reportes',
    data: { miga: 'Reportes' },
    loadComponent: () =>
      import('@feature/dashboard/components/reportes/reportes.component').then(
        m => m.ReportesComponent
      ),
  },
];
