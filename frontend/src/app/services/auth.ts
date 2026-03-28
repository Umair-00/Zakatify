import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface AuthRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  currency: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  currency?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5102/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.loggedIn.asObservable();

  private refreshInProgress: Observable<AuthResponse> | null = null;

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('accessToken');
    if (token && !this.isTokenExpired(token)) {
      this.loggedIn.next(true);
    } else if (token) {
      this.clearSession();
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const request: AuthRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        if (response.success && response.accessToken) {
          this.storeSession(response);
        }
      }),
      catchError(() => {
        return throwError(() => new Error('Login failed. Please try again.'));
      })
    );
  }

  signup(request: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, request).pipe(
      tap(response => {
        if (response.success && response.accessToken) {
          this.storeSession(response);
        }
      }),
      catchError(() => {
        return throwError(() => new Error('Signup failed. Please try again.'));
      })
    );
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`);
  }

  refreshSession(): Observable<AuthResponse> {
    if (this.refreshInProgress) {
      return this.refreshInProgress;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    this.refreshInProgress = this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.refreshInProgress = null;
          if (response.success && response.accessToken) {
            this.storeSession(response);
          } else {
            this.logout();
          }
        }),
        catchError(err => {
          this.refreshInProgress = null;
          this.logout();
          return throwError(() => err);
        })
      );

    return this.refreshInProgress;
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  fetchAndStoreProfile(): void {
    this.getProfile().subscribe({
      next: (profile) => {
        if (profile.success && profile.firstName) {
          localStorage.setItem('userName', `${profile.firstName} ${profile.lastName}`);
          localStorage.setItem('userFirstName', profile.firstName);
        }
      }
    });
  }

  isTokenExpired(token?: string | null): boolean {
    const t = token ?? this.getToken();
    if (!t) return true;

    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload.exp * 1000 < Date.now() + 30_000;
    } catch {
      return true;
    }
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError(() => {
        return throwError(() => new Error('Request failed. Please try again.'));
      })
    );
  }

  resetPassword(accessToken: string, refreshToken: string, newPassword: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password`, {
      accessToken,
      refreshToken,
      newPassword
    }).pipe(
      catchError(() => {
        return throwError(() => new Error('Password reset failed. Please try again.'));
      })
    );
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken!);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    localStorage.setItem('userId', response.userId || '');
    localStorage.setItem('userEmail', response.email || '');
    this.loggedIn.next(true);
  }

  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userFirstName');
    this.loggedIn.next(false);
  }
}
