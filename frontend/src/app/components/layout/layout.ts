import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth';
import { IdleService } from '../../services/idle';
import { NAV_SECTIONS, NavSection } from '../../models/navigation';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive]
})
export class Layout implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private idleService = inject(IdleService);
  private idleSub: Subscription | null = null;

  navSections = signal<NavSection[]>(NAV_SECTIONS);
  userEmail = signal<string | null>(this.authService.getUserEmail());
  userFullName = signal<string | null>(this.authService.getUserName());
  showIdleWarning = signal(false);

  userName = computed(() => {
    const fullName = this.userFullName();
    if (fullName) return fullName;
    const email = this.userEmail();
    if (!email) return 'User';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  });

  userInitials = computed(() => {
    const fullName = this.userFullName();
    if (fullName) {
      const parts = fullName.split(' ');
      return parts.map(p => p.charAt(0).toUpperCase()).join('');
    }
    const name = this.userName();
    return name.charAt(0).toUpperCase();
  });

  ngOnInit(): void {
    this.idleService.start();
    this.idleSub = this.idleService.showWarning$.subscribe(show => {
      this.showIdleWarning.set(show);
    });
  }

  ngOnDestroy(): void {
    this.idleService.stop();
    this.idleSub?.unsubscribe();
  }

  onStayLoggedIn(): void {
    this.idleService.stayLoggedIn();
  }

  onLogout(): void {
    this.idleService.stop();
    this.authService.logout();
  }
}
