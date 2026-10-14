import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpService } from '@core/services/http/http.service';
import { CrearProductoTestDataBuilder } from '@feature/producto/mocks/builders/producto/crear-producto.test-data-builder';
import { ProductoTestDataBuilder } from '@feature/producto/mocks/builders/producto/producto.test-data-builder';
import { CrearProducto } from '@feature/producto/shared/interfaces/crear-producto';
import { CrearProductoRespuesta } from '@feature/producto/shared/interfaces/crear-producto-respuesta';
import { Producto } from '@feature/producto/shared/interfaces/producto';
import { ProductoService } from './producto.service';

const ID_PRODUCTO: number = 1;
const ENDPOINT_PRODUCTOS: string = '/api/products';
const ENDPOINT_PRODUCTO: string = `${ENDPOINT_PRODUCTOS}/${ID_PRODUCTO}`;

describe('ProductoService', () => {
  let productoService: ProductoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductoService, HttpService, provideHttpClient(), provideHttpClientTesting()],
    });

    productoService = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(productoService).toBeTruthy();
  });

  describe('consultarProductos', () => {
    it('debería consultar la lista de productos vía GET', () => {
      const productos: Producto[] = [new ProductoTestDataBuilder().construir()];

      productoService.consultarProductos().subscribe((resultado: Producto[]) => {
        expect(resultado).toEqual(productos);
      });

      const req: TestRequest = httpMock.expectOne(ENDPOINT_PRODUCTOS);
      expect(req.request.method).toBe('GET');
      req.flush(productos);
    });
  });

  describe('consultarProducto', () => {
    it('debería consultar un producto por id vía GET', () => {
      const producto: Producto = new ProductoTestDataBuilder().conId(ID_PRODUCTO).construir();

      productoService.consultarProducto(ID_PRODUCTO).subscribe((resultado: Producto) => {
        expect(resultado).toEqual(producto);
      });

      const req: TestRequest = httpMock.expectOne(ENDPOINT_PRODUCTO);
      expect(req.request.method).toBe('GET');
      req.flush(producto);
    });
  });

  describe('crearProducto', () => {
    it('debería crear un producto vía POST', () => {
      const nuevoProducto: CrearProducto = new CrearProductoTestDataBuilder().construir();
      const respuesta: CrearProductoRespuesta = { ...nuevoProducto, id: ID_PRODUCTO };

      productoService
        .crearProducto(nuevoProducto)
        .subscribe((resultado: CrearProductoRespuesta) => {
          expect(resultado).toEqual(respuesta);
        });

      const req: TestRequest = httpMock.expectOne(ENDPOINT_PRODUCTOS);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoProducto);
      req.flush(respuesta);
    });
  });

  describe('actualizarProducto', () => {
    it('debería actualizar un producto vía PUT', () => {
      const productoEditado: CrearProducto = new CrearProductoTestDataBuilder()
        .conTitle('Título editado')
        .construir();
      const respuesta: CrearProductoRespuesta = { ...productoEditado, id: ID_PRODUCTO };

      productoService
        .actualizarProducto(ID_PRODUCTO, productoEditado)
        .subscribe((resultado: CrearProductoRespuesta) => {
          expect(resultado).toEqual(respuesta);
        });

      const req: TestRequest = httpMock.expectOne(ENDPOINT_PRODUCTO);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(productoEditado);
      req.flush(respuesta);
    });
  });

  describe('guardarProducto', () => {
    it('debería crear el producto vía POST cuando el id es undefined', () => {
      const nuevoProducto: CrearProducto = new CrearProductoTestDataBuilder().construir();
      const respuesta: CrearProductoRespuesta = { ...nuevoProducto, id: ID_PRODUCTO };

      productoService
        .guardarProducto(undefined, nuevoProducto)
        .subscribe((resultado: CrearProductoRespuesta) => {
          expect(resultado).toEqual(respuesta);
        });

      const req: TestRequest = httpMock.expectOne(ENDPOINT_PRODUCTOS);
      expect(req.request.method).toBe('POST');
      req.flush(respuesta);
    });

    it('debería actualizar el producto vía PUT cuando el id está definido', () => {
      const productoEditado: CrearProducto = new CrearProductoTestDataBuilder().construir();
      const respuesta: CrearProductoRespuesta = { ...productoEditado, id: ID_PRODUCTO };

      productoService
        .guardarProducto(ID_PRODUCTO, productoEditado)
        .subscribe((resultado: CrearProductoRespuesta) => {
          expect(resultado).toEqual(respuesta);
        });

      const req: TestRequest = httpMock.expectOne(ENDPOINT_PRODUCTO);
      expect(req.request.method).toBe('PUT');
      req.flush(respuesta);
    });
  });

  describe('eliminarProducto', () => {
    it('debería eliminar un producto vía DELETE', () => {
      const producto: Producto = new ProductoTestDataBuilder().conId(ID_PRODUCTO).construir();

      productoService.eliminarProducto(ID_PRODUCTO).subscribe((resultado: Producto) => {
        expect(resultado).toEqual(producto);
      });

      const req: TestRequest = httpMock.expectOne(ENDPOINT_PRODUCTO);
      expect(req.request.method).toBe('DELETE');
      req.flush(producto);
    });
  });
});
