import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Landing } from './components/landing/landing';
import { Signup } from './components/signup/signup';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
 // { path: '', redirectTo: '/login', pathMatch: 'full' }, routes user to login by default
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'landing', component: Landing, canActivate: [authGuard] }
];