import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { HttpService } from '@core/services/http/http.service';
import { SesionService } from '@core/services/sesion/sesion.service';
import { autenticacionInterceptor } from './autenticacion.interceptor';

describe('AutenticacionInterceptor', () => {
  let httpMock: HttpTestingController;
  let router: Router;
  let httpService: HttpService;
  let sesion: SesionService;

  const llamar: (url: string) => TestRequest = (url: string): TestRequest => {
    httpService
      .doGet(url)
      .pipe(catchError(() => EMPTY))
      .subscribe();
    return httpMock.expectOne(url);
  };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        HttpService,
        provideHttpClient(withInterceptors([autenticacionInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpService = TestBed.inject(HttpService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    sesion = TestBed.inject(SesionService);
  });

  afterEach(() => sessionStorage.clear());

  it('no debe añadir Authorization cuando no hay sesión', () => {
    expect(llamar('/test-url').request.headers.has('Authorization')).toBeFalse();
  });

  it('debe añadir el token de la sesión a la petición', () => {
    sesion.iniciar({ nombre: 'Ana', correo: 'ana@bintec.com' }, 'jwt-123');
    expect(llamar('/test-url').request.headers.get('Authorization')).toBe('Bearer jwt-123');
  });

  it('debe cerrar la sesión y enviar a /login si el error es 401', () => {
    sesion.iniciar({ nombre: 'Ana', correo: 'ana@bintec.com' }, 'jwt-123');
    const spy: jasmine.Spy = spyOn(router, 'navigate');
    llamar('/test-url').flush('', { status: 401, statusText: 'Unauthorized' });
    expect(sesion.autenticado()).toBeFalse();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });

  it('no debe redirigir si el 401 viene de un paso del login (datos incorrectos)', () => {
    const spy: jasmine.Spy = spyOn(router, 'navigate');
    llamar('/api/auth/login').flush('', { status: 401, statusText: 'Unauthorized' });
    llamar('/api/auth/verificar').flush('', { status: 401, statusText: 'Unauthorized' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('debe redirigir a /dashboard si el error es 403', () => {
    const spy: jasmine.Spy = spyOn(router, 'navigate');
    llamar('/test-url').flush('', { status: 403, statusText: 'Forbidden' });
    expect(spy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('no debe redirigir si el error no es 401 o 403', () => {
    const spy: jasmine.Spy = spyOn(router, 'navigate');
    llamar('/test-url').flush('', { status: 500, statusText: 'Internal Server Error' });
    expect(spy).not.toHaveBeenCalled();
  });
});
