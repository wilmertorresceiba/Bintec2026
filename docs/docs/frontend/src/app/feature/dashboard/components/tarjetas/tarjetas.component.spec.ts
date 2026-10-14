import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { Credito, TarjetaCredito } from '@feature/dashboard/shared/interfaces/dashboard';
import { ProductosService } from '@feature/dashboard/shared/service/productos.service';
import { DASHBOARD_FIXTURE } from '@feature/dashboard/shared/testing/dashboard.fixture';
import { TarjetasComponent } from './tarjetas.component';

describe('TarjetasComponent', () => {
  let fixture: ComponentFixture<TarjetasComponent>;
  let tarjetas$: Observable<TarjetaCredito[]>;

  const montar: () => void = (): void => {
    TestBed.configureTestingModule({
      imports: [TarjetasComponent],
      providers: [
        {
          provide: ProductosService,
          useValue: {
            obtenerTarjetas: (): Observable<TarjetaCredito[]> => tarjetas$,
            obtenerCreditos: (): Observable<Credito[]> => of([]),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(TarjetasComponent);
    fixture.detectChanges();
  };

  it('debe mostrar una tarjeta por cada tarjeta del cliente', () => {
    tarjetas$ = of(DASHBOARD_FIXTURE.tarjetas);
    montar();
    expect(fixture.nativeElement.querySelectorAll('app-tarjeta-credito').length).toBe(
      DASHBOARD_FIXTURE.tarjetas.length
    );
  });

  it('debe mostrar el estado vacío si no hay tarjetas', () => {
    tarjetas$ = of([]);
    montar();
    expect(fixture.nativeElement.textContent).toContain('Aún no tienes tarjetas');
  });

  it('debe mostrar error si falla la carga', () => {
    tarjetas$ = throwError(() => new Error('fallo'));
    montar();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });
});
