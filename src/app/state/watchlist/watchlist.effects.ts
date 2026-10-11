import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { defer, of, tap, withLatestFrom } from 'rxjs';
import { APP_STORAGE } from '../../core/tokens/storage.token';
import { WatchlistActions } from './watchlist.actions';
import { selectAllItems } from './watchlist.feature';
import { WATCHLIST_KEY, readWatchlist } from './watchlist.model';

@Injectable()
export class WatchlistEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly storage = inject(APP_STORAGE);

  readonly hydrate$ = createEffect(() =>
    defer(() => of(WatchlistActions.hydrated({ items: readWatchlist(this.storage) }))),
  );

  readonly persist$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(WatchlistActions.symbolToggled, WatchlistActions.symbolRemoved),
        withLatestFrom(this.store.select(selectAllItems)),
        tap(([, items]) => this.storage.setItem(WATCHLIST_KEY, JSON.stringify(items))),
      ),
    { dispatch: false },
  );
}