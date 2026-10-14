import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@core/services/http/http.service';
import { environment } from '@env/environment';
import { Movimiento } from '@feature/dashboard/shared/interfaces/dashboard';
import { FiltroReporte } from '@feature/dashboard/shared/interfaces/reporte';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http: HttpService = inject(HttpService);

  public buscarMovimientos(filtro: FiltroReporte): Observable<Movimiento[]> {
    let params: HttpParams = new HttpParams();
    if (filtro.desde) {
      params = params.set('desde', filtro.desde);
    }
    if (filtro.hasta) {
      params = params.set('hasta', filtro.hasta);
    }
    if (filtro.tipo) {
      params = params.set('tipo', filtro.tipo);
    }
    return this.http.doGet<Movimiento[]>(`${environment.endpoint}/movimientos/reporte`, {
      params,
    });
  }
}
