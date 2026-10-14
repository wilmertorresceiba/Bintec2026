import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';

const ESQUELETOS: readonly string[] = ['uno', 'dos', 'tres'] as const;

/** Envuelve el contenido de una pantalla con los estados de carga y de error. */
@Component({
  selector: 'app-estado-datos',
  templateUrl: './estado-datos.component.html',
  styleUrl: './estado-datos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoDatosComponent {
  public readonly cargando: InputSignal<boolean> = input<boolean>(false);
  public readonly error: InputSignal<boolean> = input<boolean>(false);
  public readonly etiquetaCarga: InputSignal<string> = input<string>('Cargando información');
  public readonly reintentar: OutputEmitterRef<void> = output<void>();

  public readonly esqueletos: readonly string[] = ESQUELETOS;
}
