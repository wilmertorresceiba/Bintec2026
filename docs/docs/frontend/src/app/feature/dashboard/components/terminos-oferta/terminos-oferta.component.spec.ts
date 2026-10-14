import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleOferta } from '@core/interfaces/notificacion';
import { TerminosOfertaComponent } from './terminos-oferta.component';

const OFERTA: DetalleOferta = {
  monto: 15_000_000,
  cuotas: 24,
  tasaMensual: 1.55,
  valorCuota: 753_217,
  totalAPagar: 18_077_208,
  fechaPrimeraCuota: '2026-11-12T00:00:00Z',
};

describe('TerminosOfertaComponent', () => {
  let fixture: ComponentFixture<TerminosOfertaComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminosOfertaComponent);
    fixture.componentRef.setInput('oferta', OFERTA);
    fixture.detectChanges();
  });

  it('debe mostrar todas las condiciones del crédito', () => {
    const texto: string = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    for (const esperado of [
      'Monto aprobado',
      '24 cuotas mensuales',
      'Valor de cada cuota',
      'Total a pagar',
      'Tasa mensual',
      'Primera cuota',
    ]) {
      expect(texto).toContain(esperado);
    }
    expect(texto).toMatch(/15\.000\.000/);
    expect(texto).toMatch(/753\.217/);
    expect(texto).toMatch(/18\.077\.208/);
    expect(texto).toMatch(/1[.,]55 %/);
  });
});
