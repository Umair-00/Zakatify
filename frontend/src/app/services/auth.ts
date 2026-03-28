import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface AuthRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  email?: string;
  accessToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5102/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.loggedIn.next(true);
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

  signup(email: string, password: string): Observable<AuthResponse> {
    const request: AuthRequest = { email, password };
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

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
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
    localStorage.setItem('userId', response.userId || '');
    localStorage.setItem('userEmail', response.email || '');
    this.loggedIn.next(true);
  }
}
