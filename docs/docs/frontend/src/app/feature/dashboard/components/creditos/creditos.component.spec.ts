import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { Credito, TarjetaCredito } from '@feature/dashboard/shared/interfaces/dashboard';
import { ProductosService } from '@feature/dashboard/shared/service/productos.service';
import { DASHBOARD_FIXTURE } from '@feature/dashboard/shared/testing/dashboard.fixture';
import { CreditosComponent } from './creditos.component';

describe('CreditosComponent', () => {
  let fixture: ComponentFixture<CreditosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditosComponent],
      providers: [
        {
          provide: ProductosService,
          useValue: {
            obtenerTarjetas: (): Observable<TarjetaCredito[]> => of([]),
            obtenerCreditos: (): Observable<Credito[]> => of(DASHBOARD_FIXTURE.creditos),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CreditosComponent);
    fixture.detectChanges();
  });

  it('debe mostrar un bloque por cada crédito del cliente', () => {
    expect(fixture.nativeElement.querySelectorAll('app-credito').length).toBe(
      DASHBOARD_FIXTURE.creditos.length
    );
  });
});
