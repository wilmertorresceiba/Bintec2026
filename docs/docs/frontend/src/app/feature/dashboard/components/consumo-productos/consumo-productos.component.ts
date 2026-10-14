import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { ConsumoProducto } from '@feature/dashboard/shared/interfaces/analitica';
import { BarraProgresoComponent } from '@shared/components/barra-progreso/barra-progreso.component';
import { formatearPesos } from '@shared/utils/formato-moneda';
import { UNO } from '@shared/utils/numeros';

const PORCENTAJE_MAXIMO: number = 100;

interface FilaProducto extends ConsumoProducto {
  porcentaje: number;
  etiquetaProgreso: string;
  totalFormateado: string;
}

/** Participación de cada tarjeta en el consumo del periodo. */
@Component({
  selector: 'app-consumo-productos',
  templateUrl: './consumo-productos.component.html',
  styleUrl: './consumo-productos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BarraProgresoComponent],
})
export class ConsumoProductosComponent {
  public readonly productos: InputSignal<readonly ConsumoProducto[]> =
    input.required<readonly ConsumoProducto[]>();

  public readonly filas: Signal<FilaProducto[]> = computed<FilaProducto[]>(() => {
    const mayor: number = Math.max(UNO, ...this.productos().map(p => p.total));
    return this.productos().map((p: ConsumoProducto) => ({
      ...p,
      porcentaje: (p.total / mayor) * PORCENTAJE_MAXIMO,
      etiquetaProgreso: `Participación de ${p.producto}`,
      totalFormateado: formatearPesos(p.total),
    }));
  });
}
