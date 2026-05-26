import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth  = inject(AuthService);
  const router = inject(Router);
  const roles: string[] = route.data['roles'] ?? [];
  return !roles.length || roles.some(r => auth.hasRole(r))
    ? true
    : router.createUrlTree(['/dashboard']);
};