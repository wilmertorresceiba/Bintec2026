import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Credenciales } from '@feature/autenticacion/shared/interfaces/respuesta-login';
import { CERO } from '@shared/utils/numeros';
import { PasoCredencialesComponent } from './paso-credenciales.component';

describe('PasoCredencialesComponent', () => {
  let fixture: ComponentFixture<PasoCredencialesComponent>;
  let componente: PasoCredencialesComponent;
  let enviados: Credenciales[];

  beforeEach(() => {
    fixture = TestBed.createComponent(PasoCredencialesComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
    enviados = [];
    componente.enviado.subscribe((c: Credenciales) => enviados.push(c));
  });

  it('no envía un formulario inválido', () => {
    componente.enviar();
    expect(enviados.length).toBe(CERO);
  });

  it('"Autocompletar credenciales" llena el correo y la clave demo y permite enviar', () => {
    componente.usarCredencialesDemo();
    componente.enviar();
    expect(enviados).toEqual([{ correo: 'wilmer.torres@ceiba.com.co', clave: 'Demo2026*' }]);
  });

  it('no envía mientras está cargando', () => {
    componente.usarCredencialesDemo();
    fixture.componentRef.setInput('cargando', true);
    componente.enviar();
    expect(enviados.length).toBe(CERO);
  });

  it('alterna la visibilidad de la clave', () => {
    const clave: HTMLInputElement = fixture.nativeElement.querySelector('#clave');
    expect(clave.type).toBe('password');
    componente.alternarClave();
    fixture.detectChanges();
    expect(clave.type).toBe('text');
  });

  it('muestra el error recibido', () => {
    fixture.componentRef.setInput('error', 'Correo o clave incorrectos.');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'incorrectos'
    );
  });
});
