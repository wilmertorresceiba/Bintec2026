import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OfertasService } from './ofertas.service';

describe('OfertasService', () => {
  let servicio: OfertasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(OfertasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('obtiene el detalle por id', () => {
    servicio.obtenerDetalle('n-1').subscribe();
    const peticion: TestRequest = httpMock.expectOne('/api/notificaciones/n-1');
    expect(peticion.request.method).toBe('GET');
    peticion.flush({});
  });
});
