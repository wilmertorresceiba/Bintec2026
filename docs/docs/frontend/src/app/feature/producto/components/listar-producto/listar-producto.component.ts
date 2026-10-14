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
import { RouterLink } from '@angular/router';
import { Producto } from '@feature/producto/shared/interfaces/producto';
import { ProductoService } from '@feature/producto/shared/service/producto.service';

@Component({
  selector: 'app-listar-producto',
  templateUrl: './listar-producto.component.html',
  styleUrl: './listar-producto.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class ListarProductoComponent implements OnInit {
  public productos: WritableSignal<Producto[]> = signal<Producto[]>([]);

  private readonly productoService: ProductoService = inject(ProductoService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this.productoService
      .consultarProductos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((productos: Producto[]) => {
        this.productos.set(productos);
      });
  }

  public eliminarProducto(id: number): void {
    this.productoService
      .eliminarProducto(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.productos.update((lista: Producto[]) => lista.filter((p: Producto) => p.id !== id));
      });
  }
}
