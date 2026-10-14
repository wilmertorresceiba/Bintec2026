import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CuentaAhorro } from '@feature/dashboard/shared/interfaces/dashboard';
import { CUENTAS_FIXTURE } from '@feature/dashboard/shared/testing/cuentas.fixture';
import { CERO, UNO } from '@shared/utils/numeros';
import { CuentaAhorroComponent } from './cuenta-ahorro.component';

describe('CuentaAhorroComponent', () => {
  let fixture: ComponentFixture<CuentaAhorroComponent>;

  const montar: (cuenta: CuentaAhorro) => string = (cuenta: CuentaAhorro): string => {
    fixture = TestBed.createComponent(CuentaAhorroComponent);
    fixture.componentRef.setInput('cuenta', cuenta);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ') ?? '';
  };

  it('debe mostrar tipo, número, saldo disponible, rendimientos y tasa', () => {
    const texto: string = montar(CUENTAS_FIXTURE[CERO]);
    expect(texto).toContain('Cuenta de Ahorros');
    expect(texto).toContain('•••• 5538');
    expect(texto).toContain('Saldo disponible');
    expect(texto).toMatch(/4[.,]720[.,]000/);
    expect(texto).toMatch(/8[.,]450/);
    expect(texto).toMatch(/1[.,]50 %/);
    expect(texto).toContain('Activa');
  });

  it('debe describirse con una etiqueta accesible', () => {
    montar(CUENTAS_FIXTURE[UNO]);
    expect(fixture.nativeElement.querySelector('article')?.getAttribute('aria-label')).toBe(
      'Ahorro Programado •••• 7021'
    );
  });

  it('una cuenta que no está activa se marca con el estado de alerta', () => {
    montar({ ...CUENTAS_FIXTURE[CERO], estado: 'BLOQUEADA' });
    const etiqueta: Element | null = fixture.nativeElement.querySelector('.etiqueta');
    expect(etiqueta?.textContent).toContain('Bloqueada');
    expect(etiqueta?.classList).toContain('etiqueta--alerta');
  });
});
