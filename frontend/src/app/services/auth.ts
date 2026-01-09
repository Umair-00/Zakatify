import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  userId?: string;
  email?: string;
}

interface SignupRequest {
  email: string;
  password: string;
}

interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5102/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check if user was previously logged in
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.loggedIn.next(true);
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        if (response.success && response.userId) {
          // Store user info
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('userEmail', response.email || '');
          this.loggedIn.next(true);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed. Please try again.'));
      })
    );
  }

  signup(email: string, password: string): Observable<SignupResponse> {
  const request: SignupRequest = { email, password };
  return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, request).pipe(
    tap(response => {
      if (response.success && response.userId) {
        // Optionally auto-login after signup
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('userEmail', response.email || '');
        this.loggedIn.next(true);
      }
    }),
    catchError(error => {
      console.error('Signup error:', error);
      return throwError(() => new Error('Signup failed. Please try again.'));
    })
  );
}

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }
}