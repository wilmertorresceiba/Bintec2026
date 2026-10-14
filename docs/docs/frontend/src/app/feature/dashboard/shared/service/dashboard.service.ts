import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@core/services/http/http.service';
import { environment } from '@env/environment';
import { DashboardDatos } from '@feature/dashboard/shared/interfaces/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http: HttpService = inject(HttpService);

  public obtenerDashboard(): Observable<DashboardDatos> {
    return this.http.doGet<DashboardDatos>(`${environment.endpoint}/dashboard`);
  }
}
