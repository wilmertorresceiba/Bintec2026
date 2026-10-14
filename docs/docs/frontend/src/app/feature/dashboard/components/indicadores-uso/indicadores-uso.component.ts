import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { SerieConsumo } from '@feature/dashboard/shared/interfaces/analitica';
import { formatearPesos } from '@shared/utils/formato-moneda';

@Component({
  selector: 'app-indicadores-uso',
  templateUrl: './indicadores-uso.component.html',
  styleUrl: './indicadores-uso.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadoresUsoComponent {
  public readonly serie: InputSignal<SerieConsumo> = input.required<SerieConsumo>();
  public readonly promedioPor: InputSignal<string> = input.required<string>();

  public formatear(valor: number): string {
    return formatearPesos(valor);
  }
}
