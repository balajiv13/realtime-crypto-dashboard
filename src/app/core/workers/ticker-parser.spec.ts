import { describe, it, expect } from '@jest/globals';
import { buildStreamUrl, parseTicker } from './ticker-parser';

const frame = (over: Record<string, unknown> = {}) => ({
    stream: 'btcusdt@ticker',
    data: { e: '24hrTicker', E: 1, s: 'BTCUSDT', c: '65000.5', P: '2.5', v: '120', ...over },
});

describe('parseTicker', () => {
    it('maps a valid frame', () => {
        expect(parseTicker(frame())).toEqual({
            symbol: 'BTCUSDT', price: 65000.5, changePercent: 2.5,
            volume: 120, timestamp: 1, isUp: true,
        });
    });

    it('flags a negative 24h change as down', () => {
        expect(parseTicker(frame({ P: '-1.2' }))?.isUp).toBe(false);
    });

    it('rejects junk', () => {
        expect(parseTicker(frame({ e: 'trade' }))).toBeNull();
        expect(parseTicker(frame({ c: 'abc' }))).toBeNull();
        expect(parseTicker(null)).toBeNull();
        expect(parseTicker({})).toBeNull();
    });
});

describe('buildStreamUrl', () => {
    it('lowercases and joins streams', () => {
        expect(buildStreamUrl(['BTCUSDT', 'ETHUSDT']))
            .toContain('streams=btcusdt@ticker/ethusdt@ticker');
    });
});