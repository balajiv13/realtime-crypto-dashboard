import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { TickerData } from '../../../core/models/market-data.model';
import { DashboardStore } from './dashboard.store';
import { MarketDataService } from '../../../core/services/market-data';

const tick = (symbol: string, price: number, changePercent = 0): TickerData => ({
    symbol, price, changePercent, volume: 0, timestamp: 0, isUp: changePercent >= 0,
});

describe('DashboardStore', () => {
    let batches$: Subject<TickerData[]>;
    let fakeMarket: {
        getOptimizedMarketStream: () => ReturnType<Subject<TickerData[]>['asObservable']>;
        start: jest.Mock<() => void>;
        setRefreshRate: jest.Mock<(ms: number) => void>;
    };
    let store: InstanceType<typeof DashboardStore>;

    beforeEach(() => {
        batches$ = new Subject<TickerData[]>();
        fakeMarket = {
            getOptimizedMarketStream: () => batches$.asObservable(),
            start: jest.fn<() => void>(),
            setRefreshRate: jest.fn<(ms: number) => void>(),
        };
        TestBed.configureTestingModule({
            providers: [{ provide: MarketDataService, useValue: fakeMarket }],
        });
        store = TestBed.inject(DashboardStore); // onInit runs initStream
    });

    it('starts loading and kicks off the feed', () => {
        expect(store.loading()).toBe(true);
        expect(fakeMarket.start).toHaveBeenCalledTimes(1);
    });

    it('upserts batches by symbol and stops loading', () => {
        batches$.next([tick('BTCUSDT', 1), tick('ETHUSDT', 5)]);
        batches$.next([tick('BTCUSDT', 2)]);

        expect(store.count()).toBe(2);
        expect(store.entityMap()['BTCUSDT'].price).toBe(2);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
    });

    it('computes top gainer and loser', () => {
        batches$.next([tick('BTCUSDT', 1, 2.5), tick('ETHUSDT', 1, -4), tick('SOLUSDT', 1, 0.5)]);
        expect(store.topGainer()?.symbol).toBe('BTCUSDT');
        expect(store.topLoser()?.symbol).toBe('ETHUSDT');
    });

    it('resolves the selected ticker', () => {
        batches$.next([tick('BTCUSDT', 9)]);
        store.selectSymbol('BTCUSDT');
        expect(store.selected()?.price).toBe(9);
        store.selectSymbol(null);
        expect(store.selected()).toBeNull();
    });

    it('delegates refresh rate to the service and records it', () => {
        store.setRefreshRate(5000);
        expect(fakeMarket.setRefreshRate).toHaveBeenCalledWith(5000);
        expect(store.refreshMs()).toBe(5000);
    });

    it('sets an error state if the stream fails', () => {
        batches$.error(new Error('boom'));
        expect(store.loading()).toBe(false);
        expect(store.error()).toContain('Failed');
    });
});