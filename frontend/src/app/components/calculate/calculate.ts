import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-calculate',
  template: `
    <div class="page-container">
      <h1 class="page-title">Calculate Zakat</h1>
      <p class="page-description">Start your guided zakat calculation wizard.</p>
      <div class="placeholder-card">
        <span class="placeholder-icon" aria-hidden="true">🧮</span>
        <p>Calculation wizard coming soon...</p>
      </div>
    </div>
  `,
  styleUrl: './calculate.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Calculate {}
