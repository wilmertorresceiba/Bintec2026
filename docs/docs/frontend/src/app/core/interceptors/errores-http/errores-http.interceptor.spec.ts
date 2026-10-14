import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { catchError, EMPTY } from 'rxjs';
import { CODIGO_ERRORES_HTTP } from '@core/constants/codigo-errores-http';
import { HttpService } from '@core/services/http/http.service';
import { erroresHttpInterceptor } from './errores-http.interceptor';

describe('ErroresHttpInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpService: HttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpService,
        provideHttpClient(withInterceptors([erroresHttpInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpService = TestBed.inject(HttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('debería crear el interceptor', () => {
    expect(erroresHttpInterceptor).toBeTruthy();
  });

  it('debería mostrar el mensaje de error desconocido si el error es un código no mapeado', () => {
    const spy: jasmine.Spy = spyOn(console, 'error');
    httpService
      .doGet('/test-url')
      .pipe(
        catchError(() => {
          return EMPTY;
        })
      )
      .subscribe();
    const req: TestRequest = httpMock.expectOne('/test-url');
    req.flush('', { status: 0, statusText: 'Unknown Error' });
    expect(spy).toHaveBeenCalledWith(CODIGO_ERRORES_HTTP.desconocido);
  });

  it('debería mostrar el mensaje de error mapeado si el error es un código conocido', () => {
    const error: number = 404;
    const spy: jasmine.Spy = spyOn(console, 'error');
    httpService
      .doGet('/test-url')
      .pipe(
        catchError(() => {
          return EMPTY;
        })
      )
      .subscribe();
    const req: TestRequest = httpMock.expectOne('/test-url');
    req.flush('', { status: error, statusText: 'Not Found' });
    expect(spy).toHaveBeenCalledWith(CODIGO_ERRORES_HTTP[error]);
  });

  it('debería mostrar el mensaje de error si el error es un ProgressEvent', () => {
    const spy: jasmine.Spy = spyOn(console, 'error');
    httpService
      .doGet('/test-url')
      .pipe(
        catchError(() => {
          return EMPTY;
        })
      )
      .subscribe();
    const req: TestRequest = httpMock.expectOne('/test-url');
    req.error(new ProgressEvent('error'));
    expect(spy).toHaveBeenCalledWith(CODIGO_ERRORES_HTTP.desconectado);
  });
});
