import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MovimientosComponent } from '@feature/dashboard/components/movimientos/movimientos.component';
import { Movimiento, TipoMovimiento } from '@feature/dashboard/shared/interfaces/dashboard';
import { FiltroReporte } from '@feature/dashboard/shared/interfaces/reporte';
import { ReportesService } from '@feature/dashboard/shared/service/reportes.service';
import { EstadoDatosComponent } from '@shared/components/estado-datos/estado-datos.component';
import { construirCsv, descargarCsv } from '@shared/utils/descargar-csv';
import { formatearPesos } from '@shared/utils/formato-moneda';
import { CERO } from '@shared/utils/numeros';

interface FormularioReporte {
  desde: FormControl<string>;
  hasta: FormControl<string>;
  tipo: FormControl<TipoMovimiento | ''>;
}

interface OpcionTipo {
  valor: TipoMovimiento | '';
  etiqueta: string;
}

const DIAS_REPORTE_INICIAL: number = 30;
const MS_POR_MINUTO: number = 60_000;
const MS_POR_DIA: number = 86_400_000;
const LARGO_FECHA_ISO: number = 10;
const ENCABEZADOS_CSV: readonly string[] = ['Fecha', 'Descripción', 'Producto', 'Tipo', 'Valor'];
const TIPOS: readonly OpcionTipo[] = [
  { valor: '', etiqueta: 'Todos los tipos' },
  { valor: 'COMPRA', etiqueta: 'Compras' },
  { valor: 'AVANCE', etiqueta: 'Avances' },
  { valor: 'PAGO', etiqueta: 'Pagos' },
  { valor: 'CUOTA_CREDITO', etiqueta: 'Cuotas de crédito' },
] as const;

/** Fecha local en formato YYYY-MM-DD (lo que espera <input type="date"> y el API). */
function aFechaLocal(fecha: Date): string {
  const local: Date = new Date(fecha.getTime() - fecha.getTimezoneOffset() * MS_POR_MINUTO);
  return local.toISOString().slice(CERO, LARGO_FECHA_ISO);
}

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MovimientosComponent, EstadoDatosComponent],
})
export class ReportesComponent implements OnInit {
  public readonly tipos: readonly OpcionTipo[] = TIPOS;
  public readonly movimientos: WritableSignal<Movimiento[]> = signal<Movimiento[]>([]);
  public readonly cargando: WritableSignal<boolean> = signal<boolean>(true);
  public readonly error: WritableSignal<boolean> = signal<boolean>(false);
  public readonly errorRango: WritableSignal<string | null> = signal<string | null>(null);

  public readonly totalCargos: Signal<number> = computed<number>(() =>
    this.movimientos()
      .filter((m: Movimiento) => m.valor < CERO)
      .reduce((suma: number, m: Movimiento) => suma + Math.abs(m.valor), CERO)
  );
  public readonly totalAbonos: Signal<number> = computed<number>(() =>
    this.movimientos()
      .filter((m: Movimiento) => m.valor > CERO)
      .reduce((suma: number, m: Movimiento) => suma + m.valor, CERO)
  );

  public readonly formulario: FormGroup<FormularioReporte> = inject(FormBuilder).nonNullable.group({
    desde: aFechaLocal(new Date(Date.now() - DIAS_REPORTE_INICIAL * MS_POR_DIA)),
    hasta: aFechaLocal(new Date()),
    tipo: '' as TipoMovimiento | '',
  });

  private readonly reportesService: ReportesService = inject(ReportesService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this.consultar();
  }

  public consultar(): void {
    const filtro: FiltroReporte = this.formulario.getRawValue();
    if (filtro.desde && filtro.hasta && filtro.desde > filtro.hasta) {
      this.errorRango.set('La fecha inicial debe ser anterior o igual a la fecha final.');
      return;
    }
    this.errorRango.set(null);
    this.cargando.set(true);
    this.error.set(false);

    this.reportesService
      .buscarMovimientos(filtro)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (movimientos: Movimiento[]) => {
          this.movimientos.set(movimientos);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
        },
      });
  }

  public descargar(): void {
    const filas: (string | number)[][] = this.movimientos().map((m: Movimiento) => [
      m.fecha.slice(CERO, LARGO_FECHA_ISO),
      m.descripcion,
      m.producto,
      m.tipo,
      m.valor,
    ]);
    descargarCsv(
      `reporte-movimientos-${aFechaLocal(new Date())}.csv`,
      construirCsv(ENCABEZADOS_CSV, filas)
    );
  }

  public formatear(valor: number): string {
    return formatearPesos(valor);
  }
}
