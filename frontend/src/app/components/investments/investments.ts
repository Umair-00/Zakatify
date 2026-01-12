import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-investments',
  template: `
    <div class="page-container">
      <h1 class="page-title">Investments</h1>
      <p class="page-description">Track your stocks, funds, and other investments.</p>
      <div class="placeholder-card">
        <span class="placeholder-icon" aria-hidden="true">📈</span>
        <p>Investment tracking coming soon...</p>
      </div>
    </div>
  `,
  styleUrl: './investments.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Investments {}
