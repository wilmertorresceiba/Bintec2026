import { HttpHeaders, HttpParams, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpService, Opciones } from './http.service';

describe('HttpService', () => {
  let servicioHttp: HttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpService, provideHttpClient(), provideHttpClientTesting()],
    });

    servicioHttp = TestBed.inject(HttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(servicioHttp).toBeTruthy();
  });

  it('debería realizar una solicitud GET sin opciones', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };

    servicioHttp.doGet('/test-url').subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne('/test-url');
    expect(req.request.method).toBe('GET');
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud GET con opciones', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };
    const opciones: Opciones = {
      headers: new HttpHeaders({
        'Encabezado-Personalizado': 'ValorPersonalizado',
      }),
      params: new HttpParams().set('param1', 'valor1'),
    };

    servicioHttp.doGet('/test-url', opciones).subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne(
      r => r.url === '/test-url' && r.params.has('param1')
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Encabezado-Personalizado')).toBe('ValorPersonalizado');
    expect(req.request.params.get('param1')).toBe('valor1');
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud GET con opciones y con encabezado por defecto', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };
    const opciones: Opciones = {
      params: new HttpParams().set('param1', 'valor1'),
    };

    servicioHttp.doGet('/test-url', opciones).subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne(
      r => r.url === '/test-url' && r.params.has('param1')
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.params.get('param1')).toBe('valor1');
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud POST sin opciones', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };
    const datosPost: { nombre: string } = { nombre: 'Datos de Post' };

    servicioHttp.doPost('/test-url', datosPost).subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne('/test-url');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datosPost);
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud POST con opciones', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };
    const datosPost: { nombre: string } = { nombre: 'Datos de Post' };
    const opciones: Opciones = {
      headers: new HttpHeaders({
        'Encabezado-Personalizado': 'ValorPersonalizado',
      }),
      params: new HttpParams().set('param1', 'valor1'),
    };

    servicioHttp.doPost('/test-url', datosPost, opciones).subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne(
      r => r.url === '/test-url' && r.params.has('param1')
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datosPost);
    expect(req.request.headers.get('Encabezado-Personalizado')).toBe('ValorPersonalizado');
    expect(req.request.params.get('param1')).toBe('valor1');
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud PUT sin opciones', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };
    const datosPut: { nombre: string } = { nombre: 'Datos de Put' };

    servicioHttp.doPut('/test-url', datosPut).subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne('/test-url');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datosPut);
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud PUT con opciones', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };
    const datosPut: { nombre: string } = { nombre: 'Datos de Put' };
    const opciones: Opciones = {
      headers: new HttpHeaders({
        'Encabezado-Personalizado': 'ValorPersonalizado',
      }),
      params: new HttpParams().set('param1', 'valor1'),
    };

    servicioHttp.doPut('/test-url', datosPut, opciones).subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne(
      r => r.url === '/test-url' && r.params.has('param1')
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datosPut);
    expect(req.request.headers.get('Encabezado-Personalizado')).toBe('ValorPersonalizado');
    expect(req.request.params.get('param1')).toBe('valor1');
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud PATCH sin opciones', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };
    const datosPatch: { nombre: string } = { nombre: 'Datos de Patch' };

    servicioHttp.doPatch('/test-url', datosPatch).subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne('/test-url');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(datosPatch);
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud PATCH con opciones', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };
    const datosPatch: { nombre: string } = { nombre: 'Datos de Patch' };
    const opciones: Opciones = {
      headers: new HttpHeaders({
        'Encabezado-Personalizado': 'ValorPersonalizado',
      }),
      params: new HttpParams().set('param1', 'valor1'),
    };

    servicioHttp.doPatch('/test-url', datosPatch, opciones).subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne(
      r => r.url === '/test-url' && r.params.has('param1')
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(datosPatch);
    expect(req.request.headers.get('Encabezado-Personalizado')).toBe('ValorPersonalizado');
    expect(req.request.params.get('param1')).toBe('valor1');
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud DELETE sin opciones', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };

    servicioHttp.doDelete('/test-url').subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne('/test-url');
    expect(req.request.method).toBe('DELETE');
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud DELETE con opciones', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };
    const opciones: Opciones = {
      headers: new HttpHeaders({
        'Encabezado-Personalizado': 'ValorPersonalizado',
      }),
      params: new HttpParams().set('param1', 'valor1'),
    };

    servicioHttp.doDelete('/test-url', opciones).subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne(
      r => r.url === '/test-url' && r.params.has('param1')
    );
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Encabezado-Personalizado')).toBe('ValorPersonalizado');
    expect(req.request.params.get('param1')).toBe('valor1');
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud GET con parámetros', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };
    const params: HttpParams = new HttpParams().set('param1', 'valor1');

    servicioHttp.doGet('/test-url', { params }).subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne(
      r => r.url === '/test-url' && r.params.has('param1')
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('param1')).toBe('valor1');
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud GET con parámetros nulos', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };

    servicioHttp.doGet('/test-url', { params: undefined }).subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne(
      r => r.url === '/test-url' && r.headers.has('Content-Type')
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush(datosPrueba);
  });

  it('debería realizar una solicitud GET con parámetros y opciones personalizadas', () => {
    const datosPrueba: { nombre: string } = { nombre: 'Datos de Prueba' };
    const opciones: Opciones = {
      headers: new HttpHeaders({
        'Encabezado-Personalizado': 'ValorPersonalizado',
      }),
      params: new HttpParams().set('param1', 'valor1'),
    };

    servicioHttp.doGet('/test-url', opciones).subscribe(datos => {
      expect(datos).toEqual(datosPrueba);
    });

    const req: TestRequest = httpMock.expectOne(
      r => r.url === '/test-url' && r.params.has('param1')
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('param1')).toBe('valor1');
    expect(req.request.headers.get('Encabezado-Personalizado')).toBe('ValorPersonalizado');
    req.flush(datosPrueba);
  });

  it('debería establecer un encabezado si está permitido', () => {
    const nombreEncabezado: string = 'Authorization';
    const valorEncabezado: string = 'Bearer token';

    const opciones: Opciones = servicioHttp.setHeader(nombreEncabezado, valorEncabezado);

    expect(opciones.headers).toBeDefined();
    expect(opciones.headers?.get(nombreEncabezado)).toBe(valorEncabezado);
  });
});
