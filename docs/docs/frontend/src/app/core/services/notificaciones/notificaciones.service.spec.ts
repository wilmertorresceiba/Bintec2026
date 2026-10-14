import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Notificacion } from '@core/interfaces/notificacion';
import { NotificacionesService } from './notificaciones.service';

const NINGUNA: number = 0;
const UNA: number = 1;

const OFERTA: Notificacion = {
  id: 'n-1',
  tipo: 'CREDITO_PREAPROBADO',
  titulo: 'Crédito preaprobado',
  mensaje: 'Tienes un crédito preaprobado de libre inversión por $15.000.000 a 24 cuotas.',
  fecha: '2026-10-12T00:00:00Z',
  estado: 'PENDIENTE',
};

describe('NotificacionesService', () => {
  let servicio: NotificacionesService;
  let httpMock: HttpTestingController;

  const cargar: (respuesta: Notificacion[]) => void = (respuesta: Notificacion[]): void => {
    servicio.cargar();
    httpMock.expectOne('/api/notificaciones').flush(respuesta);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(NotificacionesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe cargar las notificaciones activas y contarlas', () => {
    cargar([OFERTA]);
    expect(servicio.notificaciones()).toEqual([OFERTA]);
    expect(servicio.pendientes()).toBe(UNA);
  });

  it('la notificación sigue activa en cada recarga mientras el API la devuelva', () => {
    cargar([OFERTA]);
    cargar([OFERTA]);
    expect(servicio.pendientes()).toBe(UNA);
  });

  it('al recargar sin ofertas pendientes (ya decidida) el contador baja a cero', () => {
    cargar([OFERTA]);
    cargar([]);
    expect(servicio.pendientes()).toBe(NINGUNA);
  });

  it('debe indicar error si falla la carga y limpiar al cerrar sesión', () => {
    servicio.cargar();
    httpMock.expectOne('/api/notificaciones').flush('', { status: 500, statusText: 'Error' });
    expect(servicio.error()).toBeTrue();

    cargar([OFERTA]);
    servicio.limpiar();
    expect(servicio.notificaciones()).toEqual([]);
    expect(servicio.error()).toBeFalse();
  });
});
