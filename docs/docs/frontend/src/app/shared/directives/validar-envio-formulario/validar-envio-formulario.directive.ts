import { Directive, ElementRef } from '@angular/core';
import { Observable, fromEvent, shareReplay } from 'rxjs';
const VALORES_A_CONSERVAR: number = 1;
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'form',
  standalone: true,
})
export class ValidarEnvioFormularioDirective {
  public submit$: Observable<Event>;

  constructor(private readonly host: ElementRef<HTMLFormElement>) {
    this.submit$ = fromEvent(this.element, 'submit').pipe(shareReplay(VALORES_A_CONSERVAR));
  }

  public get element(): HTMLFormElement {
    return this.host.nativeElement;
  }
}
