import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-history',
  template: `
    <div class="page-container">
      <h1 class="page-title">Zakat History</h1>
      <p class="page-description">Review your past zakat calculations and payments.</p>
      <div class="placeholder-card">
        <span class="placeholder-icon" aria-hidden="true">📊</span>
        <p>History tracking coming soon...</p>
      </div>
    </div>
  `,
  styleUrl: './history.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class History {}
