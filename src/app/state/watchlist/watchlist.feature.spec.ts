import { describe, expect, it } from '@jest/globals';
import { WatchlistActions } from './watchlist.actions';
import { selectAllItems, selectSymbols, selectWatchlistCount, watchlistFeature } from './watchlist.feature';

const { reducer } = watchlistFeature;
const hydrated = (items: { symbol: string; addedAt: number }[]) =>
    reducer(undefined, WatchlistActions.hydrated({ items }));

describe('watchlist feature', () => {
    it('starts empty', () => {
        const state = reducer(undefined, { type: '@@init' });
        expect(state.ids).toEqual([]);
    });

    it('hydrates and keeps items sorted by addedAt', () => {
        const state = hydrated([
            { symbol: 'ETHUSDT', addedAt: 2 },
            { symbol: 'BTCUSDT', addedAt: 1 },
        ]);
        expect(state.ids).toEqual(['BTCUSDT', 'ETHUSDT']);
    });

    it('toggle adds a missing symbol with the given timestamp', () => {
        const state = reducer(hydrated([]), WatchlistActions.symbolToggled({ symbol: 'XRPUSDT', at: 99 }));
        expect(state.entities['XRPUSDT']).toEqual({ symbol: 'XRPUSDT', addedAt: 99 });
    });

    it('toggle removes a symbol that is already watched', () => {
        const start = hydrated([{ symbol: 'BTCUSDT', addedAt: 1 }]);
        const state = reducer(start, WatchlistActions.symbolToggled({ symbol: 'BTCUSDT', at: 5 }));
        expect(state.ids).toEqual([]);
    });

    it('remove deletes a symbol and ignores unknown ones', () => {
        const start = hydrated([{ symbol: 'BTCUSDT', addedAt: 1 }]);
        expect(reducer(start, WatchlistActions.symbolRemoved({ symbol: 'BTCUSDT' })).ids).toEqual([]);
        expect(reducer(start, WatchlistActions.symbolRemoved({ symbol: 'NOPE' })).ids).toEqual(['BTCUSDT']);
    });

    it('exposes selectors', () => {
        const watchlist = hydrated([
            { symbol: 'BTCUSDT', addedAt: 1 },
            { symbol: 'ETHUSDT', addedAt: 2 },
        ]);
        const root = { watchlist };
        expect(selectSymbols(root)).toEqual(['BTCUSDT', 'ETHUSDT']);
        expect(selectWatchlistCount(root)).toBe(2);
        expect(selectAllItems(root)[0].symbol).toBe('BTCUSDT');
    });
});