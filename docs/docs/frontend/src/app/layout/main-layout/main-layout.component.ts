import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ElementoMenu } from '@core/interfaces/elemento-menu';
import { SesionService } from '@core/services/sesion/sesion.service';
import { HeaderComponent } from '@layout/header/header-layout.component';
import { NavbarComponent } from '@layout/navbar/navbar-layout.component';

const CONSULTA_MOVIL: string = '(max-width: 768px)';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  imports: [NavbarComponent, HeaderComponent, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'plegarEnMovil()' },
})
export class MainLayoutComponent {
  public readonly anioActual: number = new Date().getFullYear();
  public readonly sesionService: SesionService = inject(SesionService);

  public elementosMenu: WritableSignal<ElementoMenu[]> = signal<ElementoMenu[]>([
    {
      nombre: 'Inicio',
      url: 'dashboard',
      opciones: { rutaActivaExacta: true },
    },
    {
      nombre: 'Mis productos',
      url: 'dashboard/productos',
      opciones: { rutaActivaExacta: false },
      hijos: [
        {
          nombre: 'Cuentas de ahorro',
          url: 'dashboard/productos/cuentas',
          opciones: { rutaActivaExacta: false },
        },
        {
          nombre: 'Tarjetas',
          url: 'dashboard/productos/tarjetas',
          opciones: { rutaActivaExacta: false },
        },
        {
          nombre: 'Créditos',
          url: 'dashboard/productos/creditos',
          opciones: { rutaActivaExacta: false },
        },
      ],
    },
    {
      nombre: 'Reportes',
      url: 'dashboard/reportes',
      opciones: { rutaActivaExacta: false },
    },
  ]);

  /** En pantallas pequeñas el menú arranca plegado; en escritorio, desplegado. */
  public readonly plegado: WritableSignal<boolean> = signal<boolean>(this.esMovil());

  private readonly router: Router = inject(Router);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor() {
    // En móvil, al navegar el menú se pliega para dejar ver el contenido
    this.router.events
      .pipe(
        filter((evento: unknown) => evento instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (this.esMovil()) {
          this.plegado.set(true);
        }
      });
  }

  public plegarEnMovil(): void {
    if (this.esMovil()) {
      this.plegado.set(true);
    }
  }

  public alternarPlegado(): void {
    this.plegado.update((valor: boolean) => !valor);
  }

  public cerrarSesion(): void {
    this.sesionService.cerrar();
    void this.router.navigate(['/login']);
  }

  private esMovil(): boolean {
    return window.matchMedia(CONSULTA_MOVIL).matches;
  }
}
