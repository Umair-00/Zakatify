import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-business',
  template: `
    <div class="page-container">
      <h1 class="page-title">Business Assets</h1>
      <p class="page-description">Manage your business inventory and assets.</p>
      <div class="placeholder-card">
        <span class="placeholder-icon" aria-hidden="true">🏢</span>
        <p>Business asset tracking coming soon...</p>
      </div>
    </div>
  `,
  styleUrl: './business.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Business {}
