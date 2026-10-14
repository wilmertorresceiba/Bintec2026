import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  RespuestaDesafio,
  RespuestaLogin,
} from '@feature/autenticacion/shared/interfaces/respuesta-login';
import { CERO } from '@shared/utils/numeros';
import { AutenticacionService } from './autenticacion.service';
import { ErrorAutenticacion } from './error-autenticacion';

const BLOQUEADA: number = 423;

const DESAFIO: RespuestaDesafio = { desafio: 'jwt-desafio', requiereSegundoFactor: true };
const SESION: RespuestaLogin = {
  token: 'jwt-de-prueba',
  usuario: { nombre: 'Wilmer Torres', correo: 'wilmer.torres@ceiba.com.co' },
};

describe('AutenticacionService', () => {
  let servicio: AutenticacionService;
  let httpMock: HttpTestingController;

  const capturarError: (
    llamada: () => { subscribe: (o: { error: (e: ErrorAutenticacion) => void }) => void }
  ) => ErrorAutenticacion[] = (llamada): ErrorAutenticacion[] => {
    const errores: ErrorAutenticacion[] = [];
    llamada().subscribe({ error: (e: ErrorAutenticacion) => errores.push(e) });
    return errores;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(AutenticacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('paso 1: envía correo (sin espacios) y clave y devuelve el desafío', () => {
    let respuesta: RespuestaDesafio | undefined;
    servicio
      .iniciarSesion(' wilmer.torres@ceiba.com.co ', 'Demo2026*')
      .subscribe(r => (respuesta = r));

    const peticion: TestRequest = httpMock.expectOne('/api/auth/login');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({
      correo: 'wilmer.torres@ceiba.com.co',
      clave: 'Demo2026*',
    });
    peticion.flush(DESAFIO);

    expect(respuesta).toEqual(DESAFIO);
  });

  it('paso 2: envía el desafío, la clave de cajero y el código de seguridad', () => {
    let respuesta: RespuestaLogin | undefined;
    servicio.verificar('jwt-desafio', '1381', '123456').subscribe(r => (respuesta = r));

    const peticion: TestRequest = httpMock.expectOne('/api/auth/verificar');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({
      desafio: 'jwt-desafio',
      claveCajero: '1381',
      codigoSeguridad: '123456',
    });
    peticion.flush(SESION);

    expect(respuesta).toEqual(SESION);
  });

  it('conserva el mensaje y el código que envía el backend en 401', () => {
    const errores: ErrorAutenticacion[] = capturarError(() =>
      servicio.verificar('d', '0000', '123456')
    );
    httpMock.expectOne('/api/auth/verificar').flush(
      {
        detail: 'La clave de cajero o el código de seguridad son incorrectos.',
        code: 'segundo_factor_invalido',
      },
      { status: 401, statusText: 'Unauthorized' }
    );
    expect(errores[CERO].message).toContain('clave de cajero');
    expect(errores[CERO].codigo).toBe('segundo_factor_invalido');
  });

  it('informa la cuenta bloqueada (423) con su código', () => {
    const errores: ErrorAutenticacion[] = capturarError(() =>
      servicio.iniciarSesion('a@b.com', 'x')
    );
    httpMock
      .expectOne('/api/auth/login')
      .flush(
        { detail: 'Tu cuenta está bloqueada temporalmente.', code: 'cuenta_bloqueada' },
        { status: BLOQUEADA, statusText: 'Locked' }
      );
    expect(errores[CERO].codigo).toBe('cuenta_bloqueada');
    expect(errores[CERO].message).toContain('bloqueada');
  });

  it('formato inválido (422) y sin conexión muestran mensajes propios', () => {
    const invalido: ErrorAutenticacion[] = capturarError(() => servicio.verificar('d', '1', '2'));
    httpMock
      .expectOne('/api/auth/verificar')
      .flush({}, { status: 422, statusText: 'Unprocessable' });
    expect(invalido[CERO].message).toContain('Revisa los datos');

    const sinRed: ErrorAutenticacion[] = capturarError(() =>
      servicio.iniciarSesion('a@b.com', 'x')
    );
    httpMock.expectOne('/api/auth/login').error(new ProgressEvent('error'));
    expect(sinRed[CERO].message).toContain('conectar con el servidor');
  });
});
