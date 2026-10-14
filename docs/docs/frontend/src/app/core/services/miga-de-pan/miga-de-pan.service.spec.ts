import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MigaDePanService } from './miga-de-pan.service';

@Component({ template: '' })
class PaginaVaciaComponent {}

const PRIMERA_MIGA: number = 0;

describe('MigaDePanService', () => {
  let router: Router;
  let servicio: MigaDePanService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'dashboard',
            data: { miga: 'Mis productos' },
            children: [
              { path: 'detalle', component: PaginaVaciaComponent, data: { miga: 'Detalle' } },
              { path: '', component: PaginaVaciaComponent },
            ],
          },
          { path: 'sin-miga', component: PaginaVaciaComponent },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    servicio = TestBed.inject(MigaDePanService);
  });

  it('debe incluir siempre Inicio como primera miga', () => {
    expect(servicio.migas()[PRIMERA_MIGA]).toEqual({ etiqueta: 'Inicio', url: '/dashboard' });
  });

  it('debe construir la ruta con las migas de las rutas anidadas', async () => {
    await router.navigateByUrl('/dashboard/detalle');
    expect(servicio.migas()).toEqual([
      { etiqueta: 'Inicio', url: '/dashboard' },
      { etiqueta: 'Mis productos', url: '/dashboard' },
      { etiqueta: 'Detalle', url: '/dashboard/detalle' },
    ]);
  });

  it('debe ignorar rutas sin miga configurada', async () => {
    await router.navigateByUrl('/sin-miga');
    expect(servicio.migas().map(m => m.etiqueta)).toEqual(['Inicio']);
  });
});
