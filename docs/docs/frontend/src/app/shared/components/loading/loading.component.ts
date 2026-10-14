import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

export type TamanoLoading = 'sm' | 'md' | 'lg';
export type ModoLoading = 'inline' | 'bloque' | 'pantalla';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-modo]': 'modo()',
    '[attr.data-tamano]': 'tamano()',
  },
})
export class LoadingComponent {
  /** Texto accesible; se muestra salvo que `ocultarMensaje` sea true. */
  public readonly mensaje: InputSignal<string> = input<string>('Cargando…');
  public readonly tamano: InputSignal<TamanoLoading> = input<TamanoLoading>('md');
  /** inline: junto al texto | bloque: centrado en su contenedor | pantalla: cubre la ventana. */
  public readonly modo: InputSignal<ModoLoading> = input<ModoLoading>('bloque');
  public readonly ocultarMensaje: InputSignal<boolean> = input<boolean>(false);
}
