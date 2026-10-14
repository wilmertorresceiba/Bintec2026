import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@core/services/http/http.service';
import { environment } from '@env/environment';
import {
  Credito,
  CuentaAhorro,
  TarjetaCredito,
} from '@feature/dashboard/shared/interfaces/dashboard';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http: HttpService = inject(HttpService);

  public obtenerCuentas(): Observable<CuentaAhorro[]> {
    return this.http.doGet<CuentaAhorro[]>(`${environment.endpoint}/cuentas`);
  }

  public obtenerTarjetas(): Observable<TarjetaCredito[]> {
    return this.http.doGet<TarjetaCredito[]>(`${environment.endpoint}/tarjetas`);
  }

  public obtenerCreditos(): Observable<Credito[]> {
    return this.http.doGet<Credito[]>(`${environment.endpoint}/creditos`);
  }
}
