import { TestBed } from '@angular/core/testing';
import { UsuarioSesion } from '@core/interfaces/usuario-sesion';
import { SesionService } from './sesion.service';

const USUARIO: UsuarioSesion = { nombre: 'Laura', correo: 'laura@bintec.com' };
const TOKEN: string = 'jwt-de-prueba';

describe('SesionService', () => {
  let servicio: SesionService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    servicio = TestBed.inject(SesionService);
  });

  afterEach(() => sessionStorage.clear());

  it('debe iniciar sin sesión', () => {
    expect(servicio.autenticado()).toBeFalse();
    expect(servicio.usuario()).toBeNull();
    expect(servicio.token()).toBeNull();
  });

  it('debe autenticar y exponer el token al iniciar sesión', () => {
    servicio.iniciar(USUARIO, TOKEN);
    expect(servicio.autenticado()).toBeTrue();
    expect(servicio.usuario()).toEqual(USUARIO);
    expect(servicio.token()).toBe(TOKEN);
  });

  it('debe limpiar la sesión al cerrar', () => {
    servicio.iniciar(USUARIO, TOKEN);
    servicio.cerrar();
    expect(servicio.autenticado()).toBeFalse();
    expect(servicio.token()).toBeNull();
  });

  it('debe ignorar una sesión guardada con formato inválido', () => {
    sessionStorage.setItem('bintec-sesion', '{"usuario":"x"}');
    TestBed.resetTestingModule();
    expect(TestBed.inject(SesionService).autenticado()).toBeFalse();
  });
});
