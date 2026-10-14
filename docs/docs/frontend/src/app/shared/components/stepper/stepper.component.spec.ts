import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CERO, UNO } from '@shared/utils/numeros';
import { StepperComponent } from './stepper.component';

const PASOS: readonly string[] = ['Credenciales', 'Clave de cajero', 'Código de seguridad'];
const TRES: number = 3;
const DOS: number = 2;

describe('StepperComponent', () => {
  let fixture: ComponentFixture<StepperComponent>;

  const items: () => HTMLElement[] = (): HTMLElement[] =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('li'));
  const montar: (activo: number) => void = (activo: number): void => {
    fixture = TestBed.createComponent(StepperComponent);
    fixture.componentRef.setInput('pasos', PASOS);
    fixture.componentRef.setInput('activo', activo);
    fixture.detectChanges();
  };

  it('muestra un paso por cada etiqueta, numerados', () => {
    montar(CERO);
    expect(items().length).toBe(TRES);
    expect(items()[CERO].textContent).toContain('1');
    expect(items()[CERO].textContent).toContain('Credenciales');
  });

  it('marca solo el paso actual con aria-current="step"', () => {
    montar(UNO);
    const actuales: HTMLElement[] = items().filter(
      li => li.getAttribute('aria-current') === 'step'
    );
    expect(actuales.length).toBe(UNO);
    expect(actuales[CERO].textContent).toContain('Clave de cajero');
  });

  it('los pasos anteriores quedan completos (con check) y los siguientes pendientes', () => {
    montar(DOS);
    expect(items()[CERO].classList).toContain('stepper__item--completo');
    expect(items()[CERO].querySelector('svg')).not.toBeNull();
    expect(items()[UNO].classList).toContain('stepper__item--completo');
    expect(items()[DOS].classList).toContain('stepper__item--activo');
  });

  it('describe cada paso para lectores de pantalla', () => {
    montar(UNO);
    const textos: string = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(textos).toContain('Paso 1 de 3: Credenciales, completado');
    expect(textos).toContain('Paso 2 de 3: Clave de cajero, paso actual');
    expect(textos).toContain('Paso 3 de 3: Código de seguridad, pendiente');
  });
});
