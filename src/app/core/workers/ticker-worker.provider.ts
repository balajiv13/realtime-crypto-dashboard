import { Provider } from '@angular/core';
import { TICKER_WORKER_FACTORY } from '../tokens/ticker-worker.token';
import { TickerData, WorkerIn, WorkerOut } from '../models/market-data.model';
import { buildStreamUrl, parseTicker } from './ticker-parser';

const latest = new Map<string, TickerData>();
// ...and inside ws.onmessage:
// const t = parseTicker(JSON.parse(e.data));

export const provideTickerWorker = (): Provider => ({
    provide: TICKER_WORKER_FACTORY,
    useValue: () => new Worker(new URL('./ticker.worker', import.meta.url), { type: 'module' }),
});