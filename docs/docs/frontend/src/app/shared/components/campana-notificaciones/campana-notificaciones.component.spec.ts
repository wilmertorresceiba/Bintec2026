import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Notificacion } from '@core/interfaces/notificacion';
import { CampanaNotificacionesComponent } from './campana-notificaciones.component';

const OFERTA: Notificacion = {
  id: 'n-1',
  tipo: 'CREDITO_PREAPROBADO',
  titulo: 'Crédito preaprobado',
  mensaje: 'Tienes un crédito preaprobado de libre inversión por $15.000.000 a 24 cuotas.',
  fecha: '2026-10-12T00:00:00Z',
  estado: 'PENDIENTE',
};

describe('CampanaNotificacionesComponent', () => {
  let fixture: ComponentFixture<CampanaNotificacionesComponent>;
  let httpMock: HttpTestingController;

  const elemento: () => HTMLElement = (): HTMLElement => fixture.nativeElement;
  const boton: () => HTMLButtonElement = (): HTMLButtonElement =>
    elemento().querySelector<HTMLButtonElement>('.campana__boton') as HTMLButtonElement;
  const abrir: () => void = (): void => {
    boton().click();
    fixture.detectChanges();
  };

  const montar: (notificaciones: Notificacion[]) => void = (
    notificaciones: Notificacion[]
  ): void => {
    TestBed.configureTestingModule({
      imports: [CampanaNotificacionesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CampanaNotificacionesComponent);
    fixture.detectChanges();
    httpMock.expectOne('/api/notificaciones').flush(notificaciones);
    fixture.detectChanges();
  };

  afterEach(() => httpMock.verify());

  it('debe mostrar el contador de pendientes y una etiqueta accesible', () => {
    montar([OFERTA]);
    expect(elemento().querySelector('.campana__contador')?.textContent).toContain('1');
    expect(boton().getAttribute('aria-label')).toContain('pendiente');
    expect(boton().classList).toContain('campana__boton--nueva');
  });

  it('debe mostrar la oferta solo con la opción "Ver detalle"', () => {
    montar([OFERTA]);
    abrir();
    expect(elemento().textContent).toContain('Crédito preaprobado');
    expect(elemento().textContent).toContain('libre inversión');
    const enlace: HTMLAnchorElement | null =
      elemento().querySelector<HTMLAnchorElement>('a.aviso__boton');
    expect(enlace?.textContent).toContain('Ver detalle');
    expect(enlace?.getAttribute('href')).toBe('/dashboard/oferta-credito/n-1');
    expect(elemento().textContent).not.toContain('Aceptar crédito');
    expect(elemento().textContent).not.toContain('Rechazar');
  });

  it('abrir o cerrar el panel NO descarta la notificación ni el contador', () => {
    montar([OFERTA]);
    abrir();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(elemento().querySelector('#panel-notificaciones')).toBeNull();
    expect(elemento().querySelector('.campana__contador')).not.toBeNull();
    abrir();
    expect(elemento().textContent).toContain('Ver detalle');
  });

  it('al ir al detalle cierra el panel pero la oferta sigue activa', () => {
    montar([OFERTA]);
    abrir();
    elemento().querySelector<HTMLAnchorElement>('a.aviso__boton')?.click();
    fixture.detectChanges();
    expect(elemento().querySelector('#panel-notificaciones')).toBeNull();
    expect(elemento().querySelector('.campana__contador')).not.toBeNull();
  });

  it('debe mostrar el estado vacío cuando no hay notificaciones', () => {
    montar([]);
    abrir();
    expect(elemento().textContent).toContain('No tienes notificaciones');
    expect(elemento().querySelector('.campana__contador')).toBeNull();
  });
});
