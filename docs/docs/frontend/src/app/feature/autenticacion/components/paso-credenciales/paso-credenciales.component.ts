import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CLAVE_DEMO, CORREO_DEMO } from '@feature/autenticacion/shared/constants/credenciales-demo';
import { Credenciales } from '@feature/autenticacion/shared/interfaces/respuesta-login';
import { ValidarEnvioFormularioDirective } from '@shared/directives/validar-envio-formulario/validar-envio-formulario.directive';
import { ValidarMensajeErrorCamposDirective } from '@shared/directives/validar-errores-campos/validar-mensaje-error-campos.directive';

const CLAVE_MIN_LENGTH: number = 8;

interface FormularioCredenciales {
  correo: FormControl<string>;
  clave: FormControl<string>;
}

/** Paso 1 del login: correo y clave. */
@Component({
  selector: 'app-paso-credenciales',
  templateUrl: './paso-credenciales.component.html',
  styleUrl: './paso-credenciales.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ValidarEnvioFormularioDirective,
    ValidarMensajeErrorCamposDirective,
  ],
})
export class PasoCredencialesComponent {
  public readonly cargando: InputSignal<boolean> = input<boolean>(false);
  public readonly error: InputSignal<string | null> = input<string | null>(null);
  public readonly enviado: OutputEmitterRef<Credenciales> = output<Credenciales>();

  public readonly mostrarClave: WritableSignal<boolean> = signal<boolean>(false);
  public readonly formulario: FormGroup<FormularioCredenciales> = inject(
    FormBuilder
  ).nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required, Validators.minLength(CLAVE_MIN_LENGTH)]],
  });

  public alternarClave(): void {
    this.mostrarClave.update((visible: boolean) => !visible);
  }

  public usarCredencialesDemo(): void {
    this.formulario.setValue({ correo: CORREO_DEMO, clave: CLAVE_DEMO });
  }

  public enviar(): void {
    if (this.formulario.invalid || this.cargando()) {
      return;
    }
    this.enviado.emit(this.formulario.getRawValue());
  }
}
