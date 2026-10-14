import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { NotificacionesService } from '@core/services/notificaciones/notificaciones.service';
import { AvisoNotificacionComponent } from '@shared/components/aviso-notificacion/aviso-notificacion.component';
import { CERO } from '@shared/utils/numeros';

@Component({
  selector: 'app-campana-notificaciones',
  templateUrl: './campana-notificaciones.component.html',
  styleUrl: './campana-notificaciones.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvisoNotificacionComponent],
  host: {
    '(document:click)': 'cerrarSiClicFuera($event)',
    '(document:keydown.escape)': 'cerrar()',
  },
})
export class CampanaNotificacionesComponent implements OnInit, OnDestroy {
  public readonly servicio: NotificacionesService = inject(NotificacionesService);
  public readonly abierto: WritableSignal<boolean> = signal<boolean>(false);

  public readonly etiquetaBoton: Signal<string> = computed<string>(() => {
    const cantidad: number = this.servicio.pendientes();
    return cantidad > CERO
      ? `Notificaciones, ${cantidad} pendiente(s) de respuesta`
      : 'Notificaciones';
  });
  public readonly hayPendientes: Signal<boolean> = computed<boolean>(
    () => this.servicio.pendientes() > CERO
  );
  public readonly vacia: Signal<boolean> = computed<boolean>(
    () => this.servicio.pendientes() === CERO
  );

  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  public ngOnInit(): void {
    this.servicio.cargar();
  }

  public ngOnDestroy(): void {
    this.servicio.limpiar();
  }

  public alternar(): void {
    this.abierto.update((valor: boolean) => !valor);
  }

  public cerrar(): void {
    this.abierto.set(false);
  }

  public cerrarSiClicFuera(evento: Event): void {
    if (this.abierto() && !this.host.nativeElement.contains(evento.target as Node)) {
      this.cerrar();
    }
  }
}
