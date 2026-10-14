import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { Movimiento } from '@feature/dashboard/shared/interfaces/dashboard';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe],
})
export class MovimientosComponent {
  public readonly movimientos: InputSignal<Movimiento[]> = input.required<Movimiento[]>();
}
