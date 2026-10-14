import { DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { DetalleOferta } from '@core/interfaces/notificacion';
import { formatearPesos } from '@shared/utils/formato-moneda';

interface FilaTermino {
  titulo: string;
  valor: string;
  destacada: boolean;
}

/** Condiciones del crédito preaprobado. */
@Component({
  selector: 'app-terminos-oferta',
  templateUrl: './terminos-oferta.component.html',
  styleUrl: './terminos-oferta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe],
})
export class TerminosOfertaComponent {
  public readonly oferta: InputSignal<DetalleOferta> = input.required<DetalleOferta>();

  public readonly filas: Signal<FilaTermino[]> = computed<FilaTermino[]>(() => {
    const o: DetalleOferta = this.oferta();
    return [
      { titulo: 'Monto aprobado', valor: formatearPesos(o.monto), destacada: true },
      { titulo: 'Plazo', valor: `${o.cuotas} cuotas mensuales`, destacada: false },
      { titulo: 'Valor de cada cuota', valor: formatearPesos(o.valorCuota), destacada: true },
      { titulo: 'Total a pagar', valor: formatearPesos(o.totalAPagar), destacada: false },
    ];
  });
}
