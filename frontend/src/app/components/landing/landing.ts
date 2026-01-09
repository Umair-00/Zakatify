import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  userEmail: string | null = '';

  constructor(private authService: AuthService) {
    this.userEmail = this.authService.getUserEmail();
  }

  onLogout(): void {
    this.authService.logout();
  }
}