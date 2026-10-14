import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { ETIQUETAS_ESTADO, MS_POR_DIA } from '@feature/dashboard/shared/constants/etiquetas-estado';
import { TarjetaCredito } from '@feature/dashboard/shared/interfaces/dashboard';
import { BarraProgresoComponent } from '@shared/components/barra-progreso/barra-progreso.component';

const PORCENTAJE_MAXIMO: number = 100;
const UMBRAL_USO_ALTO: number = 80;
const DIAS_PAGO_URGENTE: number = 3;
const DIAS_VENCE_HOY: number = 0;

@Component({
  selector: 'app-tarjeta-credito',
  templateUrl: './tarjeta-credito.component.html',
  styleUrl: './tarjeta-credito.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, BarraProgresoComponent],
})
export class TarjetaCreditoComponent {
  public readonly tarjeta: InputSignal<TarjetaCredito> = input.required<TarjetaCredito>();

  public readonly porcentajeUso: Signal<number> = computed<number>(
    () => (this.tarjeta().cupoUtilizado / this.tarjeta().cupoTotal) * PORCENTAJE_MAXIMO
  );
  public readonly usoAlto: Signal<boolean> = computed<boolean>(
    () => this.porcentajeUso() >= UMBRAL_USO_ALTO
  );
  public readonly cupoDisponible: Signal<number> = computed<number>(
    () => this.tarjeta().cupoTotal - this.tarjeta().cupoUtilizado
  );
  public readonly diasParaPago: Signal<number> = computed<number>(() =>
    Math.ceil((new Date(this.tarjeta().fechaLimitePago).getTime() - Date.now()) / MS_POR_DIA)
  );
  public readonly pagoUrgente: Signal<boolean> = computed<boolean>(
    () => this.diasParaPago() <= DIAS_PAGO_URGENTE
  );
  public readonly etiquetaTarjeta: Signal<string> = computed<string>(
    () => `${this.tarjeta().nombre} terminada en ${this.tarjeta().ultimosDigitos}`
  );
  public readonly etiquetaUso: Signal<string> = computed<string>(
    () => `Uso del cupo de ${this.tarjeta().nombre}`
  );
  public readonly textoVencimiento: Signal<string> = computed<string>(() =>
    this.diasParaPago() <= DIAS_VENCE_HOY ? 'Vence hoy' : `Vence en ${this.diasParaPago()} días`
  );
  public readonly etiquetaEstado: Signal<string> = computed<string>(
    () => ETIQUETAS_ESTADO[this.tarjeta().estado]
  );
}
