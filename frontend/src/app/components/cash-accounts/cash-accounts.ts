import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-cash-accounts',
  template: `
    <div class="page-container">
      <h1 class="page-title">Cash & Accounts</h1>
      <p class="page-description">Manage your cash holdings and bank accounts.</p>
      <div class="placeholder-card">
        <span class="placeholder-icon" aria-hidden="true">💰</span>
        <p>Cash & accounts management coming soon...</p>
      </div>
    </div>
  `,
  styleUrl: './cash-accounts.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashAccounts {}
