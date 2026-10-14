import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreditoComponent } from '@feature/dashboard/components/credito/credito.component';
import { Credito } from '@feature/dashboard/shared/interfaces/dashboard';
import { ProductosService } from '@feature/dashboard/shared/service/productos.service';
import { EstadoDatosComponent } from '@shared/components/estado-datos/estado-datos.component';

@Component({
  selector: 'app-creditos',
  templateUrl: './creditos.component.html',
  styleUrl: './creditos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CreditoComponent, EstadoDatosComponent],
})
export class CreditosComponent implements OnInit {
  public readonly creditos: WritableSignal<Credito[]> = signal<Credito[]>([]);
  public readonly cargando: WritableSignal<boolean> = signal<boolean>(true);
  public readonly error: WritableSignal<boolean> = signal<boolean>(false);

  private readonly productosService: ProductosService = inject(ProductosService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this.cargar();
  }

  public cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.productosService
      .obtenerCreditos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (creditos: Credito[]) => {
          this.creditos.set(creditos);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
        },
      });
  }
}
