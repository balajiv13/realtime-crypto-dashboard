import { TestBed } from '@angular/core/testing';
import type { Mocked } from 'jest-mock';
import { jest } from '@jest/globals';
import { MarketDataService } from './market-data';
import { WebsocketService } from './websocket';
import { connect, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { BinanceTickerPayload } from '../models/market-data.model';

describe('MarketDataService - Ingestion & Backpressure Layer', () => {
  let service: MarketDataService;
  let mockWebsocketService: jest.Mocked<WebsocketService>;
  let wsStream$: Subject<any>;
  let testScheduler: TestScheduler;
  let mockWsService: any;

  //Mock payload generator

  const createMockPayload = (symbol: string, price: string): BinanceTickerPayload => ({
    e: '24hrTicker',
    E: 17000000000000,
    s: symbol,
    p: '1.5',
    P: '2.5',
    c: price,
    q: '500',
    w: '',
    x: '',
    Q: '',
    b: '',
    B: '',
    a: '',
    A: '',
    o: '',
    h: '',
    l: '',
    v: '',
    O: 0,
    C: 0,
    F: 0,
    L: 0,
    n: 0
  });

  beforeEach(() => {

    wsStream$ = new Subject<any>();

    mockWsService = {
      connect: jest.fn().mockReturnValue(wsStream$.asObservable()),
      disconnect: jest.fn()
    } as any;
    TestBed.configureTestingModule({
      providers: [
        MarketDataService,
        { provide: WebsocketService, useValue: mockWsService }
      ]
    });
    service = TestBed.inject(MarketDataService);
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should be created', () => {
    testScheduler.run(({ cold, expectObservable }) => {

      const rawPayloads = {
        a: createMockPayload('BTCUSDT', '95000'),
        b: createMockPayload('ETHUSDT', '95100'),
        c: createMockPayload('BTCUSDT', '2700'),
      };

      const source$ = cold('a 149ms b 1ms c', rawPayloads);
      mockWsService.connect.mockReturnValue(source$);

      const optimizedStream$ = service.getOptimizedMarketStream();

      expectObservable(optimizedStream$).toBe('150ms x 149ms y', {
        x: {
          symbol: 'BTCUSDT',
          price: 95000,
          changePercent: 2.5,
          volume: 0,
          timestamp: 17000000000000,
          isUp: true
        },
        y: {
          symbol: 'ETHUSDT',
          price: 95100,
          changePercent: 2.5,
          volume: 0,
          timestamp: 17000000000000,
          isUp: true
        }
      });
    }
    )
    expect(service).toBeTruthy();
  });
});
