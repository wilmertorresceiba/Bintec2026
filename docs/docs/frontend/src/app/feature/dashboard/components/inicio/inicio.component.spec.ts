import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { DESFASE_MES } from '@feature/dashboard/shared/constants/meses';
import { PeriodoUso, SerieConsumo } from '@feature/dashboard/shared/interfaces/analitica';
import { DashboardDatos } from '@feature/dashboard/shared/interfaces/dashboard';
import { AnaliticaService } from '@feature/dashboard/shared/service/analitica.service';
import { DashboardService } from '@feature/dashboard/shared/service/dashboard.service';
import { SERIE_MENSUAL_FIXTURE } from '@feature/dashboard/shared/testing/analitica.fixture';
import { DASHBOARD_FIXTURE } from '@feature/dashboard/shared/testing/dashboard.fixture';
import { CERO, UNO } from '@shared/utils/numeros';
import { InicioComponent } from './inicio.component';

const CLAVE_FEBRERO: number = 2;
const ANIO_PREVIO: number = 2025;

describe('InicioComponent', () => {
  let fixture: ComponentFixture<InicioComponent>;
  let componente: InicioComponent;
  let consumo: jasmine.Spy<(p: PeriodoUso, a: number, m: number) => Observable<SerieConsumo>>;

  beforeEach(async () => {
    sessionStorage.clear();
    consumo = jasmine.createSpy('obtenerConsumo').and.returnValue(of(SERIE_MENSUAL_FIXTURE));
    await TestBed.configureTestingModule({
      imports: [InicioComponent],
      providers: [
        { provide: AnaliticaService, useValue: { obtenerConsumo: consumo } },
        {
          provide: DashboardService,
          useValue: { obtenerDashboard: (): Observable<DashboardDatos> => of(DASHBOARD_FIXTURE) },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(InicioComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('debe cargar por defecto el consumo mensual del año actual', () => {
    const [periodo, anio, mes] = consumo.calls.first().args;
    expect(periodo).toBe('mes');
    expect(anio).toBe(new Date().getFullYear());
    expect(mes).toBe(new Date().getMonth() + DESFASE_MES);
  });

  it('debe dibujar la gráfica con una barra por punto y los indicadores', () => {
    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelectorAll('g.barra').length).toBe(SERIE_MENSUAL_FIXTURE.puntos.length);
    expect(elemento.textContent).toContain('Total del periodo');
    expect(elemento.textContent).toContain('Consumo por tarjeta');
  });

  it('debe volver a consultar al cambiar el periodo', async () => {
    const consultasPrevias: number = consumo.calls.count();
    componente.cambiarPeriodo('anio');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(consumo.calls.count()).toBe(consultasPrevias + UNO);
    expect(consumo.calls.mostRecent().args[CERO]).toBe('anio');
  });

  it('debe profundizar de año a mes y de mes a día al elegir una barra', () => {
    componente.cambiarPeriodo('anio');
    componente.profundizar(ANIO_PREVIO);
    expect(componente.consulta()).toEqual(
      jasmine.objectContaining({ periodo: 'mes', anio: ANIO_PREVIO })
    );

    componente.profundizar(CLAVE_FEBRERO);
    expect(componente.consulta()).toEqual(
      jasmine.objectContaining({ periodo: 'dia', anio: ANIO_PREVIO, mes: CLAVE_FEBRERO })
    );

    componente.profundizar(UNO);
    expect(componente.consulta().periodo).toBe('dia');
  });

  it('debe mostrar el error cuando falla el API', async () => {
    consumo.and.returnValue(throwError(() => new Error('fallo')));
    componente.reintentar();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(componente.error()).toBeTrue();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('debe mostrar el estado vacío cuando no hay consumos', async () => {
    consumo.and.returnValue(of({ ...SERIE_MENSUAL_FIXTURE, total: 0, porProducto: [] }));
    componente.reintentar();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay consumos en este periodo');
    expect(fixture.nativeElement.querySelector('app-grafica-barras')).toBeNull();
  });
});
