import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DashboardDatos } from '@feature/dashboard/shared/interfaces/dashboard';
import { DASHBOARD_FIXTURE } from '@feature/dashboard/shared/testing/dashboard.fixture';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let servicio: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe consultar el dashboard en el API', () => {
    let datos: DashboardDatos | undefined;
    servicio.obtenerDashboard().subscribe((d: DashboardDatos) => (datos = d));

    const peticion: ReturnType<HttpTestingController['expectOne']> =
      httpMock.expectOne('/api/dashboard');
    expect(peticion.request.method).toBe('GET');
    peticion.flush(DASHBOARD_FIXTURE);

    expect(datos).toEqual(DASHBOARD_FIXTURE);
  });
});
