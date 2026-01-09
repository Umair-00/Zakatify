import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],  // Added RouterModule here
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Attempting login with:', this.email);

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        if (response.success) {
          this.router.navigate(['/landing']);
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