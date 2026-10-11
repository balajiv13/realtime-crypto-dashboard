import { AppStorage } from '../../core/tokens/storage.token';

export interface WatchlistItem {
    symbol: string;
    addedAt: number;
}

export const WATCHLIST_KEY = 'pulse.watchlist';
export const MAX_WATCHLIST = 50;
const SYMBOL_PATTERN = /^[A-Z0-9]{3,20}$/;

export const DEFAULT_WATCHLIST: WatchlistItem[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'].map(
    (symbol, index) => ({ symbol, addedAt: index }),
);

/** Never trust persisted data: validate, dedupe, cap. */
export function readWatchlist(storage: Pick<AppStorage, 'getItem'>): WatchlistItem[] {
    try {
        const raw = storage.getItem(WATCHLIST_KEY);
        if (raw === null) return DEFAULT_WATCHLIST; // first run
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return DEFAULT_WATCHLIST;

        const seen = new Set<string>();
        const items: WatchlistItem[] = [];
        parsed.forEach((entry, index) => {
            const candidate = entry as Partial<WatchlistItem> | null;
            const symbol = candidate?.symbol;
            if (typeof symbol !== 'string' || !SYMBOL_PATTERN.test(symbol) || seen.has(symbol)) return;
            seen.add(symbol);
            items.push({
                symbol,
                addedAt: Number.isFinite(candidate?.addedAt) ? (candidate!.addedAt as number) : index,
            });
        });

        // Data existed but none of it was usable: treat as corrupt, not as "user emptied it".
        if (parsed.length > 0 && items.length === 0) return DEFAULT_WATCHLIST;
        return items.slice(0, MAX_WATCHLIST);
    } catch {
        return DEFAULT_WATCHLIST;
    }
}