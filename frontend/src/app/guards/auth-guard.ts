import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  if (!authService.isTokenExpired(token)) {
    return true;
  }

  if (authService.getRefreshToken()) {
    return authService.refreshSession().pipe(
      map(response => {
        if (response.success) {
          return true;
        }
        router.navigate(['/login']);
        return false;
      }),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  }

  authService.logout();
  return false;
};
