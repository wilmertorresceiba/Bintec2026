import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Notificacion } from '@core/interfaces/notificacion';

/** Tarjeta de una notificación activa. La decisión se toma en la pantalla de detalle. */
@Component({
  selector: 'app-aviso-notificacion',
  templateUrl: './aviso-notificacion.component.html',
  styleUrl: './aviso-notificacion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
})
export class AvisoNotificacionComponent {
  public readonly notificacion: InputSignal<Notificacion> = input.required<Notificacion>();

  /** Se emite al ir al detalle (para que quien la contiene cierre su panel). */
  public readonly detalleAbierto: OutputEmitterRef<void> = output<void>();
}
