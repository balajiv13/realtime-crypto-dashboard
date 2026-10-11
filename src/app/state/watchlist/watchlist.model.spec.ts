import { describe, expect, it } from '@jest/globals';
import { DEFAULT_WATCHLIST, MAX_WATCHLIST, WATCHLIST_KEY, readWatchlist } from './watchlist.model';

const storageWith = (value: string | null) => ({
    getItem: (key: string) => (key === WATCHLIST_KEY ? value : null),
});

describe('readWatchlist', () => {
    it('seeds defaults on first run', () => {
        expect(readWatchlist(storageWith(null))).toEqual(DEFAULT_WATCHLIST);
    });

    it('respects an explicitly emptied list', () => {
        expect(readWatchlist(storageWith('[]'))).toEqual([]);
    });

    it('reads valid items', () => {
        const items = [{ symbol: 'BTCUSDT', addedAt: 5 }];
        expect(readWatchlist(storageWith(JSON.stringify(items)))).toEqual(items);
    });

    it('drops invalid symbols and duplicates, and fills missing addedAt from the index', () => {
        const raw = JSON.stringify([
            { symbol: 'BTCUSDT' },
            { symbol: 'BTCUSDT', addedAt: 3 },
            { symbol: 'bad!' },
            { symbol: 42 },
            null,
            { symbol: 'ETHUSDT', addedAt: 9 },
        ]);
        expect(readWatchlist(storageWith(raw))).toEqual([
            { symbol: 'BTCUSDT', addedAt: 0 },
            { symbol: 'ETHUSDT', addedAt: 9 },
        ]);
    });

    it('caps the list size', () => {
        const many = Array.from({ length: MAX_WATCHLIST + 10 }, (_, i) => ({ symbol: `COIN${i}`, addedAt: i }));
        expect(readWatchlist(storageWith(JSON.stringify(many)))).toHaveLength(MAX_WATCHLIST);
    });

    it('falls back to defaults for corrupt data', () => {
        expect(readWatchlist(storageWith('{not json'))).toEqual(DEFAULT_WATCHLIST);
        expect(readWatchlist(storageWith('{"a":1}'))).toEqual(DEFAULT_WATCHLIST);
        expect(readWatchlist(storageWith('[{"symbol":"bad!"}]'))).toEqual(DEFAULT_WATCHLIST);
    });

    it('survives storage throwing', () => {
        expect(readWatchlist({ getItem: () => { throw new Error('denied'); } })).toEqual(DEFAULT_WATCHLIST);
    });
});