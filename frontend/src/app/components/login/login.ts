import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  infoMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'idle') {
      this.infoMessage = 'You were logged out due to inactivity.';
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    this.email = this.email.trim();

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Attempting login with:', this.email);

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        if (response.success) {
          this.authService.fetchAndStoreProfile();
          this.router.navigate(['/dashboard']);
        } else {
          this.isLoading = false;
          this.errorMessage = response.message;
          this.cdr.detectChanges(); // Force UI update
        }
      },
      error: (error) => {
        console.log('Login error caught:', error);
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please try again.';
        this.cdr.detectChanges(); // Force UI update
        console.error('Login error:', error);
      }
    });
  }
}