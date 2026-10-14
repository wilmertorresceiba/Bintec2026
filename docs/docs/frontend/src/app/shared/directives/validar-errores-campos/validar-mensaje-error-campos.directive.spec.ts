import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { erroresFormulario } from '@shared/constants/errores-formulario';
import { ValidarEnvioFormularioDirective } from '../validar-envio-formulario/validar-envio-formulario.directive';
import { ValidarMensajeErrorCamposDirective } from './validar-mensaje-error-campos.directive';

@Component({
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ValidarEnvioFormularioDirective,
    ValidarMensajeErrorCamposDirective,
  ],
  template: `
    <form [formGroup]="form">
      <div>
        <label id="etiquetaCampo" for="campo">Campo</label>
        <input id="campo" formControlName="campo" appValidar />
      </div>
      <button type="submit">Aceptar</button>
    </form>
    <div>
      <label id="etiquetaApellido" for="apellido">Apellido</label>
      <input id="apellido" type="text" [(ngModel)]="apellido" appValidar required />
    </div>
  `,
})
class PruebaComponent {
  public form: FormGroup = new FormGroup({
    campo: new FormControl(''),
  });
  public apellido: string = '';
}

describe('ValidarMensajeErrorCamposDirective', () => {
  let fixture: ComponentFixture<PruebaComponent>;
  let input: HTMLInputElement;
  beforeEach(() => {
    fixture = TestBed.createComponent(PruebaComponent);
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    fixture.detectChanges();
  });

  it('debe crear la directiva', () => {
    expect(input).toBeTruthy();
  });

  it('debe agregar el asterisco de requerido para campo en el formulario reactivo', () => {
    fixture = TestBed.createComponent(PruebaComponent);
    const control: FormControl | null = fixture.componentInstance.form.get(
      'campo'
    ) as FormControl | null;
    control?.setValidators(Validators.required);
    fixture.detectChanges();
    const label: HTMLLabelElement = fixture.debugElement.query(
      By.css('#etiquetaCampo')
    ).nativeElement;
    expect(label.querySelector('.clase-requerido')).toBeTruthy();
  });

  it('debe mostrar el mensaje de error requerido cuando se envia el formulario y el campo es requerido', () => {
    fixture = TestBed.createComponent(PruebaComponent);
    const control: FormControl | null = fixture.componentInstance.form.get(
      'campo'
    ) as FormControl | null;
    control?.setValidators(Validators.required);
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.nextSibling?.textContent).toContain('Este campo es requerido.');
  });

  it('debe mostrar el mensaje de error requerido cuando se envia el formulario, el campo es requerido y se sale del campo', () => {
    fixture = TestBed.createComponent(PruebaComponent);
    const control: FormControl | null = fixture.componentInstance.form.get(
      'campo'
    ) as FormControl | null;
    control?.setValidators(Validators.required);
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    input.dispatchEvent(new Event('focusout'));
    expect(input.nextSibling?.textContent).toContain(erroresFormulario['required']({}));
  });

  it('debe mostrar el mensaje de error email invalido cuando se envia el formulario, el campo tiene validador email y no cumple', () => {
    const control: FormControl | null = fixture.componentInstance.form.get(
      'campo'
    ) as FormControl | null;
    control?.setValidators(Validators.email);
    control?.setValue('correo');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.nextSibling?.textContent).toContain(erroresFormulario['email']({}));
  });

  it('debe mostrar el mensaje  de error de longitud mínima', () => {
    const LONGITUD_MINIMA: number = 3;
    const control: FormControl | null = fixture.componentInstance.form.get(
      'campo'
    ) as FormControl | null;
    control?.setValidators(Validators.minLength(LONGITUD_MINIMA));
    control?.setValue('ab');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.nextSibling?.textContent).toContain(
      'Este campo debe tener al menos 3 caracteres.'
    );
  });

  it('debe mostrar el mensaje  de error de longitud máxima', () => {
    const LONGITUD_MAXIMA: number = 10;
    const control: FormControl | null = fixture.componentInstance.form.get(
      'campo'
    ) as FormControl | null;
    control?.setValidators(Validators.maxLength(LONGITUD_MAXIMA));
    control?.setValue('01234567890');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.nextSibling?.textContent).toContain(
      'Este campo debe tener como máximo 10 caracteres.'
    );
  });

  it('debe mostrar el mensaje de error email invalido cuando se envia el formulario, el campo tiene validador email y no cumple', () => {
    const control: FormControl | null = fixture.componentInstance.form.get(
      'campo'
    ) as FormControl | null;
    control?.setValidators(Validators.email);
    control?.setValue('correo');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.nextSibling?.textContent).toContain(erroresFormulario['email']({}));
  });

  it('debe mostrar el mensaje de error de valor mínimo', () => {
    const MINIMO: number = 1;
    const control: FormControl | null = fixture.componentInstance.form.get(
      'campo'
    ) as FormControl | null;
    control?.setValidators(Validators.min(MINIMO));
    control?.setValue('0');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.nextSibling?.textContent).toContain('Este campo debe ser mayor o igual a 1.');
  });

  it('debe mostrar el mensaje de error de valor máximo', () => {
    const MAXIMO: number = 10;
    const control: FormControl | null = fixture.componentInstance.form.get(
      'campo'
    ) as FormControl | null;
    control?.setValidators(Validators.max(MAXIMO));
    control?.setValue('11');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.nextSibling?.textContent).toContain('Este campo debe ser menor o igual a 10.');
  });

  it('debe mostrar el mensaje de error de formato', () => {
    const control: FormControl | null = fixture.componentInstance.form.get(
      'campo'
    ) as FormControl | null;
    control?.setValidators(Validators.pattern('[a-zA-Z]*'));
    control?.setValue('a1');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.nextSibling?.textContent).toContain('No cumple con el formato.');
  });

  it('debe mostrar el mensaje de error desconocido cuando se envia el formulario y hay una validacion no conocida', () => {
    fixture = TestBed.createComponent(PruebaComponent);
    const VALIDADOR_PERSONALIZADO: () => ValidationErrors | null =
      function (): ValidationErrors | null {
        return { errorPersonalizado: `Mensaje de Error personalizado` };
      };
    const control: FormControl | null = fixture.componentInstance.form.get(
      'campo'
    ) as FormControl | null;
    control?.setValidators(VALIDADOR_PERSONALIZADO);
    control?.setValue('correo');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.nextSibling?.textContent).toContain(erroresFormulario['desconocido']());
  });

  it('debe eliminar el mensaje de error cuando se envia el formulario y el campo es valido', () => {
    fixture = TestBed.createComponent(PruebaComponent);
    const control: FormControl | null = fixture.componentInstance.form.get(
      'campo'
    ) as FormControl | null;
    control?.setValidators(Validators.required);
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.nextSibling?.textContent).toContain(erroresFormulario['required']({}));
    control?.setValue('campo');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    expect(input.nextSibling?.textContent).toBe(undefined);
  });

  it('debe agregar el asterisco de requerido para apellido en el campo ngModel', () => {
    fixture = TestBed.createComponent(PruebaComponent);
    fixture.detectChanges();
    const label: HTMLLabelElement = fixture.debugElement.query(
      By.css('#etiquetaApellido')
    ).nativeElement;
    expect(label.querySelector('.clase-requerido')).toBeTruthy();
  });
});
