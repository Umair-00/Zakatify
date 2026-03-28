import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '../../services/auth';
import {
  DashboardStats,
  CalculationStep,
  CALCULATION_STEPS,
  MOCK_DASHBOARD_STATS
} from '../../models/dashboard';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe]
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  stats = signal<DashboardStats>(MOCK_DASHBOARD_STATS);
  calculationSteps = signal<CalculationStep[]>(CALCULATION_STEPS);
  userFirstName = signal<string>('');

  userName = computed(() => {
    const firstName = this.userFirstName();
    if (firstName) return firstName;
    const email = this.authService.getUserEmail();
    if (!email) return 'User';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  });

  ngOnInit(): void {
    const cached = this.authService.getUserName();
    if (cached) {
      this.userFirstName.set(cached.split(' ')[0]);
    } else {
      this.authService.getProfile().subscribe({
        next: (profile) => {
          if (profile.success && profile.firstName) {
            this.userFirstName.set(profile.firstName);
          }
        }
      });
    }
  }

  calculationProgress = computed(() => {
    const steps = this.calculationSteps();
    const completed = steps.filter(s => s.completed).length;
    return Math.round((completed / steps.length) * 100);
  });

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  continueCalculation(): void {
    this.router.navigate(['/calculate']);
  }

  manageJewelry(): void {
    this.router.navigate(['/jewelry']);
  }
}
