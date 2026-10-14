import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Opciones {
  headers?: HttpHeaders;
  params?: HttpParams;
}
@Injectable({ providedIn: 'root' })
export class HttpService {
  private readonly http: HttpClient = inject(HttpClient);

  public doGet<T>(urlServicio: string, opciones?: Opciones): Observable<T> {
    const ropts: Opciones = this.crearOpciones(opciones);
    return this.http.get<T>(urlServicio, ropts);
  }

  public doPost<T, R>(urlServicio: string, parametros: T, opciones?: Opciones): Observable<R> {
    const ropts: Opciones = this.crearOpciones(opciones);

    return this.http.post<R>(urlServicio, parametros, ropts);
  }

  public doPut<T, R>(urlServicio: string, parametros: T, opciones?: Opciones): Observable<R> {
    const ropts: Opciones = this.crearOpciones(opciones);

    return this.http.put<R>(urlServicio, parametros, ropts);
  }

  public doPatch<T, R>(urlServicio: string, parametros: T, opciones?: Opciones): Observable<R> {
    const ropts: Opciones = this.crearOpciones(opciones);

    return this.http.patch<R>(urlServicio, parametros, ropts);
  }

  public doDelete<R>(urlServicio: string, opciones?: Opciones): Observable<R> {
    const ropts: Opciones = this.crearOpciones(opciones);

    return this.http.delete<R>(urlServicio, ropts);
  }

  public setHeader(nombre: string, valor: string): Opciones {
    const opcionesPorDefecto: Opciones = this.crearOpcionesPorDefecto();
    if (opcionesPorDefecto.headers) {
      opcionesPorDefecto.headers = opcionesPorDefecto.headers.set(nombre, valor);
    }
    return opcionesPorDefecto;
  }

  private crearOpciones(opciones?: Opciones): Opciones {
    const opcionesPorDefecto: Opciones = this.crearOpcionesPorDefecto();
    const opcionesCombinadas: Opciones = {
      ...opcionesPorDefecto,
      ...opciones,
      headers: opciones?.headers ?? opcionesPorDefecto.headers,
      params: opciones?.params ?? opcionesPorDefecto.params,
    };

    if (opcionesCombinadas.headers && !opcionesCombinadas.headers.get('Content-Type')) {
      const tipoContenidoPorDefecto: string | null =
        opcionesPorDefecto.headers?.get('Content-Type') ?? null;
      if (tipoContenidoPorDefecto) {
        opcionesCombinadas.headers = opcionesCombinadas.headers.set(
          'Content-Type',
          tipoContenidoPorDefecto
        );
      }
    }

    return opcionesCombinadas;
  }

  private crearOpcionesPorDefecto(): Opciones {
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
  }
}
