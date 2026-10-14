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
import { CuentaAhorroComponent } from '@feature/dashboard/components/cuenta-ahorro/cuenta-ahorro.component';
import { CuentaAhorro } from '@feature/dashboard/shared/interfaces/dashboard';
import { ProductosService } from '@feature/dashboard/shared/service/productos.service';
import { EstadoDatosComponent } from '@shared/components/estado-datos/estado-datos.component';

@Component({
  selector: 'app-cuentas',
  templateUrl: './cuentas.component.html',
  styleUrl: './cuentas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CuentaAhorroComponent, EstadoDatosComponent],
})
export class CuentasComponent implements OnInit {
  public readonly cuentas: WritableSignal<CuentaAhorro[]> = signal<CuentaAhorro[]>([]);
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
      .obtenerCuentas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cuentas: CuentaAhorro[]) => {
          this.cuentas.set(cuentas);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
        },
      });
  }
}
