// app.routes.ts
import { Routes } from '@angular/router';
import { authMatch } from './guards/auth.match';
import { redirectLoggedIn } from './guards/redirect-logged-in.match';

import { OverviewPageComponent } from './pages/overview-page/overview-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { WorldDetailsComponent } from './components/world-details/world-details.component';

export const routes: Routes = [
  { path: 'login', title: 'Login', component: LoginPageComponent, canMatch: [redirectLoggedIn] },
  { path: 'register', title: 'Register', component: RegisterPageComponent, canMatch: [redirectLoggedIn] },
  {
    path: 'overview',
    component: OverviewPageComponent,
    canMatch: [authMatch],
    children: [
      { path: 'project/:projectId', component: ProjectDetailsComponent },
      { path: 'project/:projectId/world/:worldId', component: WorldDetailsComponent },
      { path: '', pathMatch: 'full', redirectTo: 'project/0' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
  { path: '**', redirectTo: 'overview' },
];
