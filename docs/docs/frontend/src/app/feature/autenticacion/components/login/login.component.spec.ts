import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { SesionService } from '@core/services/sesion/sesion.service';
import {
  RespuestaDesafio,
  RespuestaLogin,
} from '@feature/autenticacion/shared/interfaces/respuesta-login';
import { AutenticacionService } from '@feature/autenticacion/shared/service/autenticacion.service';
import { ErrorAutenticacion } from '@feature/autenticacion/shared/service/error-autenticacion';
import { CERO, UNO } from '@shared/utils/numeros';
import { LoginComponent } from './login.component';

const DESAFIO: RespuestaDesafio = { desafio: 'jwt-desafio', requiereSegundoFactor: true };
const SESION: RespuestaLogin = {
  token: 'jwt-de-prueba',
  usuario: { nombre: 'Wilmer Torres', correo: 'wilmer.torres@ceiba.com.co' },
};

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let componente: LoginComponent;
  let paso1: Observable<RespuestaDesafio>;
  let paso3: Observable<RespuestaLogin>;
  let verificar: jasmine.Spy<(d: string, c: string, s: string) => Observable<RespuestaLogin>>;

  const elemento: () => HTMLElement = (): HTMLElement => fixture.nativeElement;
  const texto: () => string = (): string => elemento().textContent ?? '';
  const pulsar: (contiene: string) => void = (contiene: string): void => {
    Array.from(elemento().querySelectorAll('button'))
      .find(b => b.textContent?.includes(contiene))
      ?.click();
    fixture.detectChanges();
  };
  const pasoActivo: () => string = (): string =>
    elemento().querySelector('[aria-current="step"]')?.textContent ?? '';

  const alPaso2: () => void = (): void => {
    pulsar('Autocompletar credenciales');
    pulsar('Continuar');
  };
  const alPaso3: () => void = (): void => {
    alPaso2();
    pulsar('Autocompletar credenciales'); // clave de cajero 1381
    pulsar('Continuar');
  };
  const completarPaso3: () => void = (): void => {
    pulsar('Autocompletar credenciales'); // código de seguridad 123456
    pulsar('Verificar e ingresar');
  };

  beforeEach(async () => {
    sessionStorage.clear();
    paso1 = of(DESAFIO);
    paso3 = of(SESION);
    verificar = jasmine.createSpy('verificar').and.callFake(() => paso3);
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        {
          provide: AutenticacionService,
          useValue: { iniciarSesion: (): Observable<RespuestaDesafio> => paso1, verificar },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => sessionStorage.clear());

  it('muestra un stepper de 3 pasos y empieza en Credenciales', () => {
    expect(elemento().querySelectorAll('app-stepper li').length).toBe(UNO + UNO + UNO);
    expect(pasoActivo()).toContain('Credenciales');
    expect(elemento().querySelector('#correo')).not.toBeNull();
  });

  it('paso 2: tras validar correo y clave pide la clave de cajero (sin iniciar sesión)', () => {
    alPaso2();
    expect(pasoActivo()).toContain('Clave de cajero');
    expect(elemento().querySelector('#clave-cajero')).not.toBeNull();
    expect(TestBed.inject(SesionService).autenticado()).toBeFalse();
  });

  it('paso 3: la clave de cajero se guarda en memoria y NO se envía todavía', () => {
    alPaso3();
    expect(pasoActivo()).toContain('Código de seguridad');
    expect(elemento().querySelector('#codigo-seguridad')).not.toBeNull();
    expect(verificar).not.toHaveBeenCalled();
  });

  it('con todos los datos correctos inicia sesión con el token y va al dashboard', () => {
    const navegar: jasmine.Spy = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    alPaso3();
    completarPaso3();

    expect(verificar).toHaveBeenCalledWith('jwt-desafio', '1381', '123456');
    const sesion: SesionService = TestBed.inject(SesionService);
    expect(sesion.autenticado()).toBeTrue();
    expect(sesion.token()).toBe(SESION.token);
    expect(navegar).toHaveBeenCalledWith(['/dashboard']);
  });

  it('si el backend rechaza el segundo factor vuelve a la clave de cajero con el mensaje', () => {
    paso3 = throwError(
      () =>
        new ErrorAutenticacion(
          'La clave de cajero o el código son incorrectos.',
          'segundo_factor_invalido'
        )
    );
    alPaso3();
    completarPaso3();

    expect(componente.paso()).toBe('cajero');
    expect(pasoActivo()).toContain('Clave de cajero');
    expect(texto()).toContain('incorrectos');
    expect(TestBed.inject(SesionService).autenticado()).toBeFalse();
  });

  it('si la cuenta queda bloqueada vuelve al paso 1 mostrando el mensaje', () => {
    paso3 = throwError(
      () => new ErrorAutenticacion('Tu cuenta está bloqueada temporalmente.', 'cuenta_bloqueada')
    );
    alPaso3();
    completarPaso3();

    expect(componente.paso()).toBe('credenciales');
    expect(texto()).toContain('bloqueada');
  });

  it('si el desafío venció vuelve al paso 1 para empezar de nuevo', () => {
    paso3 = throwError(
      () =>
        new ErrorAutenticacion(
          'Tu verificación expiró. Vuelve a iniciar sesión.',
          'desafio_invalido'
        )
    );
    alPaso3();
    completarPaso3();

    expect(componente.paso()).toBe('credenciales');
    expect(texto()).toContain('expiró');
  });

  it('"Volver" retrocede un paso a la vez', () => {
    alPaso3();
    pulsar('Volver');
    expect(pasoActivo()).toContain('Clave de cajero');
    pulsar('Volver');
    expect(pasoActivo()).toContain('Credenciales');
  });

  it('un error en el paso 1 (clave incorrecta) se queda en el paso 1', () => {
    paso1 = throwError(
      () => new ErrorAutenticacion('Correo o clave incorrectos.', 'credenciales_invalidas')
    );
    alPaso2();
    expect(componente.paso()).toBe('credenciales');
    expect(texto()).toContain('Correo o clave incorrectos.');
    expect(componente.cargando()).toBeFalse();
    expect(verificar.calls.count()).toBe(CERO);
  });

  it('los ids del DOM son únicos y cada etiqueta apunta a su campo', () => {
    alPaso3();
    const ids: string[] = Array.from(elemento().querySelectorAll('[id]')).map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);

    const etiqueta: HTMLLabelElement = elemento().querySelector('label') as HTMLLabelElement;
    expect((etiqueta.control as HTMLElement).tagName).toBe('INPUT');
  });
});
