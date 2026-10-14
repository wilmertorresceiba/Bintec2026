import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { SesionService } from '@core/services/sesion/sesion.service';
import { ConsumoProductosComponent } from '@feature/dashboard/components/consumo-productos/consumo-productos.component';
import { FiltrosUsoComponent } from '@feature/dashboard/components/filtros-uso/filtros-uso.component';
import { GraficaConsumoComponent } from '@feature/dashboard/components/grafica-consumo/grafica-consumo.component';
import { IndicadoresUsoComponent } from '@feature/dashboard/components/indicadores-uso/indicadores-uso.component';
import { ResumenFinancieroComponent } from '@feature/dashboard/components/resumen-financiero/resumen-financiero.component';
import { DESFASE_MES, MESES } from '@feature/dashboard/shared/constants/meses';
import {
  PeriodoUso,
  PuntoConsumo,
  SerieConsumo,
} from '@feature/dashboard/shared/interfaces/analitica';
import { DashboardDatos, ResumenFinanciero } from '@feature/dashboard/shared/interfaces/dashboard';
import { AnaliticaService } from '@feature/dashboard/shared/service/analitica.service';
import { DashboardService } from '@feature/dashboard/shared/service/dashboard.service';
import { EstadoDatosComponent } from '@shared/components/estado-datos/estado-datos.component';
import { PuntoGrafica } from '@shared/components/grafica-barras/grafica-barras.component';
import { formatearPesos } from '@shared/utils/formato-moneda';
import { CERO, UNO } from '@shared/utils/numeros';

interface ConsultaConsumo {
  periodo: PeriodoUso;
  anio: number;
  mes: number;
}

const PROMEDIO_POR_PERIODO: Record<PeriodoUso, string> = {
  anio: 'año',
  mes: 'mes',
  dia: 'día',
};

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResumenFinancieroComponent,
    FiltrosUsoComponent,
    IndicadoresUsoComponent,
    GraficaConsumoComponent,
    ConsumoProductosComponent,
    EstadoDatosComponent,
  ],
})
export class InicioComponent {
  public readonly sesionService: SesionService = inject(SesionService);
  public readonly consulta: WritableSignal<ConsultaConsumo> = signal<ConsultaConsumo>(
    this.consultaInicial()
  );
  public readonly serie: WritableSignal<SerieConsumo | null> = signal<SerieConsumo | null>(null);
  public readonly resumen: WritableSignal<ResumenFinanciero | null> =
    signal<ResumenFinanciero | null>(null);
  public readonly cargando: WritableSignal<boolean> = signal<boolean>(true);
  public readonly error: WritableSignal<boolean> = signal<boolean>(false);

  public readonly puntos: Signal<PuntoGrafica[]> = computed<PuntoGrafica[]>(() =>
    (this.serie()?.puntos ?? []).map((punto: PuntoConsumo) => ({
      clave: punto.clave,
      etiqueta: this.etiquetaLarga(punto.clave, punto.etiqueta),
      etiquetaCorta: punto.etiqueta,
      valor: punto.total,
      detalle: `${formatearPesos(punto.total)} · ${this.textoCargos(punto.transacciones)}`,
    }))
  );
  public readonly tituloGrafica: Signal<string> = computed<string>(() => {
    const { periodo, anio, mes }: ConsultaConsumo = this.consulta();
    switch (periodo) {
      case 'anio':
        return 'Consumo por año';
      case 'mes':
        return `Consumo por mes · ${anio}`;
      default:
        return `Consumo por día · ${MESES[mes - DESFASE_MES]} ${anio}`;
    }
  });
  public readonly idSerie: Signal<string> = computed<string>(() => {
    const { periodo, anio, mes }: ConsultaConsumo = this.consulta();
    return `${periodo}-${anio}-${mes}`;
  });
  public readonly promedioPor: Signal<string> = computed<string>(
    () => PROMEDIO_POR_PERIODO[this.consulta().periodo]
  );
  public readonly interactiva: Signal<boolean> = computed<boolean>(
    () => this.consulta().periodo !== 'dia'
  );
  public readonly anios: Signal<number[]> = computed<number[]>(
    () => this.serie()?.aniosDisponibles ?? [this.consulta().anio]
  );
  public readonly sinConsumos: Signal<boolean> = computed<boolean>(
    () => (this.serie()?.total ?? CERO) === CERO
  );

  private readonly analiticaService: AnaliticaService = inject(AnaliticaService);
  private readonly dashboardService: DashboardService = inject(DashboardService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor() {
    toObservable(this.consulta)
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(false);
        }),
        switchMap((c: ConsultaConsumo) =>
          this.analiticaService.obtenerConsumo(c.periodo, c.anio, c.mes).pipe(
            catchError(() => {
              this.error.set(true);
              this.cargando.set(false);
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((serie: SerieConsumo) => {
        this.serie.set(serie);
        this.cargando.set(false);
      });

    this.dashboardService
      .obtenerDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos: DashboardDatos) => this.resumen.set(datos.resumen),
        error: () => this.resumen.set(null),
      });
  }

  public cambiarPeriodo(periodo: PeriodoUso): void {
    this.consulta.update((c: ConsultaConsumo) => ({ ...c, periodo }));
  }

  public cambiarAnio(anio: number): void {
    this.consulta.update((c: ConsultaConsumo) => ({ ...c, anio }));
  }

  public cambiarMes(mes: number): void {
    this.consulta.update((c: ConsultaConsumo) => ({ ...c, mes }));
  }

  /** Drill-down: un clic en un año abre sus meses; un clic en un mes abre sus días. */
  public profundizar(clave: number): void {
    const { periodo }: ConsultaConsumo = this.consulta();
    if (periodo === 'anio') {
      this.consulta.update((c: ConsultaConsumo) => ({ ...c, periodo: 'mes', anio: clave }));
    } else if (periodo === 'mes') {
      this.consulta.update((c: ConsultaConsumo) => ({ ...c, periodo: 'dia', mes: clave }));
    }
  }

  public reintentar(): void {
    this.consulta.update((c: ConsultaConsumo) => ({ ...c }));
  }

  private textoCargos(cantidad: number): string {
    return `${cantidad} ${cantidad === UNO ? 'cargo' : 'cargos'}`;
  }

  private etiquetaLarga(clave: number, etiqueta: string): string {
    const { periodo, anio, mes }: ConsultaConsumo = this.consulta();
    switch (periodo) {
      case 'mes':
        return `${MESES[clave - DESFASE_MES]} ${anio}`;
      case 'dia':
        return `${etiqueta} de ${MESES[mes - DESFASE_MES]}`;
      default:
        return etiqueta;
    }
  }

  private consultaInicial(): ConsultaConsumo {
    const hoy: Date = new Date();
    return { periodo: 'mes', anio: hoy.getFullYear(), mes: hoy.getMonth() + DESFASE_MES };
  }
}
