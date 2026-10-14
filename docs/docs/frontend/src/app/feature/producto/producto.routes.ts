import { Routes } from '@angular/router';
import { ProductoService } from './shared/service/producto.service';

export const productoRoutes: Routes = [
  {
    path: '',
    redirectTo: 'listar',
    pathMatch: 'full',
  },
  {
    path: 'listar',
    providers: [ProductoService],
    loadComponent: () =>
      import('@feature/producto/components/listar-producto/listar-producto.component').then(
        m => m.ListarProductoComponent
      ),
  },
  {
    path: 'crear',
    providers: [ProductoService],
    loadComponent: () =>
      import('@feature/producto/components/administrar-producto/administrar-producto.component').then(
        m => m.AdministrarProductoComponent
      ),
  },
  {
    path: 'editar/:idProducto',
    providers: [ProductoService],
    loadComponent: () =>
      import('@feature/producto/components/administrar-producto/administrar-producto.component').then(
        m => m.AdministrarProductoComponent
      ),
  },
];
