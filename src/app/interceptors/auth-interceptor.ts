import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { SKIP_AUTH } from './skip-auth.context';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) return next(req);

  const auth = inject(AuthService);
  if (auth.isLoggedIn()) {
    req = req.clone({
      setHeaders: {
        Authorization: 'Mock ' + JSON.stringify({ roles: auth.roles() }),
      }
    });
  }
  return next(req);
};