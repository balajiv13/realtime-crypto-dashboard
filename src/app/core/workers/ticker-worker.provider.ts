// src/app/core/workers/ticker-worker.provider.ts
import { Provider } from '@angular/core';
import { TICKER_WORKER_FACTORY } from '../tokens/ticker-worker.token';

export const provideTickerWorker = (): Provider => ({
    provide: TICKER_WORKER_FACTORY,
    useValue: () => new Worker(new URL('./ticker.worker', import.meta.url), { type: 'module' }),
});