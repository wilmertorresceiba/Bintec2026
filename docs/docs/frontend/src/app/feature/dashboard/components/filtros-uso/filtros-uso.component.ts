import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { DESFASE_MES, MESES } from '@feature/dashboard/shared/constants/meses';
import { PeriodoUso } from '@feature/dashboard/shared/interfaces/analitica';

interface OpcionPeriodo {
  valor: PeriodoUso;
  etiqueta: string;
}

const PERIODOS: readonly OpcionPeriodo[] = [
  { valor: 'anio', etiqueta: 'Por año' },
  { valor: 'mes', etiqueta: 'Por mes' },
  { valor: 'dia', etiqueta: 'Por día' },
] as const;

@Component({
  selector: 'app-filtros-uso',
  templateUrl: './filtros-uso.component.html',
  styleUrl: './filtros-uso.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltrosUsoComponent {
  public readonly periodo: InputSignal<PeriodoUso> = input.required<PeriodoUso>();
  public readonly anio: InputSignal<number> = input.required<number>();
  public readonly mes: InputSignal<number> = input.required<number>();
  public readonly anios: InputSignal<readonly number[]> = input.required<readonly number[]>();

  public readonly periodoCambiado: OutputEmitterRef<PeriodoUso> = output<PeriodoUso>();
  public readonly anioCambiado: OutputEmitterRef<number> = output<number>();
  public readonly mesCambiado: OutputEmitterRef<number> = output<number>();

  public readonly periodos: readonly OpcionPeriodo[] = PERIODOS;
  public readonly meses: readonly string[] = MESES;
  public readonly desfaseMes: number = DESFASE_MES;
}
