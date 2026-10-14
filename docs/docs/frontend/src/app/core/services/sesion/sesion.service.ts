import { Injectable, Signal, computed, signal, WritableSignal } from '@angular/core';
import { UsuarioSesion } from '@core/interfaces/usuario-sesion';

const CLAVE_SESION: string = 'bintec-sesion';

interface SesionGuardada {
  usuario: UsuarioSesion;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class SesionService {
  public readonly usuario: Signal<UsuarioSesion | null> = computed<UsuarioSesion | null>(
    () => this.sesionActual()?.usuario ?? null
  );
  public readonly token: Signal<string | null> = computed<string | null>(
    () => this.sesionActual()?.token ?? null
  );
  public readonly autenticado: Signal<boolean> = computed<boolean>(
    () => this.sesionActual() !== null
  );

  private readonly sesionActual: WritableSignal<SesionGuardada | null> =
    signal<SesionGuardada | null>(this.leerSesionGuardada());

  public iniciar(usuario: UsuarioSesion, token: string): void {
    const sesion: SesionGuardada = { usuario, token };
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    this.sesionActual.set(sesion);
  }

  public cerrar(): void {
    sessionStorage.removeItem(CLAVE_SESION);
    this.sesionActual.set(null);
  }

  private leerSesionGuardada(): SesionGuardada | null {
    const guardada: string | null = sessionStorage.getItem(CLAVE_SESION);
    if (!guardada) {
      return null;
    }
    try {
      const sesion: Partial<SesionGuardada> = JSON.parse(guardada) as Partial<SesionGuardada>;
      return sesion.usuario && sesion.token
        ? { usuario: sesion.usuario, token: sesion.token }
        : null;
    } catch {
      return null;
    }
  }
}
