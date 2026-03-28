import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = authService.getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.getRefreshToken()) {
        return authService.refreshSession().pipe(
          switchMap(response => {
            if (response.success && response.accessToken) {
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${response.accessToken}` }
              });
              return next(retryReq);
            }
            return throwError(() => error);
          }),
          catchError(() => {
            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
