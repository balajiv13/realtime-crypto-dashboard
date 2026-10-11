import { TickerBatch, TickerData } from '../models/market-data.model';

/** Merges several batches into one array, keeping the newest tick per symbol. */
export function mergeBatches(batches: TickerBatch[]): TickerData[] {
    const bySymbol = new Map<string, TickerData>();
    for (const b of batches) {
        for (const t of b.tickers) bySymbol.set(t.symbol, t); // later wins
    }
    return [...bySymbol.values()];
}