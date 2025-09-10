import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideTranslateService,
  TranslateFakeLoader,
  TranslateLoader,
} from '@ngx-translate/core';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SelfieTheme } from '../../public/selfie-theme';
import { TRANSLATIONS } from '../types/translations';
import { Observable, of } from 'rxjs';
import { TimeMachineService } from './service/time-machine.service';

export class CustomTranslateLoader implements TranslateLoader {
  constructor() {}
  getTranslation(lang: string): Observable<any> {
    //@ts-ignore
    return of(TRANSLATIONS[lang] || {});
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslateService({
      defaultLanguage: 'it',
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
      },
    }),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: SelfieTheme,
        options: {
          darkModeSelector: '.selfie-dark',
        },
      },
    }),
  ],
};
