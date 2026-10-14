import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideCore } from '@core/core';
import { routes } from './app.routes';

registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
  providers: [provideCore({ routes }), { provide: LOCALE_ID, useValue: 'es-CO' }],
};
