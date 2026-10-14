import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@core/services/http/http.service';
import { environment } from '@env/environment';
import { PeriodoUso, SerieConsumo } from '@feature/dashboard/shared/interfaces/analitica';

@Injectable({ providedIn: 'root' })
export class AnaliticaService {
  private readonly http: HttpService = inject(HttpService);

  /** `anio` aplica a los periodos mes y día; `mes` solo al periodo día. */
  public obtenerConsumo(periodo: PeriodoUso, anio: number, mes: number): Observable<SerieConsumo> {
    let params: HttpParams = new HttpParams().set('periodo', periodo);
    if (periodo !== 'anio') {
      params = params.set('anio', anio);
    }
    if (periodo === 'dia') {
      params = params.set('mes', mes);
    }
    return this.http.doGet<SerieConsumo>(`${environment.endpoint}/analitica/consumo`, { params });
  }
}
