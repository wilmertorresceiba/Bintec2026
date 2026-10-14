import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CERO } from '@shared/utils/numeros';
import { Barra, GraficaBarrasComponent, PuntoGrafica } from './grafica-barras.component';

const PUNTOS: PuntoGrafica[] = [
  { clave: 2024, etiqueta: '2024', valor: 100, detalle: '$ 100' },
  { clave: 2025, etiqueta: '2025', valor: 400, detalle: '$ 400' },
  { clave: 2026, etiqueta: '2026', valor: 0, detalle: '$ 0' },
];
const SEGUNDA_BARRA: number = 1;
const PROPORCION_ESPERADA: number = 4;
const PRECISION: number = 5;
const DOCE: number = 12;
const DOS: number = 2;
const ANCHO_ESTRECHO: number = 320;

describe('GraficaBarrasComponent', () => {
  let fixture: ComponentFixture<GraficaBarrasComponent>;
  let componente: GraficaBarrasComponent;

  const barrasEnDom: () => HTMLElement[] = (): HTMLElement[] =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('g.barra'));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraficaBarrasComponent);
    componente = fixture.componentInstance;
    fixture.componentRef.setInput('puntos', PUNTOS);
    fixture.componentRef.setInput('titulo', 'Consumo por año');
    fixture.componentRef.setInput('serie', 'anio');
    fixture.detectChanges();
  });

  it('debe dibujar una barra por punto con etiqueta accesible', () => {
    expect(barrasEnDom().length).toBe(PUNTOS.length);
    expect(barrasEnDom()[SEGUNDA_BARRA].getAttribute('aria-label')).toBe('2025: $ 400');
  });

  it('debe escalar las alturas proporcionalmente al mayor valor', () => {
    const barras: Barra[] = componente.barras();
    const [primera, segunda, tercera] = barras;
    expect(segunda.alto).toBeGreaterThan(primera.alto);
    expect(segunda.alto / primera.alto).toBeCloseTo(PROPORCION_ESPERADA, PRECISION);
    expect(tercera.alto).toBe(CERO);
  });

  it('debe mostrar el tooltip al pasar el mouse sobre una barra', () => {
    expect(componente.tooltip()).toBeNull();
    barrasEnDom()[SEGUNDA_BARRA].dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(componente.tooltip()?.barra.clave).toBe(PUNTOS[SEGUNDA_BARRA].clave);
    expect(fixture.nativeElement.textContent).toContain('$ 400');
  });

  it('no debe emitir selección si no es interactiva', () => {
    const emitidas: number[] = [];
    componente.seleccionado.subscribe((c: number) => emitidas.push(c));
    barrasEnDom()[SEGUNDA_BARRA].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(emitidas.length).toBe(CERO);
  });

  it('debe emitir la clave al hacer clic o pulsar Enter cuando es interactiva', () => {
    fixture.componentRef.setInput('interactivo', true);
    fixture.detectChanges();
    const emitidas: number[] = [];
    componente.seleccionado.subscribe((c: number) => emitidas.push(c));

    barrasEnDom()[SEGUNDA_BARRA].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    barrasEnDom()[CERO].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(emitidas).toEqual([PUNTOS[SEGUNDA_BARRA].clave, PUNTOS[CERO].clave]);
    expect(barrasEnDom()[CERO].getAttribute('role')).toBe('button');
  });

  it('con todos los valores en cero no debe producir alturas inválidas', () => {
    fixture.componentRef.setInput(
      'puntos',
      PUNTOS.map((p: PuntoGrafica) => ({ ...p, valor: 0 }))
    );
    fixture.detectChanges();
    expect(componente.barras().every(b => b.alto === CERO && Number.isFinite(b.y))).toBeTrue();
  });

  it('en pantallas estrechas usa menos etiquetas en el eje X y no muestra el valor máximo', () => {
    const doce: PuntoGrafica[] = Array.from({ length: DOCE }, (_, i: number) => ({
      clave: i + SEGUNDA_BARRA,
      etiqueta: `M${i}`,
      valor: i,
      detalle: '',
    }));
    fixture.componentRef.setInput('puntos', doce);
    componente.ancho.set(ANCHO_ESTRECHO);
    fixture.detectChanges();

    expect(componente.compacto()).toBeTrue();
    expect(componente.barras().filter(b => b.mostrarEtiqueta).length).toBe(DOCE / DOS);
    expect((fixture.nativeElement as HTMLElement).querySelector('.barra__valor')).toBeNull();
  });
});
