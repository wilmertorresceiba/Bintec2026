import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { SesionService } from '@core/services/sesion/sesion.service';
import { PasoCredencialesComponent } from '@feature/autenticacion/components/paso-credenciales/paso-credenciales.component';
import { PasoNumericoComponent } from '@feature/autenticacion/components/paso-numerico/paso-numerico.component';
import {
  CLAVE_CAJERO_DEMO,
  CODIGO_SEGURIDAD_DEMO,
} from '@feature/autenticacion/shared/constants/credenciales-demo';
import {
  Credenciales,
  RespuestaDesafio,
  RespuestaLogin,
} from '@feature/autenticacion/shared/interfaces/respuesta-login';
import { AutenticacionService } from '@feature/autenticacion/shared/service/autenticacion.service';
import {
  CODIGO_CUENTA_BLOQUEADA,
  CODIGO_DESAFIO_INVALIDO,
  ErrorAutenticacion,
} from '@feature/autenticacion/shared/service/error-autenticacion';
import { StepperComponent } from '@shared/components/stepper/stepper.component';

type Paso = 'credenciales' | 'cajero' | 'codigo';

interface TextosPaso {
  titulo: string;
  subtitulo: string;
  indice: number;
}

export const LONGITUD_CLAVE_CAJERO: number = 4;
export const LONGITUD_CODIGO_SEGURIDAD: number = 6;

const ETIQUETAS_PASOS: readonly string[] = [
  'Credenciales',
  'Clave de cajero',
  'Código de seguridad',
] as const;
const TEXTOS: Record<Paso, TextosPaso> = {
  credenciales: {
    titulo: 'Banca en línea Bintec 2026',
    subtitulo: 'Ingresa para consultar tus créditos y tarjetas.',
    indice: 0,
  },
  cajero: {
    titulo: 'Clave de cajero',
    subtitulo: 'Ingresa la clave de 4 dígitos de tu tarjeta débito.',
    indice: 1,
  },
  codigo: {
    titulo: 'Código de seguridad',
    subtitulo: 'Ingresa el código de seguridad de 6 dígitos.',
    indice: 2,
  },
};

/**
 * Login por pasos (stepper): 1) credenciales → 2) clave de cajero → 3) código de seguridad.
 * El backend valida los dos últimos juntos; por eso la clave de cajero se guarda en memoria
 * hasta el último paso y no se envía antes.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PasoCredencialesComponent, PasoNumericoComponent, StepperComponent],
})
export class LoginComponent {
  public readonly etiquetasPasos: readonly string[] = ETIQUETAS_PASOS;
  public readonly longitudCajero: number = LONGITUD_CLAVE_CAJERO;
  public readonly longitudCodigo: number = LONGITUD_CODIGO_SEGURIDAD;
  public readonly cajeroDemo: string = CLAVE_CAJERO_DEMO;
  public readonly codigoDemo: string = CODIGO_SEGURIDAD_DEMO;

  public readonly paso: WritableSignal<Paso> = signal<Paso>('credenciales');
  public readonly cargando: WritableSignal<boolean> = signal<boolean>(false);
  public readonly error: WritableSignal<string | null> = signal<string | null>(null);

  public readonly textos: Signal<TextosPaso> = computed<TextosPaso>(() => TEXTOS[this.paso()]);

  private desafio: string | null = null;
  private claveCajero: string | null = null;

  private readonly autenticacionService: AutenticacionService = inject(AutenticacionService);
  private readonly sesionService: SesionService = inject(SesionService);
  private readonly router: Router = inject(Router);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  /** Paso 1: valida correo y clave y recibe el desafío del segundo factor. */
  public iniciarSesion(credenciales: Credenciales): void {
    this.cargando.set(true);
    this.error.set(null);
    this.autenticacionService
      .iniciarSesion(credenciales.correo, credenciales.clave)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta: RespuestaDesafio) => {
          this.desafio = respuesta.desafio;
          this.irA('cajero');
        },
        error: (e: ErrorAutenticacion) => this.fallar(e),
      });
  }

  /** Paso 2: guarda la clave de cajero y pide el código (todavía no se envía nada). */
  public recibirClaveCajero(claveCajero: string): void {
    this.claveCajero = claveCajero;
    this.irA('codigo');
  }

  /** Paso 3: con el código de seguridad se verifica el segundo factor completo. */
  public verificar(codigoSeguridad: string): void {
    if (!this.desafio || !this.claveCajero) {
      this.reiniciar();
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    this.autenticacionService
      .verificar(this.desafio, this.claveCajero, codigoSeguridad)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta: RespuestaLogin) => {
          this.sesionService.iniciar(respuesta.usuario, respuesta.token);
          void this.router.navigate(['/dashboard']);
        },
        error: (e: ErrorAutenticacion) => this.fallar(e),
      });
  }

  public volverACredenciales(): void {
    this.reiniciar();
  }

  public volverACajero(): void {
    this.claveCajero = null;
    this.irA('cajero');
  }

  private irA(paso: Paso): void {
    this.error.set(null);
    this.cargando.set(false);
    this.paso.set(paso);
  }

  private reiniciar(): void {
    this.desafio = null;
    this.claveCajero = null;
    this.irA('credenciales');
  }

  private fallar(e: ErrorAutenticacion): void {
    const sinContinuidad: boolean =
      e.codigo === CODIGO_DESAFIO_INVALIDO || e.codigo === CODIGO_CUENTA_BLOQUEADA;
    if (sinContinuidad) {
      this.reiniciar();
    } else if (this.paso() === 'codigo') {
      // El backend no dice cuál de los dos datos falló: se vuelve a pedir desde la clave de cajero.
      this.claveCajero = null;
      this.irA('cajero');
    }
    this.error.set(e.message);
    this.cargando.set(false);
  }
}
