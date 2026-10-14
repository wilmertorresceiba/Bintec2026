import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DetalleNotificacion } from '@core/interfaces/notificacion';
import { HttpService } from '@core/services/http/http.service';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class OfertasService {
  private readonly http: HttpService = inject(HttpService);

  public obtenerDetalle(id: string): Observable<DetalleNotificacion> {
    return this.http.doGet<DetalleNotificacion>(`${environment.endpoint}/notificaciones/${id}`);
  }
}
