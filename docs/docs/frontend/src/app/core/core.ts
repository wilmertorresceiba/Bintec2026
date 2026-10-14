import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  provideEnvironmentInitializer,
  Provider,
  provideZoneChangeDetection,
} from '@angular/core';
import { Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { apiKeyInterceptor } from './interceptors/api-key/api-key.interceptor';
import { autenticacionInterceptor } from './interceptors/autenticacion/autenticacion.interceptor';
import { erroresHttpInterceptor } from './interceptors/errores-http/errores-http.interceptor';
import { providerGlobalErrorHandler } from './provider-error-handler';

export interface CoreOptions {
  routes: Routes;
}

export const CORE_GUARD: InjectionToken<string> = new InjectionToken<string>('CORE_GUARD');

export function provideCore(coreOptions: CoreOptions): (EnvironmentProviders | Provider)[] {
  return [
    provideRouter(coreOptions.routes, withComponentInputBinding()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withFetch(),
      withInterceptors([erroresHttpInterceptor, autenticacionInterceptor, apiKeyInterceptor])
    ),
    providerGlobalErrorHandler(),
    provideEnvironmentInitializer(() => {
      const coreGuard: string | null = inject(CORE_GUARD, {
        skipSelf: true,
        optional: true,
      });
      if (coreGuard) {
        throw new TypeError(`provideCore() solo debe llamarse una vez en la aplicación`);
      }
    }),
    {
      provide: CORE_GUARD,
      useValue: 'CORE_INITIALIZED',
    },
  ];
}
