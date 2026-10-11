import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideTickerWorker } from './core/workers/ticker-worker.provider';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { connectionFeature } from './state/connection/connection.feature';
import { ConnectionEffects } from './state/connection/connection.effects';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideTickerWorker(),
    provideStore(),
    provideState(connectionFeature),
    provideEffects(ConnectionEffects),
  ]
};
