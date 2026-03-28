import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class Settings implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Profile form
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  country = signal('');
  currency = signal('USD');

  // Zakat preferences
  nisabBasis = signal('silver');
  calendarType = signal('lunar');
  zakatAnniversary = signal('');

  // State
  profileLoading = signal(true);
  profileSaving = signal(false);
  profileMessage = signal('');
  profileError = signal('');

  // Password
  showPasswordForm = signal(false);

  // Delete
  showDeleteConfirm = signal(false);

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

  currencies = [
    'USD','CAD','GBP','EUR','AED','SAR','MYR','PKR','INR',
    'BDT','IDR','TRY','EGP','NGN','AUD','SEK','SGD','ZAR'
  ];

  ngOnInit(): void {
    this.email.set(this.authService.getUserEmail() || '');
    this.authService.getProfile().subscribe({
      next: (profile) => {
        if (profile.success) {
          this.firstName.set(profile.firstName || '');
          this.lastName.set(profile.lastName || '');
          this.country.set(profile.country || '');
          this.currency.set(profile.currency || 'USD');
          this.nisabBasis.set(profile.nisabBasis || 'silver');
          this.calendarType.set(profile.calendarType || 'lunar');
          this.zakatAnniversary.set(profile.zakatAnniversary || '');
        }
        this.profileLoading.set(false);
      },
      error: () => {
        this.profileLoading.set(false);
        this.profileError.set('Failed to load profile');
      }
    });
  }

  onCountryChange(code: string): void {
    this.country.set(code);
    const match = this.countries.find(c => c.code === code);
    if (match) {
      this.currency.set(match.currency);
    }
  }

  saveProfile(): void {
    const first = this.firstName().trim();
    const last = this.lastName().trim();

    if (!first || !last) {
      this.profileError.set('First name and last name are required');
      return;
    }

    if (first.length > 50 || last.length > 50) {
      this.profileError.set('Name must be 50 characters or less');
      return;
    }

    if (!this.country()) {
      this.profileError.set('Please select a country');
      return;
    }

    this.profileSaving.set(true);
    this.profileError.set('');
    this.profileMessage.set('');

    this.authService.updateProfile({
      firstName: first,
      lastName: last,
      country: this.country(),
      currency: this.currency(),
      nisabBasis: this.nisabBasis(),
      calendarType: this.calendarType(),
      zakatAnniversary: this.zakatAnniversary() || null
    }).subscribe({
      next: (response) => {
        this.profileSaving.set(false);
        if (response.success) {
          this.profileMessage.set('Profile updated');
          setTimeout(() => this.profileMessage.set(''), 3000);
        } else {
          this.profileError.set(response.message);
        }
      },
      error: () => {
        this.profileSaving.set(false);
        this.profileError.set('Failed to update profile');
      }
    });
  }

  changePassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
