import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { Movimiento } from '@feature/dashboard/shared/interfaces/dashboard';
import { FiltroReporte } from '@feature/dashboard/shared/interfaces/reporte';
import { ReportesService } from '@feature/dashboard/shared/service/reportes.service';
import { DASHBOARD_FIXTURE } from '@feature/dashboard/shared/testing/dashboard.fixture';
import { CERO } from '@shared/utils/numeros';
import { ReportesComponent } from './reportes.component';

const PATRON_FECHA: RegExp = /^\d{4}-\d{2}-\d{2}$/;

describe('ReportesComponent', () => {
  let fixture: ComponentFixture<ReportesComponent>;
  let componente: ReportesComponent;
  let buscar: jasmine.Spy<(f: FiltroReporte) => Observable<Movimiento[]>>;

  beforeEach(async () => {
    buscar = jasmine
      .createSpy('buscarMovimientos')
      .and.returnValue(of(DASHBOARD_FIXTURE.movimientos));
    await TestBed.configureTestingModule({
      imports: [ReportesComponent],
      providers: [{ provide: ReportesService, useValue: { buscarMovimientos: buscar } }],
    }).compileComponents();
    fixture = TestBed.createComponent(ReportesComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe consultar al iniciar con los últimos 30 días y mostrar los movimientos', () => {
    const filtro: FiltroReporte = buscar.calls.first().args[CERO];
    expect(filtro.desde).toMatch(PATRON_FECHA);
    expect(filtro.desde <= filtro.hasta).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(
      DASHBOARD_FIXTURE.movimientos.length
    );
  });

  it('debe totalizar cargos y abonos', () => {
    const cargos: number = DASHBOARD_FIXTURE.movimientos
      .filter(m => m.valor < CERO)
      .reduce((suma, m) => suma - m.valor, CERO);
    expect(componente.totalCargos()).toBe(cargos);
    expect(componente.totalAbonos()).toBeGreaterThan(CERO);
  });

  it('debe enviar el filtro elegido al consultar', () => {
    componente.formulario.patchValue({ desde: '2026-01-01', hasta: '2026-01-31', tipo: 'AVANCE' });
    componente.consultar();
    expect(buscar.calls.mostRecent().args[CERO]).toEqual({
      desde: '2026-01-01',
      hasta: '2026-01-31',
      tipo: 'AVANCE',
    });
  });

  it('no debe consultar si el rango de fechas está invertido', () => {
    const consultas: number = buscar.calls.count();
    componente.formulario.patchValue({ desde: '2026-02-01', hasta: '2026-01-01' });
    componente.consultar();
    expect(buscar.calls.count()).toBe(consultas);
    expect(componente.errorRango()).toContain('anterior');
  });
});
