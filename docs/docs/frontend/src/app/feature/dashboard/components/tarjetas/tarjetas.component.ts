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
import { TarjetaCreditoComponent } from '@feature/dashboard/components/tarjeta-credito/tarjeta-credito.component';
import { TarjetaCredito } from '@feature/dashboard/shared/interfaces/dashboard';
import { ProductosService } from '@feature/dashboard/shared/service/productos.service';
import { EstadoDatosComponent } from '@shared/components/estado-datos/estado-datos.component';

@Component({
  selector: 'app-tarjetas',
  templateUrl: './tarjetas.component.html',
  styleUrl: './tarjetas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TarjetaCreditoComponent, EstadoDatosComponent],
})
export class TarjetasComponent implements OnInit {
  public readonly tarjetas: WritableSignal<TarjetaCredito[]> = signal<TarjetaCredito[]>([]);
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
      .obtenerTarjetas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tarjetas: TarjetaCredito[]) => {
          this.tarjetas.set(tarjetas);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
        },
      });
  }
}
