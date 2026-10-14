import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  Signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidarEnvioFormularioDirective } from '@shared/directives/validar-envio-formulario/validar-envio-formulario.directive';
import { ValidarMensajeErrorCamposDirective } from '@shared/directives/validar-errores-campos/validar-mensaje-error-campos.directive';

const NO_DIGITOS: RegExp = /\D/g;

/**
 * Paso del login que pide un valor numérico de largo fijo (clave de cajero, código de seguridad…).
 * Solo admite dígitos, enfoca el campo al aparecer y permite volver al paso anterior.
 */
@Component({
  selector: 'app-paso-numerico',
  templateUrl: './paso-numerico.component.html',
  styleUrl: './paso-numerico.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ValidarEnvioFormularioDirective,
    ValidarMensajeErrorCamposDirective,
  ],
})
export class PasoNumericoComponent implements OnInit {
  /** Id del <input>. No se llama `id` para no duplicar el id en el elemento host. */
  public readonly idCampo: InputSignal<string> = input.required<string>();
  public readonly etiqueta: InputSignal<string> = input.required<string>();
  public readonly longitud: InputSignal<number> = input.required<number>();
  /** `password` oculta lo escrito (clave de cajero); `text` lo muestra (código de seguridad). */
  public readonly tipo: InputSignal<'password' | 'text'> = input<'password' | 'text'>('text');
  public readonly autocompletar: InputSignal<string> = input<string>('off');
  public readonly textoBoton: InputSignal<string> = input<string>('Continuar');
  public readonly textoCargando: InputSignal<string> = input<string>('Verificando…');
  /** Valor de demostración que rellena "Autocompletar credenciales". */
  public readonly valorDemo: InputSignal<string> = input<string>('');
  public readonly cargando: InputSignal<boolean> = input<boolean>(false);
  public readonly error: InputSignal<string | null> = input<string | null>(null);

  public readonly enviado: OutputEmitterRef<string> = output<string>();
  public readonly volver: OutputEmitterRef<void> = output<void>();

  public readonly valor: FormControl<string> = inject(FormBuilder).nonNullable.control('', [
    Validators.required,
  ]);

  private readonly campo: Signal<ElementRef<HTMLInputElement> | undefined> =
    viewChild<ElementRef<HTMLInputElement>>('campo');

  constructor() {
    // Al aparecer el paso, el foco va al campo (teclado y lectores de pantalla).
    afterNextRender(() => this.campo()?.nativeElement.focus());
  }

  public ngOnInit(): void {
    this.valor.addValidators(Validators.pattern(new RegExp(`^\\d{${this.longitud()}}$`)));
    this.valor.updateValueAndValidity();
  }

  /** Solo admite dígitos: elimina cualquier otro carácter que se escriba o pegue. */
  public soloDigitos(): void {
    const limpio: string = this.valor.value.replace(NO_DIGITOS, '');
    if (limpio !== this.valor.value) {
      this.valor.setValue(limpio);
    }
  }

  public usarCredencialesDemo(): void {
    this.valor.setValue(this.valorDemo());
  }

  public enviar(): void {
    if (this.valor.invalid || this.cargando()) {
      return;
    }
    this.enviado.emit(this.valor.value);
  }
}
