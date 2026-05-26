import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const router  = inject(Router);
  const token   = storage.getToken();

  const r = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(r).pipe(
    catchError((e: HttpErrorResponse) => {
      if (e.status === 401 && !req.url.includes('/auth/login')) {
        storage.clear();
        router.navigate(['/auth/login']);
      }
      const msg = e?.error?.message || e?.error?.errors?.[0] || getMsg(e.status);
      return throwError(() => ({ ...e, userMessage: msg }));
    })
  );
};

function getMsg(s: number) {
  const m: Record<number,string> = {
    0: 'Cannot connect to server. Make sure backend is running on port 5028.',
    400: 'Invalid request data.',
    401: 'Invalid credentials.',
    403: 'Access denied.',
    404: 'Not found.',
    429: 'Too many requests. Please wait.',
    500: 'Server error. Please try again.'
  };
  return m[s] ?? 'Unexpected error occurred.';
}