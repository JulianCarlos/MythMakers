import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authMatch: CanMatchFn = (_route, segments: UrlSegment[]): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  const returnUrl = '/' + segments.map(s => s.path).join('/');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
};
