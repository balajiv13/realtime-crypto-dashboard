import { inject, Injectable } from '@angular/core';
import { WebsocketService } from './websocket';
import { BinanceTickerPayload, TickerData } from '../models/market-data.model';
import { bufferTime, filter, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarketDataService {

  private readonly wsService = inject(WebsocketService);
  private readonly binanceWsUrl = 'wss://stream.binance.com:9443/ws';

  // For example, to subscribe to the BTC/USDT ticker stream:
  // private readonly binanceWsUrl = 'wss://stream.binance.com:9443/ws/btcusdt@ticker';
  // Or for the combined - stream endpoint:
  // private readonly binanceWsUrl = 'wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker';

  public getOptimizedMarketStream(): Observable<TickerData> {

    return this.wsService.connect(this.binanceWsUrl).pipe(
      bufferTime(150),
      filter((batch: BinanceTickerPayload[]) => batch.length > 0),
      map((batch: BinanceTickerPayload[]) => this.aggregateAndNormalize(batch))
    );
  }

  private aggregateAndNormalize(batch: BinanceTickerPayload[]): TickerData {
    const uniqueMap = new Map<string, TickerData>();
    for (const item of batch) {
      if (item.e === '24hrTicker') continue;

      const price = parseFloat(item.c);
      const pct = parseFloat(item.P);

      uniqueMap.set(item.s, {
        symbol: item.s,
        price: price,
        changePercent: pct,
        volume: parseFloat(item.v),
        timestamp: item.E,
        isUp: pct >= 0
      });
    }

    // For simplicity, return the first unique item. In a real scenario, you might want to return an array or handle it differently.
    return Array.from(uniqueMap.values())[0];
  }
}
