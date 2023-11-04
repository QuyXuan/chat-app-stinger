/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

(window as any).process = {
  env: { DEBUG: undefined },
};

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));