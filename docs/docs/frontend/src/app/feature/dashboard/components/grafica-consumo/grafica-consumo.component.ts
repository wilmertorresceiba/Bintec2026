import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import {
  GraficaBarrasComponent,
  PuntoGrafica,
} from '@shared/components/grafica-barras/grafica-barras.component';

/** Tarjeta que enmarca la gráfica de consumo y maneja su estado vacío. */
@Component({
  selector: 'app-grafica-consumo',
  templateUrl: './grafica-consumo.component.html',
  styleUrl: './grafica-consumo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GraficaBarrasComponent],
})
export class GraficaConsumoComponent {
  public readonly titulo: InputSignal<string> = input.required<string>();
  public readonly puntos: InputSignal<readonly PuntoGrafica[]> =
    input.required<readonly PuntoGrafica[]>();
  public readonly serie: InputSignal<string> = input.required<string>();
  public readonly vacia: InputSignal<boolean> = input<boolean>(false);
  public readonly interactiva: InputSignal<boolean> = input<boolean>(false);
  public readonly actualizando: InputSignal<boolean> = input<boolean>(false);

  public readonly seleccionado: OutputEmitterRef<number> = output<number>();
}
