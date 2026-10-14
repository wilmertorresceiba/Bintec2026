import {
  ChangeDetectionStrategy,
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { formatearPesosCompacto } from '@shared/utils/formato-moneda';
import { CERO, UNO } from '@shared/utils/numeros';
import { escalaAgradable, pasoEtiquetas } from './escala';

export interface PuntoGrafica {
  clave: number;
  etiqueta: string;
  /** Texto breve para el eje X cuando `etiqueta` es demasiado larga (p. ej. "Ene" vs "Enero 2026"). */
  etiquetaCorta?: string;
  valor: number;
  /** Texto del tooltip y de la etiqueta accesible (p. ej. "$ 1.200.000 · 12 compras"). */
  detalle: string;
}

export interface Barra extends PuntoGrafica {
  id: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  centroX: number;
  mostrarEtiqueta: boolean;
  esMaximo: boolean;
  valorCompacto: string;
}

export interface MarcaEje {
  y: number;
  texto: string;
}

const ANCHO_INICIAL: number = 720;
const ANCHO_MINIMO: number = 280;
const ANCHO_MAXIMO: number = 960;
const UMBRAL_COMPACTO: number = 480;
const ALTO: number = 320;
const ALTO_COMPACTO: number = 260;
const MARGEN_IZQ: number = 76;
const MARGEN_IZQ_COMPACTO: number = 56;
const MARGEN_DER: number = 16;
const MARGEN_SUP: number = 24;
const MARGEN_INF: number = 36;
const DIVISIONES_EJE: number = 4;
const PROPORCION_BARRA: number = 0.62;
const ANCHO_MAXIMO_BARRA: number = 56;
const ETIQUETAS_VISIBLES: number = 12;
const ETIQUETAS_VISIBLES_COMPACTO: number = 6;
const ANCHO_TOOLTIP: number = 190;
const MARGEN_TOOLTIP: number = 8;
const ALTO_TOOLTIP: number = 44;
const SEPARACION_TOOLTIP: number = 8;
const MITAD: number = 2;

@Component({
  selector: 'app-grafica-barras',
  templateUrl: './grafica-barras.component.html',
  styleUrl: './grafica-barras.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficaBarrasComponent {
  public readonly puntos: InputSignal<readonly PuntoGrafica[]> =
    input.required<readonly PuntoGrafica[]>();
  public readonly titulo: InputSignal<string> = input.required<string>();
  /** Identifica la serie: al cambiar, las barras se vuelven a animar. */
  public readonly serie: InputSignal<string> = input<string>('');
  public readonly interactivo: InputSignal<boolean> = input<boolean>(false);
  public readonly seleccionado: OutputEmitterRef<number> = output<number>();

  /** Ancho real del contenedor: el SVG no se escala, así el texto conserva su tamaño en móvil. */
  public readonly ancho: WritableSignal<number> = signal<number>(ANCHO_INICIAL);
  public readonly compacto: Signal<boolean> = computed<boolean>(
    () => this.ancho() < UMBRAL_COMPACTO
  );
  public readonly alto: Signal<number> = computed<number>(() =>
    this.compacto() ? ALTO_COMPACTO : ALTO
  );
  public readonly margenIzq: Signal<number> = computed<number>(() =>
    this.compacto() ? MARGEN_IZQ_COMPACTO : MARGEN_IZQ
  );
  public readonly margenDer: number = MARGEN_DER;
  public readonly margenSup: number = MARGEN_SUP;
  public readonly ejeX: Signal<number> = computed<number>(() => this.alto() - MARGEN_INF);
  public readonly yEtiquetasX: Signal<number> = computed<number>(
    () => this.alto() - MARGEN_INF / MITAD
  );

  public readonly activo: WritableSignal<number | null> = signal<number | null>(null);

  public readonly marcas: Signal<MarcaEje[]> = computed<MarcaEje[]>(() => {
    const maximo: number = this.maximoEje();
    const altoArea: number = this.alto() - MARGEN_SUP - MARGEN_INF;
    return Array.from({ length: DIVISIONES_EJE + UNO }, (_, i: number) => ({
      y: MARGEN_SUP + altoArea * (UNO - i / DIVISIONES_EJE),
      texto: i === CERO ? '$ 0' : formatearPesosCompacto((maximo * i) / DIVISIONES_EJE),
    }));
  });

  public readonly barras: Signal<Barra[]> = computed<Barra[]>(() => {
    const puntos: readonly PuntoGrafica[] = this.puntos();
    const maximo: number = this.maximoEje();
    const altoArea: number = this.alto() - MARGEN_SUP - MARGEN_INF;
    const margenIzq: number = this.margenIzq();
    const paso: number = (this.ancho() - margenIzq - MARGEN_DER) / Math.max(UNO, puntos.length);
    const anchoBarra: number = Math.min(paso * PROPORCION_BARRA, ANCHO_MAXIMO_BARRA);
    const cadaCuanto: number = pasoEtiquetas(
      puntos.length,
      this.compacto() ? ETIQUETAS_VISIBLES_COMPACTO : ETIQUETAS_VISIBLES
    );
    const mayorValor: number = Math.max(CERO, ...puntos.map((p: PuntoGrafica) => p.valor));
    return puntos.map((punto: PuntoGrafica, i: number) => {
      const alto: number = (altoArea * punto.valor) / maximo;
      const x: number = margenIzq + paso * i + (paso - anchoBarra) / MITAD;
      return {
        ...punto,
        id: `${this.serie()}-${punto.clave}`,
        x,
        y: MARGEN_SUP + altoArea - alto,
        ancho: anchoBarra,
        alto,
        centroX: x + anchoBarra / MITAD,
        mostrarEtiqueta: i % cadaCuanto === CERO,
        esMaximo: mayorValor > CERO && punto.valor === mayorValor,
        valorCompacto: formatearPesosCompacto(punto.valor),
      };
    });
  });

  public readonly anchoTooltip: Signal<number> = computed<number>(() =>
    Math.min(ANCHO_TOOLTIP, this.ancho() - MARGEN_TOOLTIP * MITAD)
  );

  public readonly tooltip: Signal<{ x: number; y: number; barra: Barra } | null> = computed<{
    x: number;
    y: number;
    barra: Barra;
  } | null>(() => {
    const indice: number | null = this.activo();
    const barra: Barra | undefined = indice === null ? undefined : this.barras()[indice];
    if (!barra) {
      return null;
    }
    const ancho: number = this.anchoTooltip();
    const x: number = Math.max(
      MARGEN_TOOLTIP,
      Math.min(barra.centroX - ancho / MITAD, this.ancho() - MARGEN_DER - ancho)
    );
    const y: number = Math.max(CERO, barra.y - ALTO_TOOLTIP - SEPARACION_TOOLTIP);
    return { x, y, barra };
  });

  public readonly altoTooltip: number = ALTO_TOOLTIP;

  private readonly maximoEje: Signal<number> = computed<number>(() =>
    escalaAgradable(Math.max(CERO, ...this.puntos().map((p: PuntoGrafica) => p.valor)))
  );

  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.observarAncho());
  }

  public activar(indice: number | null): void {
    this.activo.set(indice);
  }

  public elegir(barra: Barra): void {
    if (this.interactivo()) {
      this.seleccionado.emit(barra.clave);
    }
  }

  private observarAncho(): void {
    const medir: (ancho: number) => void = (ancho: number): void =>
      this.ancho.set(Math.round(Math.min(ANCHO_MAXIMO, Math.max(ANCHO_MINIMO, ancho))));
    medir(this.host.nativeElement.clientWidth);
    const observador: ResizeObserver = new ResizeObserver((entradas: ResizeObserverEntry[]) =>
      medir(entradas[CERO].contentRect.width)
    );
    observador.observe(this.host.nativeElement);
    this.destroyRef.onDestroy(() => observador.disconnect());
  }
}
