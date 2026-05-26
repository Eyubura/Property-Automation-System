import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = () => {
  const s = inject(StorageService);
  const r = inject(Router);
  return s.isLoggedIn() ? true : r.createUrlTree(['/auth/login']);
};