import { Routes } from '@angular/router';
import { authMatch } from './guards/auth.match';
import { redirectLoggedIn } from './guards/redirect-logged-in.match';

// Standalone components with external templates/styles
import { OverviewPageComponent } from './pages/overview-page/overview-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';

export const routes: Routes = [
  { path: 'login', title: 'Login', component: LoginPageComponent, canMatch: [redirectLoggedIn] },
  { path: 'register', title: 'Register', component: RegisterPageComponent, canMatch: [redirectLoggedIn] },
  { path: 'overview', title: 'Overview', component: OverviewPageComponent, canMatch: [authMatch] },
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
  { path: '**', redirectTo: 'overview' },
];
