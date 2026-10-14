import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  InputSignal,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DetalleNotificacion, DetalleOferta } from '@core/interfaces/notificacion';
import { AccionesOfertaComponent } from '@feature/dashboard/components/acciones-oferta/acciones-oferta.component';
import { TerminosOfertaComponent } from '@feature/dashboard/components/terminos-oferta/terminos-oferta.component';
import { OfertasService } from '@feature/dashboard/shared/service/ofertas.service';
import { EstadoDatosComponent } from '@shared/components/estado-datos/estado-datos.component';
import { WebchatComponent } from '@shared/components/webchat/webchat.component';

type Vista = 'noEncontrada' | 'resuelta' | 'pendiente';

const NO_ENCONTRADA: number = 404;

/** Detalle del crédito preaprobado. "Aceptar crédito" activa el webchat propio. */
@Component({
  selector: 'app-oferta-credito',
  templateUrl: './oferta-credito.component.html',
  styleUrl: './oferta-credito.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    EstadoDatosComponent,
    TerminosOfertaComponent,
    AccionesOfertaComponent,
    WebchatComponent,
  ],
})
export class OfertaCreditoComponent implements OnInit {
  /** Id de la notificación (parámetro de la ruta). */
  public readonly id: InputSignal<string> = input.required<string>();

  public readonly detalle: WritableSignal<DetalleNotificacion | null> =
    signal<DetalleNotificacion | null>(null);
  public readonly cargando: WritableSignal<boolean> = signal<boolean>(true);
  public readonly error: WritableSignal<boolean> = signal<boolean>(false);
  public readonly noEncontrada: WritableSignal<boolean> = signal<boolean>(false);
  public readonly chatActivo: WritableSignal<boolean> = signal<boolean>(false);

  public readonly oferta: Signal<DetalleOferta | null> = computed<DetalleOferta | null>(
    () => this.detalle()?.oferta ?? null
  );
  public readonly vista: Signal<Vista> = computed<Vista>(() => {
    if (this.noEncontrada()) {
      return 'noEncontrada';
    }
    return this.detalle()?.notificacion.estado === 'PENDIENTE' ? 'pendiente' : 'resuelta';
  });
  public readonly estadoResuelta: Signal<string> = computed<string>(() =>
    this.detalle()?.notificacion.estado === 'ACEPTADA' ? 'aceptada' : 'rechazada'
  );

  private readonly ofertasService: OfertasService = inject(OfertasService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this.cargar();
  }

  public cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.noEncontrada.set(false);
    this.ofertasService
      .obtenerDetalle(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detalle: DetalleNotificacion) => {
          this.detalle.set(detalle);
          this.cargando.set(false);
        },
        error: (e: HttpErrorResponse) => {
          this.noEncontrada.set(e.status === NO_ENCONTRADA);
          this.error.set(e.status !== NO_ENCONTRADA);
          this.cargando.set(false);
        },
      });
  }

  public activarChat(): void {
    this.chatActivo.set(true);
  }

  public cerrarChat(): void {
    this.chatActivo.set(false);
  }
}
