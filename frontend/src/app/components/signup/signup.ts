import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PasswordStrengthService, PasswordStrength } from '../../services/password-strength';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  country: string = '';
  currency: string = 'USD';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  passwordStrength: PasswordStrength | null = null;
  breachWarning: string = '';

  countries = [
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR' },
    { code: 'MY', name: 'Malaysia', currency: 'MYR' },
    { code: 'PK', name: 'Pakistan', currency: 'PKR' },
    { code: 'IN', name: 'India', currency: 'INR' },
    { code: 'BD', name: 'Bangladesh', currency: 'BDT' },
    { code: 'ID', name: 'Indonesia', currency: 'IDR' },
    { code: 'TR', name: 'Turkey', currency: 'TRY' },
    { code: 'EG', name: 'Egypt', currency: 'EGP' },
    { code: 'NG', name: 'Nigeria', currency: 'NGN' },
    { code: 'AU', name: 'Australia', currency: 'AUD' },
    { code: 'DE', name: 'Germany', currency: 'EUR' },
    { code: 'FR', name: 'France', currency: 'EUR' },
    { code: 'NL', name: 'Netherlands', currency: 'EUR' },
    { code: 'SE', name: 'Sweden', currency: 'SEK' },
    { code: 'SG', name: 'Singapore', currency: 'SGD' },
    { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
  ];

  onCountryChange(): void {
    const match = this.countries.find(c => c.code === this.country);
    if (match) {
      this.currency = match.currency;
    }
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private passwordStrengthService: PasswordStrengthService
  ) {}

  onPasswordChange(): void {
    if (this.password) {
      this.passwordStrength = this.passwordStrengthService.evaluate(this.password);
    } else {
      this.passwordStrength = null;
    }
    this.breachWarning = '';
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    // Trim inputs
    this.firstName = this.firstName.trim();
    this.lastName = this.lastName.trim();
    this.email = this.email.trim();

    // Validation
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword || !this.country) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.firstName.length > 50 || this.lastName.length > 50) {
      this.errorMessage = 'Name must be 50 characters or less';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (this.password.length > 128) {
      this.errorMessage = 'Password must be 128 characters or less';
      return;
    }

    if (this.passwordStrength?.blocked) {
      this.errorMessage = this.passwordStrength.reason;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.breachWarning = '';

    // Check HIBP breach database
    const isBreached = await this.passwordStrengthService.checkBreached(this.password);
    if (isBreached) {
      this.isLoading = false;
      this.breachWarning = 'This password has appeared in a data breach. Please choose a different one.';
      this.cdr.detectChanges();
      return;
    }

    this.authService.signup({
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      country: this.country,
      currency: this.currency
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = response.message;
          this.cdr.detectChanges();
        } else {
          this.errorMessage = response.message;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Signup failed. Please try again.';
        this.cdr.detectChanges();
        console.error('Signup error:', error);
      }
    });
  }
}