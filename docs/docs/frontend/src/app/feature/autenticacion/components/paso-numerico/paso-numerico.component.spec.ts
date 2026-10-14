import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CERO, UNO } from '@shared/utils/numeros';
import { PasoNumericoComponent } from './paso-numerico.component';

const CUATRO: number = 4;
const SEIS: number = 6;

describe('PasoNumericoComponent', () => {
  let fixture: ComponentFixture<PasoNumericoComponent>;
  let componente: PasoNumericoComponent;
  let enviados: string[];

  const campo: () => HTMLInputElement = (): HTMLInputElement =>
    (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
  const escribir: (valor: string) => void = (valor: string): void => {
    campo().value = valor;
    campo().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const montar: (
    longitud: number,
    tipo: 'password' | 'text',
    demo: string
  ) => Promise<void> = async (
    longitud: number,
    tipo: 'password' | 'text',
    demo: string
  ): Promise<void> => {
    fixture = TestBed.createComponent(PasoNumericoComponent);
    componente = fixture.componentInstance;
    fixture.componentRef.setInput('idCampo', 'campo-numerico');
    fixture.componentRef.setInput('etiqueta', 'Clave de cajero');
    fixture.componentRef.setInput('longitud', longitud);
    fixture.componentRef.setInput('tipo', tipo);
    fixture.componentRef.setInput('valorDemo', demo);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
    enviados = [];
    componente.enviado.subscribe((v: string) => enviados.push(v));
  };

  afterEach(() => (fixture.nativeElement as HTMLElement).remove());

  it('configura el campo: teclado numérico, largo máximo y tipo', async () => {
    await montar(CUATRO, 'password', '1381');
    expect(campo().type).toBe('password');
    expect(campo().getAttribute('inputmode')).toBe('numeric');
    expect(campo().maxLength).toBe(CUATRO);
    expect(campo().placeholder).toBe('4 dígitos');
    expect(fixture.nativeElement.querySelector('label').textContent).toContain('Clave de cajero');
  });

  it('al aparecer enfoca el campo', async () => {
    await montar(CUATRO, 'password', '');
    expect(document.activeElement).toBe(campo());
  });

  it('solo admite dígitos', async () => {
    await montar(SEIS, 'text', '');
    escribir('12 34b56');
    expect(componente.valor.value).toBe('123456');
  });

  it('no envía si no tiene exactamente el largo pedido', async () => {
    await montar(CUATRO, 'password', '');
    escribir('138');
    componente.enviar();
    expect(enviados.length).toBe(CERO);
    escribir('13811');
    componente.valor.setValue('13811');
    componente.enviar();
    expect(enviados.length).toBe(CERO);
  });

  it('envía el valor cuando tiene el largo correcto', async () => {
    await montar(CUATRO, 'password', '');
    escribir('1381');
    componente.enviar();
    expect(enviados).toEqual(['1381']);
  });

  it('"Autocompletar credenciales" solo aparece si hay valor demo y lo rellena', async () => {
    await montar(CUATRO, 'password', '1381');
    expect(fixture.nativeElement.textContent).toContain('Autocompletar credenciales');
    componente.usarCredencialesDemo();
    expect(componente.valor.value).toBe('1381');

    fixture.destroy();
    await montar(CUATRO, 'password', '');
    expect(fixture.nativeElement.textContent).not.toContain('Autocompletar credenciales');
  });

  it('permite volver y muestra el error', async () => {
    await montar(CUATRO, 'password', '');
    fixture.componentRef.setInput('error', 'Dato incorrecto.');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'incorrecto'
    );

    let volvio: number = CERO;
    componente.volver.subscribe(() => volvio++);
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find(b => b.textContent?.includes('Volver'))
      ?.click();
    expect(volvio).toBe(UNO);
  });
});
