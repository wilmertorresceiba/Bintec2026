import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CERO, UNO } from '@shared/utils/numeros';
import { AccionesOfertaComponent } from './acciones-oferta.component';

describe('AccionesOfertaComponent', () => {
  let fixture: ComponentFixture<AccionesOfertaComponent>;
  let aceptadas: number;

  const boton: (texto: string) => HTMLButtonElement = (texto: string): HTMLButtonElement =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(b =>
      b.textContent?.includes(texto)
    ) as HTMLButtonElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(AccionesOfertaComponent);
    fixture.detectChanges();
    aceptadas = CERO;
    fixture.componentInstance.aceptada.subscribe(() => aceptadas++);
  });

  it('muestra las opciones Aceptar crédito y Rechazar oferta', () => {
    expect(boton('Aceptar crédito')).toBeTruthy();
    expect(boton('Rechazar oferta')).toBeTruthy();
  });

  it('"Aceptar crédito" emite directamente, sin pedir confirmación', () => {
    boton('Aceptar crédito').click();
    expect(aceptadas).toBe(UNO);
  });

  it('"Rechazar oferta" no hace nada: no emite ni cambia la pantalla', () => {
    const antes: string = fixture.nativeElement.innerHTML;
    boton('Rechazar oferta').click();
    fixture.detectChanges();
    expect(aceptadas).toBe(CERO);
    expect(fixture.nativeElement.innerHTML).toBe(antes);
  });
});
