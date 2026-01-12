import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-jewelry',
  template: `
    <div class="page-container">
      <h1 class="page-title">Jewelry</h1>
      <p class="page-description">Track your gold, silver, and other jewelry items.</p>
      <div class="placeholder-card">
        <span class="placeholder-icon" aria-hidden="true">💎</span>
        <p>Jewelry management coming soon...</p>
      </div>
    </div>
  `,
  styleUrl: './jewelry.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Jewelry {}
