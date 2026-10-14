import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { ResumenFinanciero } from '@feature/dashboard/shared/interfaces/dashboard';

@Component({
  selector: 'app-resumen-financiero',
  templateUrl: './resumen-financiero.component.html',
  styleUrl: './resumen-financiero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe],
})
export class ResumenFinancieroComponent {
  public readonly resumen: InputSignal<ResumenFinanciero> = input.required<ResumenFinanciero>();
}
