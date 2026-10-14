import { ErrorHandler, Provider } from '@angular/core';
import { ManejadorErroresService } from './services/manejador-errores/manejador-errores.service';

export function providerGlobalErrorHandler(): Provider {
  return {
    provide: ErrorHandler,
    useClass: ManejadorErroresService,
  };
}
