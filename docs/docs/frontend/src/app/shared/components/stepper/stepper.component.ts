import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { UNO } from '@shared/utils/numeros';

type EstadoPaso = 'completo' | 'activo' | 'pendiente';

interface ItemPaso {
  numero: number;
  etiqueta: string;
  estado: EstadoPaso;
  textoAccesible: string;
}

const TEXTOS_ESTADO: Record<EstadoPaso, string> = {
  completo: 'completado',
  activo: 'paso actual',
  pendiente: 'pendiente',
};

/** Indicador de progreso por pasos (stepper). `activo` es el índice (desde 0) del paso actual. */
@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperComponent {
  public readonly pasos: InputSignal<readonly string[]> = input.required<readonly string[]>();
  public readonly activo: InputSignal<number> = input.required<number>();
  public readonly etiqueta: InputSignal<string> = input<string>('Progreso');

  public readonly items: Signal<ItemPaso[]> = computed<ItemPaso[]>(() =>
    this.pasos().map((etiqueta: string, indice: number) => {
      const estado: EstadoPaso =
        indice < this.activo() ? 'completo' : indice === this.activo() ? 'activo' : 'pendiente';
      const numero: number = indice + UNO;
      return {
        numero,
        etiqueta,
        estado,
        textoAccesible: `Paso ${numero} de ${this.pasos().length}: ${etiqueta}, ${TEXTOS_ESTADO[estado]}`,
      };
    })
  );
}
