import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { CuentaAhorro } from '@feature/dashboard/shared/interfaces/dashboard';
import { ProductosService } from '@feature/dashboard/shared/service/productos.service';
import { CUENTAS_FIXTURE } from '@feature/dashboard/shared/testing/cuentas.fixture';
import { CuentasComponent } from './cuentas.component';

describe('CuentasComponent', () => {
  let fixture: ComponentFixture<CuentasComponent>;
  let cuentas$: Observable<CuentaAhorro[]>;

  const montar: () => void = (): void => {
    TestBed.configureTestingModule({
      imports: [CuentasComponent],
      providers: [
        {
          provide: ProductosService,
          useValue: { obtenerCuentas: (): Observable<CuentaAhorro[]> => cuentas$ },
        },
      ],
    });
    fixture = TestBed.createComponent(CuentasComponent);
    fixture.detectChanges();
  };

  it('debe mostrar una tarjeta por cada cuenta de ahorro', () => {
    cuentas$ = of(CUENTAS_FIXTURE);
    montar();
    expect(fixture.nativeElement.querySelectorAll('app-cuenta-ahorro').length).toBe(
      CUENTAS_FIXTURE.length
    );
  });

  it('debe mostrar el estado vacío si no hay cuentas', () => {
    cuentas$ = of([]);
    montar();
    expect(fixture.nativeElement.textContent).toContain('Aún no tienes cuentas de ahorro');
  });

  it('debe mostrar error si falla la carga', () => {
    cuentas$ = throwError(() => new Error('fallo'));
    montar();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });
});
