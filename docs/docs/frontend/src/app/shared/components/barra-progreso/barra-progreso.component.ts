import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';

const PORCENTAJE_MAXIMO: number = 100;
const PORCENTAJE_MINIMO: number = 0;

@Component({
  selector: 'app-barra-progreso',
  templateUrl: './barra-progreso.component.html',
  styleUrl: './barra-progreso.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarraProgresoComponent {
  public readonly porcentaje: InputSignal<number> = input.required<number>();
  public readonly etiqueta: InputSignal<string> = input.required<string>();
  public readonly alerta: InputSignal<boolean> = input<boolean>(false);

  public readonly valorAcotado: Signal<number> = computed<number>(() =>
    Math.round(Math.min(PORCENTAJE_MAXIMO, Math.max(PORCENTAJE_MINIMO, this.porcentaje())))
  );
}
