import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideTickerWorker } from './core/workers/ticker-worker.provider';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { provideEffects } from '@ngrx/effects';
import { connectionFeature } from './state/connection/connection.feature';
import { ConnectionEffects } from './state/connection/connection.effects';
import { preferencesFeature } from './state/preferences/preferences.feature';
import { PreferencesEffects } from './state/preferences/preferences.effects';
import { WatchlistEffects } from './state/watchlist/watchlist.effects';
import { watchlistFeature } from './state/watchlist/watchlist.feature';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideTickerWorker(),
    provideStore(),
    provideState(connectionFeature),
    provideState(preferencesFeature),
    provideState(watchlistFeature),
    provideEffects(ConnectionEffects, PreferencesEffects, WatchlistEffects),
    provideStoreDevtools({
      name: 'Pulse Dashboard',
      maxAge: 50,
      logOnly: true,
      actionsBlocklist: ['[Connection] Batch Received'],
    }),
  ]
};
// function provideStoreDevtools(arg0: { name: string; maxAge: number; logOnly: boolean; actionsBlocklist: string[]; }): import("@angular/core").Provider | import("@angular/core").EnvironmentProviders {
//   throw new Error('Function not implemented.');
// }

