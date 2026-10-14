import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ElementoMenu } from '@core/interfaces/elemento-menu';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar-layout.component.html',
  styleUrl: './navbar-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  public elementosMenu: InputSignal<ElementoMenu[]> = input.required<ElementoMenu[]>();
  public nombreUsuario: InputSignal<string | null> = input<string | null>(null);
  public plegado: InputSignal<boolean> = input<boolean>(false);
  public cerrarSesion: OutputEmitterRef<void> = output<void>();
  public alternarPlegado: OutputEmitterRef<void> = output<void>();

  /** Los grupos con subopciones están abiertos salvo que el usuario los cierre. */
  private readonly gruposCerrados: WritableSignal<readonly string[]> = signal<readonly string[]>(
    []
  );

  public estaAbierto(elemento: ElementoMenu): boolean {
    return !this.gruposCerrados().includes(elemento.url);
  }

  public alternar(elemento: ElementoMenu): void {
    this.gruposCerrados.update((cerrados: readonly string[]) =>
      cerrados.includes(elemento.url)
        ? cerrados.filter((url: string) => url !== elemento.url)
        : [...cerrados, elemento.url]
    );
  }
}
