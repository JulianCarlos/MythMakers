// app.routes.ts
import { Routes } from '@angular/router';
import { authMatch } from './guards/auth.match';
import { redirectLoggedIn } from './guards/redirect-logged-in.match';

import { OverviewPageComponent } from './pages/overview-page/overview-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { WorldDetailsComponent } from './components/world-details/world-details.component';
import { CityDetailsComponent } from './components/city-details/city-details.component';
import { CharacterDetailsComponent } from './components/character-details/character-details.component';
import { CountryDetailsComponent } from './components/country-details/country-details.component';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Login',
    component: LoginPageComponent,
    canMatch: [redirectLoggedIn],
  },
  {
    path: 'register',
    title: 'Register',
    component: RegisterPageComponent,
    canMatch: [redirectLoggedIn],
  },
  {
    path: 'overview',
    component: OverviewPageComponent,
    canMatch: [authMatch],
    children: [
      {
        path: 'project/:projectId',
        children: [
          { path: '', component: ProjectDetailsComponent },
          { path: 'world/:worldId', component: WorldDetailsComponent },
          { path: 'country/:countryId', component: CountryDetailsComponent },
          { path: 'city/:cityId', component: CityDetailsComponent },
          { path: 'character/:characterId', component: CharacterDetailsComponent },
        ],
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
  { path: '**', redirectTo: 'overview' },
];
