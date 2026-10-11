/**
 * Raw JSON payLoad format emitted by the Binance public websocket stream for market data.
 * @see https://binance-docs.github.io/apidocs/spot/en/#individual-symbol-ticker-streams
 */

export interface BinanceTickerPayload {
    e: string;      //Event type (eg. "24hrTicker")
    E: number;      //Event time (eg. 123456789)
    s: string;      //Symbol (eg. "BTCUSDT")
    p: string;      //Price change (eg. "0.0015")
    P: string;      //Price change percent (eg. "250.00")
    w: string;      //Weighted average price (eg. "0.0018")
    x: string;      //Previous day's close price (eg. "0.0009")
    c: string;      //Current day's close price (eg. "0.0025")
    Q: string;      //Close trade's quantity (eg. "10")
    b: string;      //Best bid price (eg. "0.0024")
    B: string;      //Best bid quantity (eg. "10")
    a: string;      //Best ask price (eg. "0.0026")
    A: string;      //Best ask quantity (eg. "100")
    o: string;      //Open price (eg. "0.0010")
    h: string;      //High price (eg. "0.0025")
    l: string;      //Low price (eg. "0.0010")
    v: string;      //Total traded base asset volume (eg. "10000")
    q: string;      //Total traded quote asset volume (eg. "18")
    O: number;      //Statistics open time (eg. 123456789)
    C: number;      //Statistics close time (eg. 123456789)
    F: number;      //First trade ID (eg. 123456789)
    L: number;      //Last trade ID (eg. 123456789)
    n: number;      //Total number of trades (eg. 12345)
}

/**
 * Normalized UI-friendly data structure used across components and NgRx store.
 */

export interface TickerData {
    symbol: string;
    price: number;
    changePercent: number;
    volume: number;
    timestamp: number;
    isUp: boolean;
}

/** Combined-stream frames wrap the payload: { stream, data } */
export interface BinanceStreamEnvelope {
    stream: string;
    data: BinanceTickerPayload;
}

export type ConnectionStatus = 'connecting' | 'open' | 'closed';

export interface TickerBatch {
    ts: number;
    tickers: TickerData[];
}

export type WorkerIn =
    | { type: 'connect'; symbols: string[] }
    | { type: 'disconnect' };

export type WorkerOut =
    | { type: 'status'; status: ConnectionStatus }
    | { type: 'batch'; batch: TickerBatch };