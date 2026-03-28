import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PasswordStrengthService, PasswordStrength } from '../../services/password-strength';

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
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  passwordStrength: PasswordStrength | null = null;
  breachWarning: string = '';

  private accessToken: string = '';
  private refreshToken: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private passwordStrengthService: PasswordStrengthService
  ) {}

  onPasswordChange(): void {
    if (this.newPassword) {
      this.passwordStrength = this.passwordStrengthService.evaluate(this.newPassword);
    } else {
      this.passwordStrength = null;
    }
    this.breachWarning = '';
  }

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

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in both fields';
      return;
    }

    if (this.newPassword.length > 128) {
      this.errorMessage = 'Password must be 128 characters or less';
      return;
    }

    if (this.passwordStrength?.blocked) {
      this.errorMessage = this.passwordStrength.reason;
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.breachWarning = '';

    const isBreached = await this.passwordStrengthService.checkBreached(this.newPassword);
    if (isBreached) {
      this.isLoading = false;
      this.breachWarning = 'This password has appeared in a data breach. Please choose a different one.';
      this.cdr.detectChanges();
      return;
    }

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
