import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { ApiConfiguration } from '@api/api-configuration';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { environment } from 'environments/environment';
import { reducer } from 'store/reducers/project.reducer';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth-interceptor';
import { ProjectEffects } from 'store/effects/project.effect';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(),
    { provide: ApiConfiguration, useValue: { rootUrl: environment.apiUrl } },
    provideStore(),
    provideState({ name: 'projects', reducer: reducer }),
    provideEffects(ProjectEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
],
};
