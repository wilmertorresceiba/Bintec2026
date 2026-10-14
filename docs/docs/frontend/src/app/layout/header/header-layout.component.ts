import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Miga } from '@core/interfaces/miga';
import { MigaDePanService } from '@core/services/miga-de-pan/miga-de-pan.service';
import { CampanaNotificacionesComponent } from '@shared/components/campana-notificaciones/campana-notificaciones.component';
import { CodigoSeguridadComponent } from '@shared/components/codigo-seguridad/codigo-seguridad.component';

@Component({
  selector: 'app-header',
  templateUrl: './header-layout.component.html',
  styleUrl: './header-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CampanaNotificacionesComponent, CodigoSeguridadComponent],
})
export class HeaderComponent {
  public readonly migas: Signal<Miga[]> = inject(MigaDePanService).migas;
}
