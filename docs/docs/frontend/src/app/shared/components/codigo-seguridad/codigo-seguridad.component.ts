import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';

const MS_POR_SEGUNDO: number = 1000;
const DURACION_CODIGO_SEGUNDOS: number = 30;
const DURACION_CODIGO_MS: number = DURACION_CODIGO_SEGUNDOS * MS_POR_SEGUNDO;
const INTERVALO_TICK_MS: number = MS_POR_SEGUNDO;
const SEGUNDOS_URGENTE: number = 10;
const DIGITOS_CODIGO: number = 6;
const GRUPOS_DEL_CODIGO: number = 2;
const BASE_DECIMAL: number = 10;
const BASE_BINARIA: number = 2;
const BITS_UINT32: number = 32;
const RANGO_CODIGO: number = BASE_DECIMAL ** DIGITOS_CODIGO;
const RANGO_UINT32: number = BASE_BINARIA ** BITS_UINT32;
const PORCENTAJE_MAXIMO: number = 100;
const TAMANO_BUFFER: number = 1;
const POSICION_UNICA: number = 0;

@Component({
  selector: 'app-codigo-seguridad',
  templateUrl: './codigo-seguridad.component.html',
  styleUrl: './codigo-seguridad.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodigoSeguridadComponent {
  public readonly duracionSegundos: number = DURACION_CODIGO_SEGUNDOS;
  public readonly textoAyuda: string = `Cambia automáticamente cada ${DURACION_CODIGO_SEGUNDOS} segundos`;
  public readonly codigo: WritableSignal<string> = signal<string>(this.generarCodigo());

  public readonly segundosRestantes: Signal<number> = computed<number>(() =>
    Math.ceil((DURACION_CODIGO_MS - (this.ahora() % DURACION_CODIGO_MS)) / INTERVALO_TICK_MS)
  );
  public readonly porcentajeRestante: Signal<number> = computed<number>(
    () => (this.segundosRestantes() / DURACION_CODIGO_SEGUNDOS) * PORCENTAJE_MAXIMO
  );
  public readonly urgente: Signal<boolean> = computed<boolean>(
    () => this.segundosRestantes() <= SEGUNDOS_URGENTE
  );
  public readonly codigoFormateado: Signal<string> = computed<string>(() => {
    const mitad: number = DIGITOS_CODIGO / GRUPOS_DEL_CODIGO;
    return `${this.codigo().slice(POSICION_UNICA, mitad)} ${this.codigo().slice(mitad)}`;
  });

  private readonly ahora: WritableSignal<number> = signal<number>(Date.now());
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private ventanaActual: number = this.calcularVentana(Date.now());

  constructor() {
    timer(INTERVALO_TICK_MS, INTERVALO_TICK_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actualizar());
  }

  private actualizar(): void {
    const ahora: number = Date.now();
    const ventana: number = this.calcularVentana(ahora);
    if (ventana !== this.ventanaActual) {
      this.ventanaActual = ventana;
      this.codigo.set(this.generarCodigo());
    }
    this.ahora.set(ahora);
  }

  private calcularVentana(instante: number): number {
    return Math.floor(instante / DURACION_CODIGO_MS);
  }

  /** Código aleatorio criptográfico de 6 dígitos, sin sesgo de módulo. */
  private generarCodigo(): string {
    const limite: number = RANGO_UINT32 - (RANGO_UINT32 % RANGO_CODIGO);
    const buffer: Uint32Array = new Uint32Array(TAMANO_BUFFER);
    do {
      crypto.getRandomValues(buffer);
    } while (buffer[POSICION_UNICA] >= limite);
    return (buffer[POSICION_UNICA] % RANGO_CODIGO).toString().padStart(DIGITOS_CODIGO, '0');
  }
}
