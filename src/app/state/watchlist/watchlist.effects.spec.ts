import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, firstValueFrom, of } from 'rxjs';
import { APP_STORAGE } from '../../core/tokens/storage.token';
import { WatchlistActions } from './watchlist.actions';
import { WatchlistEffects } from './watchlist.effects';
import { watchlistAdapter } from './watchlist.feature';
import { WATCHLIST_KEY } from './watchlist.model';

describe('WatchlistEffects', () => {
    let actions$: Observable<Action>;
    const storage = {
        getItem: jest.fn<(key: string) => string | null>(),
        setItem: jest.fn<(key: string, value: string) => void>(),
    };
    const items = [{ symbol: 'BTCUSDT', addedAt: 1 }];

    beforeEach(() => {
        storage.getItem.mockReset();
        storage.setItem.mockReset();
        actions$ = of();
        TestBed.configureTestingModule({
            providers: [
                WatchlistEffects,
                provideMockActions(() => actions$),
                provideMockStore({
                    initialState: { watchlist: watchlistAdapter.setAll(items, watchlistAdapter.getInitialState()) },
                }),
                { provide: APP_STORAGE, useValue: storage },
            ],
        });
    });

    it('hydrates from storage on startup', async () => {
        storage.getItem.mockReturnValue(JSON.stringify(items));
        const effects = TestBed.inject(WatchlistEffects);

        await expect(firstValueFrom(effects.hydrate$)).resolves.toEqual(WatchlistActions.hydrated({ items }));
    });

    it('persists the list after a toggle', () => {
        actions$ = of(WatchlistActions.symbolToggled({ symbol: 'BTCUSDT', at: 1 }));
        TestBed.inject(WatchlistEffects).persist$.subscribe();

        expect(storage.setItem).toHaveBeenCalledWith(WATCHLIST_KEY, JSON.stringify(items));
    });

    it('persists the list after a removal', () => {
        actions$ = of(WatchlistActions.symbolRemoved({ symbol: 'BTCUSDT' }));
        TestBed.inject(WatchlistEffects).persist$.subscribe();

        expect(storage.setItem).toHaveBeenCalledTimes(1);
    });

    it('does not write back when hydrating', () => {
        actions$ = of(WatchlistActions.hydrated({ items }));
        TestBed.inject(WatchlistEffects).persist$.subscribe();

        expect(storage.setItem).not.toHaveBeenCalled();
    });
});