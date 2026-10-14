import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SERIE_MENSUAL_FIXTURE } from '@feature/dashboard/shared/testing/analitica.fixture';
import { AnaliticaService } from './analitica.service';

const ANIO_ACTUAL: number = 2026;
const ANIO_PREVIO: number = 2025;
const MES_OCTUBRE: number = 10;
const MES_MARZO: number = 3;

describe('AnaliticaService', () => {
  let servicio: AnaliticaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(AnaliticaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('por año solo envía el periodo', () => {
    servicio.obtenerConsumo('anio', ANIO_ACTUAL, MES_OCTUBRE).subscribe();
    const peticion: TestRequest = httpMock.expectOne(r => r.url === '/api/analitica/consumo');
    expect(peticion.request.params.keys()).toEqual(['periodo']);
    expect(peticion.request.params.get('periodo')).toBe('anio');
    peticion.flush(SERIE_MENSUAL_FIXTURE);
  });

  it('por mes envía periodo y año', () => {
    servicio.obtenerConsumo('mes', ANIO_PREVIO, MES_OCTUBRE).subscribe();
    const peticion: TestRequest = httpMock.expectOne(r => r.url === '/api/analitica/consumo');
    expect(peticion.request.params.get('anio')).toBe('2025');
    expect(peticion.request.params.has('mes')).toBeFalse();
    peticion.flush(SERIE_MENSUAL_FIXTURE);
  });

  it('por día envía periodo, año y mes', () => {
    servicio.obtenerConsumo('dia', ANIO_PREVIO, MES_MARZO).subscribe();
    const peticion: TestRequest = httpMock.expectOne(r => r.url === '/api/analitica/consumo');
    expect(peticion.request.params.get('mes')).toBe('3');
    peticion.flush(SERIE_MENSUAL_FIXTURE);
  });
});
