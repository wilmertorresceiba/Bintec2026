import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Miga } from '@core/interfaces/miga';

const MIGA_INICIO: Miga = { etiqueta: 'Inicio', url: '/dashboard' };
const CLAVE_DATA_MIGA: string = 'miga';

/** Arma la ruta de navegación a partir de `data: { miga: 'Etiqueta' }` en la configuración de rutas. */
export function construirMigas(raiz: ActivatedRouteSnapshot): Miga[] {
  const migas: Miga[] = [MIGA_INICIO];
  let url: string = '';
  let actual: ActivatedRouteSnapshot | null = raiz.firstChild;

  while (actual) {
    const segmento: string = actual.url.map(parte => parte.path).join('/');
    url = segmento ? `${url}/${segmento}` : url;
    const etiqueta: unknown = actual.routeConfig?.data?.[CLAVE_DATA_MIGA];
    if (typeof etiqueta === 'string') {
      migas.push({ etiqueta, url: url || '/' });
    }
    actual = actual.firstChild;
  }
  return migas;
}

function crearSenalMigas(): Signal<Miga[]> {
  const router: Router = inject(Router);
  const actuales: () => Miga[] = (): Miga[] => construirMigas(router.routerState.snapshot.root);
  return toSignal(
    router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map(actuales),
      startWith(actuales())
    ),
    { requireSync: true }
  );
}

@Injectable({ providedIn: 'root' })
export class MigaDePanService {
  public readonly migas: Signal<Miga[]> = crearSenalMigas();
}
