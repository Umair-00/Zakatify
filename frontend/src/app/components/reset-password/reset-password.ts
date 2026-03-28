import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  tokenError: boolean = false;

  private accessToken: string = '';
  private refreshToken: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Supabase redirects with tokens in the URL hash fragment:
    // #access_token=xxx&refresh_token=xxx&type=recovery
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    this.accessToken = params.get('access_token') || '';
    this.refreshToken = params.get('refresh_token') || '';
    const type = params.get('type');

    if (!this.accessToken || type !== 'recovery') {
      this.tokenError = true;
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in both fields';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.resetPassword(this.accessToken, this.refreshToken, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = response.message;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage = response.message;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Password reset failed. The link may have expired.';
        this.cdr.detectChanges();
      }
    });
  }
}
