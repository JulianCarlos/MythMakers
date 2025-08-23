import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth-interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { BASE_PATH } from './api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideClientHydration(), provideAnimationsAsync(),
    provideHttpClient(),
    { provide: BASE_PATH, useValue: 'https://localhost:7039' },
  ],
};
