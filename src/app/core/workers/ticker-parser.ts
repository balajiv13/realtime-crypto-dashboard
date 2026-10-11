import { BinanceStreamEnvelope, TickerData } from '../models/market-data.model';

export function parseTicker(raw: unknown): TickerData | null {
  const d = (raw as Partial<BinanceStreamEnvelope> | null)?.data;
  if (!d || d.e !== '24hrTicker') return null;

  const price = Number(d.c);
  const changePercent = Number(d.P);
  const volume = Number(d.v);
  if (![price, changePercent, volume].every(Number.isFinite)) return null;

  return {
    symbol: d.s,
    price,
    changePercent,
    volume,
    timestamp: d.E,
    isUp: changePercent >= 0, // 24h direction, not tick-to-tick
  };
}

export function buildStreamUrl(symbols: string[]): string {
  const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
  return `wss://stream.binance.com:9443/stream?streams=${streams}`;
}