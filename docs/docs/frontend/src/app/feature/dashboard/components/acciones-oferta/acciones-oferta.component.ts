import { ChangeDetectionStrategy, Component, output, OutputEmitterRef } from '@angular/core';

/**
 * Acciones de la oferta. "Aceptar crédito" activa el webchat; "Rechazar oferta" todavía
 * no hace nada (su comportamiento se definirá junto con la lógica del proceso).
 */
@Component({
  selector: 'app-acciones-oferta',
  templateUrl: './acciones-oferta.component.html',
  styleUrl: './acciones-oferta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccionesOfertaComponent {
  public readonly aceptada: OutputEmitterRef<void> = output<void>();
}
