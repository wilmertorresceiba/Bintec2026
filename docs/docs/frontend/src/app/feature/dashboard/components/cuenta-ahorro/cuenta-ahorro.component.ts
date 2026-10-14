import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { CuentaAhorro, EstadoCuenta } from '@feature/dashboard/shared/interfaces/dashboard';

const ETIQUETAS_ESTADO: Record<EstadoCuenta, string> = {
  ACTIVA: 'Activa',
  INACTIVA: 'Inactiva',
  BLOQUEADA: 'Bloqueada',
};

/** Tarjeta de una cuenta de ahorros: saldo disponible, rendimientos y tasa. */
@Component({
  selector: 'app-cuenta-ahorro',
  templateUrl: './cuenta-ahorro.component.html',
  styleUrl: './cuenta-ahorro.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, DecimalPipe],
})
export class CuentaAhorroComponent {
  public readonly cuenta: InputSignal<CuentaAhorro> = input.required<CuentaAhorro>();

  public readonly etiquetaCuenta: Signal<string> = computed<string>(
    () => `${this.cuenta().tipo} ${this.cuenta().numero}`
  );
  public readonly etiquetaEstado: Signal<string> = computed<string>(
    () => ETIQUETAS_ESTADO[this.cuenta().estado]
  );
  public readonly activa: Signal<boolean> = computed<boolean>(
    () => this.cuenta().estado === 'ACTIVA'
  );
}
