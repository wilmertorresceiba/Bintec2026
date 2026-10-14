import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodigoSeguridadComponent } from './codigo-seguridad.component';

const PATRON_CODIGO: RegExp = /^\d{3} \d{3}$/;
const MAXIMO_SEGUNDOS: number = 30;
const MINIMO_SEGUNDOS: number = 0;
const SEGUNDOS_URGENTE: number = 10;

describe('CodigoSeguridadComponent', () => {
  let fixture: ComponentFixture<CodigoSeguridadComponent>;
  let componente: CodigoSeguridadComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodigoSeguridadComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CodigoSeguridadComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe generar un código de 6 dígitos agrupado de a 3', () => {
    expect(componente.codigoFormateado()).toMatch(PATRON_CODIGO);
    expect(fixture.nativeElement.textContent).toContain(componente.codigoFormateado());
  });

  it('debe mostrar los segundos restantes dentro de la ventana de 30 s', () => {
    expect(componente.segundosRestantes()).toBeGreaterThan(MINIMO_SEGUNDOS);
    expect(componente.segundosRestantes()).toBeLessThanOrEqual(MAXIMO_SEGUNDOS);
    expect(fixture.nativeElement.textContent).toContain('Vence en');
  });

  it('debe marcar el estado urgente según los segundos restantes', () => {
    const urgente: boolean = componente.segundosRestantes() <= SEGUNDOS_URGENTE;
    expect(componente.urgente()).toBe(urgente);
    expect(fixture.nativeElement.querySelector('.codigo--urgente') !== null).toBe(urgente);
  });
});
