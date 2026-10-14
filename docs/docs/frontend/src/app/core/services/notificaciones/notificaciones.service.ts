import { computed, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Notificacion } from '@core/interfaces/notificacion';
import { HttpService } from '@core/services/http/http.service';
import { environment } from '@env/environment';

const RUTA: string = `${environment.endpoint}/notificaciones`;

/** Notificaciones activas del cliente (la campanita). Se refrescan con `cargar()`. */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  /** Permanecen activas hasta que el cliente acepta o rechaza la oferta. */
  public readonly notificaciones: Signal<Notificacion[]> = computed<Notificacion[]>(() =>
    this.lista()
  );
  public readonly pendientes: Signal<number> = computed<number>(() => this.lista().length);
  public readonly error: Signal<boolean> = computed<boolean>(() => this.fallo());

  private readonly lista: WritableSignal<Notificacion[]> = signal<Notificacion[]>([]);
  private readonly fallo: WritableSignal<boolean> = signal<boolean>(false);
  private readonly http: HttpService = inject(HttpService);

  public cargar(): void {
    this.fallo.set(false);
    this.http.doGet<Notificacion[]>(RUTA).subscribe({
      next: (notificaciones: Notificacion[]) => this.lista.set(notificaciones),
      error: () => this.fallo.set(true),
    });
  }

  /** Evita que las notificaciones de una sesión se vean en la siguiente. */
  public limpiar(): void {
    this.lista.set([]);
    this.fallo.set(false);
  }
}
