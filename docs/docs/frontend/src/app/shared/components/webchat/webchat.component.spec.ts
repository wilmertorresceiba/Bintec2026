import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CERO, UNO } from '@shared/utils/numeros';
import { WebchatComponent } from './webchat.component';

describe('WebchatComponent', () => {
  let fixture: ComponentFixture<WebchatComponent>;
  let componente: WebchatComponent;

  const elemento: () => HTMLElement = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(WebchatComponent);
    componente = fixture.componentInstance;
    document.body.appendChild(elemento());
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => elemento().remove());

  it('debe mostrarse activado, con título y región accesible', () => {
    expect(elemento().querySelector('[role="region"]')).not.toBeNull();
    expect(elemento().textContent).toContain('Asistente virtual');
    expect(elemento().textContent).toContain('Chat activado');
    expect(elemento().querySelector('[role="log"]')?.getAttribute('aria-live')).toBe('polite');
  });

  it('permite personalizar el título', () => {
    fixture.componentRef.setInput('titulo', 'Asesor de crédito');
    fixture.detectChanges();
    expect(elemento().textContent).toContain('Asesor de crédito');
  });

  it('al activarse mueve el foco al chat', () => {
    expect(document.activeElement).toBe(elemento().querySelector('.webchat'));
  });

  it('aún no tiene lógica: la conversación está vacía y no se puede escribir', () => {
    expect(elemento().querySelectorAll('[role="log"] p').length).toBe(UNO);
    expect(elemento().querySelector<HTMLInputElement>('input')?.disabled).toBeTrue();
    expect(
      elemento().querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled
    ).toBeTrue();
  });

  it('se cierra con el botón o con Escape', () => {
    let cierres: number = CERO;
    componente.cerrado.subscribe(() => cierres++);

    elemento().querySelector<HTMLButtonElement>('.webchat__cerrar')?.click();
    elemento()
      .querySelector('.webchat')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(cierres).toBe(UNO + UNO);
  });
});
