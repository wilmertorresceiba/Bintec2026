import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  viewChild,
  Signal,
} from '@angular/core';

/**
 * Webchat propio. Por ahora es solo el cascarón visual: se activa y se muestra,
 * pero aún no envía ni recibe mensajes (la lógica de la conversación llegará después).
 */
@Component({
  selector: 'app-webchat',
  templateUrl: './webchat.component.html',
  styleUrl: './webchat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebchatComponent {
  public readonly titulo: InputSignal<string> = input<string>('Asistente virtual');
  /** Se emite al cerrar el chat para que quien lo contiene lo oculte. */
  public readonly cerrado: OutputEmitterRef<void> = output<void>();

  private readonly panel: Signal<ElementRef<HTMLElement> | undefined> =
    viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    // Al activarse, el foco pasa al chat para que teclado y lectores de pantalla lo encuentren.
    afterNextRender(() => this.panel()?.nativeElement.focus());
  }

  public cerrar(): void {
    this.cerrado.emit();
  }
}
