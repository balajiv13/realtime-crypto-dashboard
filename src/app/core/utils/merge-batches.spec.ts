import { describe, expect, it } from '@jest/globals';
import { TickerData } from '../models/market-data.model';
import { mergeBatches } from './merge-batches';

const t = (symbol: string, price: number): TickerData =>
    ({ symbol, price, changePercent: 0, volume: 0, timestamp: 0, isUp: true });

describe('mergeBatches', () => {
    it('keeps the latest tick per symbol across batches', () => {
        const out = mergeBatches([
            { ts: 1, tickers: [t('BTCUSDT', 1), t('ETHUSDT', 5)] },
            { ts: 2, tickers: [t('BTCUSDT', 2)] },
        ]);
        expect(out).toHaveLength(2);
        expect(out.find(x => x.symbol === 'BTCUSDT')!.price).toBe(2);
        expect(out.find(x => x.symbol === 'ETHUSDT')!.price).toBe(5);
    });

    it('returns an empty array for no batches', () => {
        expect(mergeBatches([])).toEqual([]);
    });
});