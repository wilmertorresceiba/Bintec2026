import { Directive, ElementRef, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import {
  NG_VALIDATORS,
  NgControl,
  NgModel,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject, merge, takeUntil } from 'rxjs';
import { erroresFormulario } from '@shared/constants/errores-formulario';
import { ValidarEnvioFormularioDirective } from '../validar-envio-formulario/validar-envio-formulario.directive';

const CLASE_ERROR: string = 'input-error';
const CLASE_REQUERIDO: string = 'clase-requerido';

@Directive({
  selector: '[appValidar][formControlName],[appValidar][formControl],[appValidar][ngModel]',
  standalone: true,
})
export class ValidarMensajeErrorCamposDirective implements OnInit, OnDestroy {
  private readonly control: NgControl | null = inject(NgControl, { self: true, optional: true });
  private readonly elemento: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly renderizador: Renderer2 = inject(Renderer2);
  private readonly destruir$: Subject<void> = new Subject<void>();
  private readonly formulario: ValidarEnvioFormularioDirective | null = inject(
    ValidarEnvioFormularioDirective,
    {
      optional: true,
      host: true,
    }
  );

  private readonly validadoresNgModel: readonly (Validator | ValidatorFn)[] | null = inject(
    NG_VALIDATORS,
    {
      self: true,
      optional: true,
    }
  ) as (Validator | ValidatorFn)[] | null;

  private controlUsado: NgControl | NgModel | null = null;

  public ngOnInit(): void {
    this.controlUsado = this.control;
    this.suscribirCambiosEstadoControl();
    this.agregarAsteriscoRequerido();
  }

  public ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  private suscribirCambiosEstadoControl(): void {
    if (this.controlUsado?.statusChanges && this.formulario) {
      merge(
        this.controlUsado.statusChanges.pipe(takeUntil(this.destruir$)),
        this.formulario?.submit$.pipe(takeUntil(this.destruir$))
      ).subscribe({
        next: (resultado: SubmitEvent | string) => {
          if (resultado instanceof SubmitEvent) {
            this.controlUsado?.control?.markAsTouched();
          }
          this.actualizarMensajeError();
        },
      });
    }
    this.renderizador.listen(this.elemento.nativeElement, 'focusout', () => {
      this.controlUsado?.control?.markAsTouched();
      this.actualizarMensajeError();
    });
  }

  private agregarAsteriscoRequerido(): void {
    const tieneValidadorRequerido: boolean =
      (this.controlUsado?.control?.hasValidator(Validators.required) ?? false) ||
      (this.validadoresNgModel?.some(
        (v: Validator | ValidatorFn) => (v as { inputName?: string }).inputName === 'required'
      ) ??
        false);
    if (tieneValidadorRequerido) {
      const etiqueta: HTMLLabelElement | null | undefined =
        this.elemento.nativeElement.parentElement?.querySelector('label');
      if (etiqueta && !etiqueta.querySelector(`.${CLASE_REQUERIDO}`)) {
        const asterisco: HTMLSpanElement = this.renderizador.createElement('span');
        this.renderizador.addClass(asterisco, CLASE_REQUERIDO);
        this.renderizador.setProperty(asterisco, 'textContent', ' *');
        this.renderizador.appendChild(etiqueta, asterisco);
      }
    }
  }

  private actualizarMensajeError(): void {
    const primerError: number = 0;
    const errores: ValidationErrors | null | undefined = this.controlUsado?.errors;
    const tocado: boolean | null | undefined = this.controlUsado?.touched;
    if (errores && tocado) {
      const claveError: string = Object.keys(errores)[primerError];
      const mensajeError: (error: Record<string, number>) => string =
        erroresFormulario[claveError] || erroresFormulario.desconocido;
      this.mostrarMensajeError(mensajeError(Object.values(errores)[primerError]));
    } else {
      this.removerMensajeError();
    }
  }

  private mostrarMensajeError(mensaje: string): void {
    let elementoError: HTMLElement | null = this.elemento.nativeElement
      .nextSibling as HTMLElement | null;
    if (!elementoError?.className?.includes(CLASE_ERROR)) {
      elementoError = this.renderizador.createElement('small');
      this.renderizador.addClass(elementoError, CLASE_ERROR);
      this.renderizador.insertBefore(
        this.elemento.nativeElement.parentNode,
        elementoError,
        this.elemento.nativeElement.nextSibling
      );
    }
    this.renderizador.setProperty(elementoError, 'textContent', mensaje);
  }

  private removerMensajeError(): void {
    const elementoError: HTMLElement | null = this.elemento.nativeElement
      .nextSibling as HTMLElement | null;
    if (elementoError?.className.includes(CLASE_ERROR)) {
      this.renderizador.removeChild(this.elemento.nativeElement.parentNode, elementoError);
    }
  }
}
