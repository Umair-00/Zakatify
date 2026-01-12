import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth';
import { NAV_SECTIONS, NavSection } from '../../models/navigation';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive]
})
export class Layout {
  private authService = inject(AuthService);

  navSections = signal<NavSection[]>(NAV_SECTIONS);
  userEmail = signal<string | null>(this.authService.getUserEmail());

  userName = computed(() => {
    const email = this.userEmail();
    if (!email) return 'User';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  });

  userInitials = computed(() => {
    const name = this.userName();
    return name.charAt(0).toUpperCase();
  });

  onLogout(): void {
    this.authService.logout();
  }
}
