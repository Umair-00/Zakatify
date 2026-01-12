import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-settings',
  template: `
    <div class="page-container">
      <h1 class="page-title">Settings</h1>
      <p class="page-description">Configure your preferences and account settings.</p>
      <div class="placeholder-card">
        <span class="placeholder-icon" aria-hidden="true">⚙️</span>
        <p>Settings panel coming soon...</p>
      </div>
    </div>
  `,
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Settings {}
