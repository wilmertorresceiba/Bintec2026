import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { ETIQUETAS_ESTADO } from '@feature/dashboard/shared/constants/etiquetas-estado';
import { Credito } from '@feature/dashboard/shared/interfaces/dashboard';
import { BarraProgresoComponent } from '@shared/components/barra-progreso/barra-progreso.component';

const PORCENTAJE_MAXIMO: number = 100;

@Component({
  selector: 'app-credito',
  templateUrl: './credito.component.html',
  styleUrl: './credito.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, BarraProgresoComponent],
})
export class CreditoComponent {
  public readonly credito: InputSignal<Credito> = input.required<Credito>();

  public readonly porcentajePagado: Signal<number> = computed<number>(
    () => (this.credito().cuotasPagadas / this.credito().cuotasTotales) * PORCENTAJE_MAXIMO
  );
  public readonly etiquetaProgreso: Signal<string> = computed<string>(
    () => `Avance de pago del crédito de ${this.credito().tipo}`
  );
  public readonly etiquetaArticulo: Signal<string> = computed<string>(
    () => `Crédito de ${this.credito().tipo}`
  );
  public readonly cuotasRestantes: Signal<number> = computed<number>(
    () => this.credito().cuotasTotales - this.credito().cuotasPagadas
  );
  public readonly enMora: Signal<boolean> = computed<boolean>(
    () => this.credito().estado === 'EN_MORA'
  );
  public readonly etiquetaEstado: Signal<string> = computed<string>(
    () => ETIQUETAS_ESTADO[this.credito().estado]
  );
}
