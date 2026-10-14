import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { DetalleNotificacion, EstadoNotificacion } from '@core/interfaces/notificacion';
import { OfertasService } from '@feature/dashboard/shared/service/ofertas.service';
import { OfertaCreditoComponent } from './oferta-credito.component';

const NO_ENCONTRADA: number = 404;
const UNA_CONSULTA: number = 1;

const detalle: (estado: EstadoNotificacion) => DetalleNotificacion = (
  estado: EstadoNotificacion
): DetalleNotificacion => ({
  notificacion: {
    id: 'n-1',
    tipo: 'CREDITO_PREAPROBADO',
    titulo: 'Crédito preaprobado',
    mensaje: 'Oferta',
    fecha: '2026-10-12T00:00:00Z',
    estado,
  },
  oferta: {
    monto: 15_000_000,
    cuotas: 24,
    tasaMensual: 1.55,
    valorCuota: 753_217,
    totalAPagar: 18_077_208,
    fechaPrimeraCuota: '2026-11-12T00:00:00Z',
  },
});

describe('OfertaCreditoComponent', () => {
  let fixture: ComponentFixture<OfertaCreditoComponent>;
  let obtener: jasmine.Spy<(id: string) => Observable<DetalleNotificacion>>;

  const elemento: () => HTMLElement = (): HTMLElement => fixture.nativeElement;
  const texto: () => string = (): string => elemento().textContent ?? '';
  const pulsar: (contiene: string) => void = (contiene: string): void => {
    Array.from(elemento().querySelectorAll<HTMLButtonElement>('button'))
      .find(b => b.textContent?.includes(contiene))
      ?.click();
    fixture.detectChanges();
  };

  const montar: (respuesta: Observable<DetalleNotificacion>) => void = (
    respuesta: Observable<DetalleNotificacion>
  ): void => {
    obtener = jasmine.createSpy('obtenerDetalle').and.returnValue(respuesta);
    TestBed.configureTestingModule({
      imports: [OfertaCreditoComponent],
      providers: [
        provideRouter([]),
        { provide: OfertasService, useValue: { obtenerDetalle: obtener } },
      ],
    });
    fixture = TestBed.createComponent(OfertaCreditoComponent);
    fixture.componentRef.setInput('id', 'n-1');
    fixture.detectChanges();
  };

  it('debe cargar el detalle por id y mostrar las condiciones con las dos opciones', () => {
    montar(of(detalle('PENDIENTE')));
    expect(obtener).toHaveBeenCalledWith('n-1');
    expect(texto()).toContain('Monto aprobado');
    expect(texto()).toContain('Aceptar crédito');
    expect(texto()).toContain('Rechazar oferta');
    expect(elemento().querySelector('app-webchat')).toBeNull();
  });

  it('"Aceptar crédito" activa el webchat directamente, sin llamar a ningún endpoint', () => {
    montar(of(detalle('PENDIENTE')));
    pulsar('Aceptar crédito');

    expect(elemento().querySelector('app-webchat')).not.toBeNull();
    expect(texto()).toContain('Chat activado');
    expect(texto()).not.toContain('Aceptar crédito');
    expect(obtener).toHaveBeenCalledTimes(UNA_CONSULTA);
  });

  it('"Rechazar oferta" no hace nada: el webchat no se activa y la pantalla no cambia', () => {
    montar(of(detalle('PENDIENTE')));
    const antes: string = elemento().innerHTML;
    pulsar('Rechazar oferta');

    expect(elemento().querySelector('app-webchat')).toBeNull();
    expect(elemento().innerHTML).toBe(antes);
  });

  it('al cerrar el webchat vuelven las opciones de la oferta', () => {
    montar(of(detalle('PENDIENTE')));
    pulsar('Aceptar crédito');
    elemento().querySelector<HTMLButtonElement>('.webchat__cerrar')?.click();
    fixture.detectChanges();

    expect(elemento().querySelector('app-webchat')).toBeNull();
    expect(texto()).toContain('Aceptar crédito');
  });

  it('una oferta ya resuelta no permite iniciar el chat', () => {
    montar(of(detalle('ACEPTADA')));
    expect(texto()).toContain('Esta oferta ya fue aceptada');
    expect(texto()).not.toContain('Aceptar crédito');
  });

  it('una oferta inexistente (o de otro cliente) muestra "no encontramos"', () => {
    montar(throwError(() => ({ status: NO_ENCONTRADA })));
    expect(texto()).toContain('No encontramos esta oferta');
  });
});
