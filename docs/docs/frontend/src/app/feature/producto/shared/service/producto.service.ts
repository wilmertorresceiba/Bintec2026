import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@core/services/http/http.service';
import { environment } from '@env/environment';
import { CrearProducto } from '@feature/producto/shared/interfaces/crear-producto';
import { CrearProductoRespuesta } from '@feature/producto/shared/interfaces/crear-producto-respuesta';
import { Producto } from '@feature/producto/shared/interfaces/producto';

@Injectable()
export class ProductoService {
  private readonly http: HttpService = inject(HttpService);

  public consultarProductos(): Observable<Producto[]> {
    return this.http.doGet<Producto[]>(`${environment.endpoint}/products`);
  }

  public consultarProducto(id: number): Observable<Producto> {
    return this.http.doGet<Producto>(`${environment.endpoint}/products/${id}`);
  }

  public crearProducto(producto: CrearProducto): Observable<CrearProductoRespuesta> {
    return this.http.doPost<CrearProducto, CrearProductoRespuesta>(
      `${environment.endpoint}/products`,
      producto
    );
  }

  public actualizarProducto(
    id: number,
    producto: CrearProducto
  ): Observable<CrearProductoRespuesta> {
    return this.http.doPut<CrearProducto, CrearProductoRespuesta>(
      `${environment.endpoint}/products/${id}`,
      producto
    );
  }

  public guardarProducto(
    id: number | undefined,
    producto: CrearProducto
  ): Observable<CrearProductoRespuesta> {
    return id !== undefined ? this.actualizarProducto(id, producto) : this.crearProducto(producto);
  }

  public eliminarProducto(id: number): Observable<Producto> {
    return this.http.doDelete<Producto>(`${environment.endpoint}/products/${id}`);
  }
}
