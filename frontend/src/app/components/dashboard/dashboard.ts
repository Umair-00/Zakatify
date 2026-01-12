import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
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
export class Dashboard {
  private authService = inject(AuthService);
  private router = inject(Router);

  stats = signal<DashboardStats>(MOCK_DASHBOARD_STATS);
  calculationSteps = signal<CalculationStep[]>(CALCULATION_STEPS);

  userName = computed(() => {
    const email = this.authService.getUserEmail();
    if (!email) return 'User';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  });

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
