import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-ask-scholar',
  template: `
    <div class="page-container">
      <h1 class="page-title">Ask a Scholar</h1>
      <p class="page-description">Get answers to your zakat-related questions.</p>
      <div class="placeholder-card">
        <span class="placeholder-icon" aria-hidden="true">💬</span>
        <p>Scholar Q&A coming soon...</p>
      </div>
    </div>
  `,
  styleUrl: './ask-scholar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AskScholar {}
