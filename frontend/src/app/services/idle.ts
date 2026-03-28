import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class IdleService {
  private readonly IDLE_TIMEOUT = 29 * 60 * 1000;   // 29 min → show warning
  private readonly LOGOUT_TIMEOUT = 60 * 1000;       // 60 sec after warning → logout
  private readonly THROTTLE_MS = 30_000;              // only reset timer every 30s

  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private logoutTimer: ReturnType<typeof setTimeout> | null = null;
  private lastReset = 0;
  private running = false;

  showWarning$ = new Subject<boolean>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;

    this.resetIdleTimer();

    // Run event listeners outside Angular zone to avoid triggering change detection
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.onActivity);
      document.addEventListener('click', this.onActivity);
      document.addEventListener('keydown', this.onActivity);
      document.addEventListener('scroll', this.onActivity);
    });
  }

  stop(): void {
    this.running = false;
    this.clearTimers();
    this.showWarning$.next(false);

    document.removeEventListener('mousemove', this.onActivity);
    document.removeEventListener('click', this.onActivity);
    document.removeEventListener('keydown', this.onActivity);
    document.removeEventListener('scroll', this.onActivity);
  }

  stayLoggedIn(): void {
    this.showWarning$.next(false);
    this.clearLogoutTimer();
    this.resetIdleTimer();
  }

  private onActivity = (): void => {
    const now = Date.now();
    if (now - this.lastReset < this.THROTTLE_MS) return;
    this.lastReset = now;

    // If warning is showing, dismiss it on activity
    if (this.logoutTimer) {
      this.ngZone.run(() => this.stayLoggedIn());
      return;
    }

    this.resetIdleTimer();
  };

  private resetIdleTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);

    this.idleTimer = setTimeout(() => {
      this.ngZone.run(() => {
        this.showWarning$.next(true);
        this.startLogoutCountdown();
      });
    }, this.IDLE_TIMEOUT);
  }

  private startLogoutCountdown(): void {
    this.logoutTimer = setTimeout(() => {
      this.ngZone.run(() => {
        this.stop();
        this.authService.logout();
        this.router.navigate(['/login'], {
          queryParams: { reason: 'idle' }
        });
      });
    }, this.LOGOUT_TIMEOUT);
  }

  private clearLogoutTimer(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  private clearTimers(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.clearLogoutTimer();
  }
}
