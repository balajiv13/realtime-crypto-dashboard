import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { TickerBatch, TickerData } from '../models/market-data.model';
import { MarketDataService } from './market-data';
import { WebsocketService } from './websocket';

const tick = (symbol: string, price: number): TickerData => ({
  symbol, price, changePercent: 0, volume: 0, timestamp: 0, isUp: true,
});

const setHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('MarketDataService', () => {
  let service: MarketDataService;
  let batches: Subject<TickerBatch>;
  let fakeWs: {
    batches$: Subject<TickerBatch>['asObservable'] extends () => infer R ? R : never;
    connect: jest.Mock<(symbols: string[]) => void>;
    disconnect: jest.Mock<() => void>;
  };
  let scheduler: TestScheduler;

  beforeEach(() => {
    batches = new Subject<TickerBatch>();
    fakeWs = {
      batches$: batches.asObservable(),
      connect: jest.fn<(symbols: string[]) => void>(),
      disconnect: jest.fn<() => void>(),
    };
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    TestBed.configureTestingModule({
      providers: [{ provide: WebsocketService, useValue: fakeWs }],
    });
    service = TestBed.inject(MarketDataService);
    scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  describe('lifecycle', () => {
    it('start() connects with the default symbols', () => {
      service.start();
      expect(fakeWs.connect).toHaveBeenCalledWith(['BTCUSDT', 'ETHUSDT', 'SOLUSDT']);
    });

    it('start(symbols) connects with the given symbols', () => {
      service.start(['XRPUSDT']);
      expect(fakeWs.connect).toHaveBeenCalledWith(['XRPUSDT']);
    });

    it('stop() disconnects', () => {
      service.stop();
      expect(fakeWs.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
  it('ignores batches while the tab is hidden and resumes when visible', () => {
    const received: TickerData[][] = [];
    const sub = service.getOptimizedMarketStream().subscribe(v => received.push(v));

    batches.next({ ts: 1, tickers: [tick('BTCUSDT', 1)] });
    setHidden(true);
    batches.next({ ts: 2, tickers: [tick('BTCUSDT', 2)] });   // dropped
    setHidden(false);
    batches.next({ ts: 3, tickers: [tick('BTCUSDT', 3)] });

    expect(received).toEqual([[tick('BTCUSDT', 1)], [tick('BTCUSDT', 3)]]);
    sub.unsubscribe();
  });
  describe('getOptimizedMarketStream', () => {
    it('passes each batch straight through at the default 1s rate', () => {
      const received: TickerData[][] = [];
      const sub = service.getOptimizedMarketStream().subscribe(v => received.push(v));

      batches.next({ ts: 1, tickers: [tick('BTCUSDT', 1)] });
      batches.next({ ts: 2, tickers: [tick('ETHUSDT', 5)] });

      expect(received).toEqual([[tick('BTCUSDT', 1)], [tick('ETHUSDT', 5)]]);
      sub.unsubscribe();
    });

    it('at 5s, buffers batches and emits one merged array (newest tick per symbol)', () => {
      scheduler.run(({ cold, expectObservable }) => {
        const b1: TickerBatch = { ts: 1, tickers: [tick('BTCUSDT', 1), tick('ETHUSDT', 5)] };
        const b2: TickerBatch = { ts: 2, tickers: [tick('BTCUSDT', 2)] };

        // a at 1000ms, b at 2000ms, source completes at 5001ms
        fakeWs.batches$ = cold('1s a 999ms b 3s |', { a: b1, b: b2 });
        service.setRefreshRate(5000);

        expectObservable(service.getOptimizedMarketStream()).toBe('5s x', {
          x: [tick('BTCUSDT', 2), tick('ETHUSDT', 5)],
        });
      });
    });
  });
});