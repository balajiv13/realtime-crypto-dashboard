import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { WatchlistActions } from './watchlist.actions';
import { WatchlistItem } from './watchlist.model';

export type WatchlistState = EntityState<WatchlistItem>;

export const watchlistAdapter = createEntityAdapter<WatchlistItem>({
    selectId: (item) => item.symbol,
    sortComparer: (a, b) => a.addedAt - b.addedAt,
});

export const watchlistFeature = createFeature({
    name: 'watchlist',
    reducer: createReducer(
        watchlistAdapter.getInitialState(),
        on(WatchlistActions.hydrated, (state, { items }) => watchlistAdapter.setAll(items, state)),
        on(WatchlistActions.symbolToggled, (state, { symbol, at }) =>
            state.entities[symbol]
                ? watchlistAdapter.removeOne(symbol, state)
                : watchlistAdapter.addOne({ symbol, addedAt: at }, state),
        ),
        on(WatchlistActions.symbolRemoved, (state, { symbol }) => watchlistAdapter.removeOne(symbol, state)),
    ),
    extraSelectors: ({ selectWatchlistState }) => {
        const { selectAll, selectTotal } = watchlistAdapter.getSelectors(selectWatchlistState);
        return {
            selectAllItems: selectAll,
            selectWatchlistCount: selectTotal,
            selectSymbols: createSelector(selectAll, (items) => items.map((item) => item.symbol)),
        };
    },
});

export const { selectWatchlistState, selectAllItems, selectSymbols, selectWatchlistCount } = watchlistFeature;