import type { HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const clon: HttpRequest<unknown> = req.clone({
    headers: req.headers.set('x-api-key', 'reqres-free-v1'),
  });
  return next(clon);
};
