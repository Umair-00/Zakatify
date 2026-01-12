import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { Layout } from './components/layout/layout';
import { Dashboard } from './components/dashboard/dashboard';
import { Calculate } from './components/calculate/calculate';
import { History } from './components/history/history';
import { CashAccounts } from './components/cash-accounts/cash-accounts';
import { Jewelry } from './components/jewelry/jewelry';
import { Investments } from './components/investments/investments';
import { Business } from './components/business/business';
import { AskScholar } from './components/ask-scholar/ask-scholar';
import { Settings } from './components/settings/settings';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'calculate', component: Calculate },
      { path: 'history', component: History },
      { path: 'cash-accounts', component: CashAccounts },
      { path: 'jewelry', component: Jewelry },
      { path: 'investments', component: Investments },
      { path: 'business', component: Business },
      { path: 'ask-scholar', component: AskScholar },
      { path: 'settings', component: Settings }
    ]
  },
  // Keep legacy route for backwards compatibility
  { path: 'landing', redirectTo: '/dashboard', pathMatch: 'full' }
];
