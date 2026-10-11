import { inject, Injectable } from '@angular/core';
import { WebsocketService } from './websocket';
import { BinanceTickerPayload, TickerData } from '../models/market-data.model';
import { BehaviorSubject, bufferTime, distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs';
import { mergeBatches } from '../utils/merge-batches';

@Injectable({
  providedIn: 'root',
})
export class MarketDataService {

  private readonly wsService = inject(WebsocketService);
  // private readonly binanceWsUrl = 'wss://stream.binance.com:9443/ws';
  private readonly defaultSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
  private readonly refreshMs$ = new BehaviorSubject<number>(1000);

  start(symbols: string[] = this.defaultSymbols): void {
    this.wsService.connect(symbols);
  }

  stop(): void {
    this.wsService.disconnect();
  }

  // For example, to subscribe to the BTC/USDT ticker stream:
  // private readonly binanceWsUrl = 'wss://stream.binance.com:9443/ws/btcusdt@ticker';
  // Or for the combined - stream endpoint:
  // private readonly binanceWsUrl = 'wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker';

  // start(symbols: string[]) { this.wsService.connect(symbols); }
  //   getOptimizedMarketStream() { return this.ws.batches$.pipe(map(b => b.tickers)); }
  // }

  setRefreshRate(ms: number): void {
    this.refreshMs$.next(ms);
  }

  getOptimizedMarketStream(): Observable<TickerData[]> {
    return this.refreshMs$.pipe(
      distinctUntilChanged(),
      switchMap(ms =>
        ms <= 1000
          ? this.wsService.batches$.pipe(map(b => b.tickers))
          : this.wsService.batches$.pipe(
              bufferTime(ms),
              filter(batches => batches.length > 0),
              map(mergeBatches),
            ),
      ),
    );
  }

  // private aggregateAndNormalize(batch: BinanceTickerPayload[]): TickerData {
  //   const uniqueMap = new Map<string, TickerData>();
  //   for (const item of batch) {
  //     if (item.e === '24hrTicker') continue;

  //     const price = parseFloat(item.c);
  //     const pct = parseFloat(item.P);

  //     uniqueMap.set(item.s, {
  //       symbol: item.s,
  //       price: price,
  //       changePercent: pct,
  //       volume: parseFloat(item.v),
  //       timestamp: item.E,
  //       isUp: pct >= 0
  //     });
  //   }

  //   // For simplicity, return the first unique item. In a real scenario, you might want to return an array or handle it differently.
  //   return Array.from(uniqueMap.values())[0];
  // }
}
