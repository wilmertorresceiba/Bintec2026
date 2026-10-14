import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CODIGO_ERRORES_HTTP } from '@core/constants/codigo-errores-http';
import { TipoError } from '@core/constants/tipo-error';
import { ManejadorErroresService } from './manejador-errores.service';

describe('ManejadorErroresService', () => {
  let service: ManejadorErroresService;

  const ARGUMENTO_TIPO_ERROR: number = 0;
  const ARGUMENTO_ERROR: number = 1;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ManejadorErroresService,
        {
          provide: ErrorHandler,
          useClass: ManejadorErroresService,
        },
      ],
    });
    service = TestBed.inject(ManejadorErroresService);
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debería manejar el error de aplicación', () => {
    const mensaje: string = 'Error de prueba';
    const error: Error = new Error(mensaje);
    const spy: jasmine.Spy = spyOn(console, 'error');
    service.handleError(error);

    const argumentos: unknown[] = spy.calls.first().args;
    expect(argumentos[ARGUMENTO_TIPO_ERROR]).toBe(TipoError.errorAplicacion);
    expect((argumentos[ARGUMENTO_ERROR] as { mensaje: string }).mensaje).toBe(mensaje);
  });

  it('debería manejar el error HTTP con codigo conocido', () => {
    const MENSAJE_ESPERADO: string =
      'No encontrado: El recurso solicitado no pudo ser encontrado. (http://localhost:8080/api)';
    const mensaje: string = 'Error de prueba';
    const codigo: number = 404;
    const url: string = 'http://localhost:8080/api';
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: mensaje,
      status: codigo,
      url,
    });
    const spy: jasmine.Spy = spyOn(console, 'error');
    service.handleError(error);

    const argumentos: unknown[] = spy.calls.first().args;
    expect(argumentos[ARGUMENTO_TIPO_ERROR]).toBe(TipoError.errorHttp);
    expect((argumentos[ARGUMENTO_ERROR] as { mensaje: string }).mensaje).toBe(MENSAJE_ESPERADO);
  });

  it('debería manejar el error HTTP con codigo desconocido', () => {
    const MENSAJE_ESPERADO: string = 'Ocurrió un error desconocido. (http://localhost:8080/api)';
    const mensaje: string = 'Error de prueba';
    const codigo: number = 100;
    const url: string = 'http://localhost:8080/api';
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: mensaje,
      status: codigo,
      url,
    });
    const spy: jasmine.Spy = spyOn(console, 'error');
    service.handleError(error);

    const argumentos: unknown[] = spy.calls.first().args;
    expect(argumentos[ARGUMENTO_TIPO_ERROR]).toBe(TipoError.errorHttp);
    expect((argumentos[ARGUMENTO_ERROR] as { mensaje: string }).mensaje).toBe(MENSAJE_ESPERADO);
  });

  it('debería manejar el error de conexión', () => {
    spyOnProperty(navigator, 'onLine').and.returnValue(false);
    const MENSAJE_ESPERADO: string = CODIGO_ERRORES_HTTP.desconectado;
    const mensaje: string = 'Error de prueba';
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: mensaje,
      status: 0,
    });
    const spy: jasmine.Spy = spyOn(console, 'error');
    service.handleError(error);

    const argumentos: unknown[] = spy.calls.first().args;
    expect(argumentos[ARGUMENTO_TIPO_ERROR]).toBe(TipoError.errorHttp);
    expect((argumentos[ARGUMENTO_ERROR] as { mensaje: string }).mensaje).toBe(MENSAJE_ESPERADO);
  });
});
