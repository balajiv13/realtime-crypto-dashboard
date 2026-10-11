import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TICKER_WORKER_FACTORY } from '../tokens/ticker-worker.token';
import { WebsocketService } from './websocket';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

class FakeWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  posted: unknown[] = [];
  terminated = false;
  postMessage(m: unknown) { this.posted.push(m); }
  terminate() { this.terminated = true; }
  emit(data: unknown) { this.onmessage?.({ data } as MessageEvent); }
}

describe('WebSocketService', () => {
  let fake: FakeWorker;
  let factory: jest.Mock;
  let service: WebsocketService;

  beforeEach(() => {
    fake = new FakeWorker();
    factory = jest.fn(() => fake as unknown as Worker);
    TestBed.configureTestingModule({
      providers: [{ provide: TICKER_WORKER_FACTORY, useValue: factory }],
    });
    service = TestBed.inject(WebsocketService);
  });

  it('posts a connect message with the symbols', () => {
    service.connect(['BTCUSDT']);
    expect(fake.posted).toEqual([{ type: 'connect', symbols: ['BTCUSDT'] }]);
  });

  it('creates only one worker across repeated connects', () => {
    service.connect(['BTCUSDT']);
    service.connect(['ETHUSDT']);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(fake.posted).toHaveLength(2);
  });

  it('forwards batches to batches$', async () => {
    service.connect(['BTCUSDT']);
    const next = firstValueFrom(service.batches$);
    const batch = { ts: 1, tickers: [] };
    fake.emit({ type: 'batch', batch });
    await expect(next).resolves.toEqual(batch);
  });

  it('updates the status signal', () => {
    service.connect(['BTCUSDT']);
    fake.emit({ type: 'status', status: 'open' });
    expect(service.status()).toBe('open');
  });

  it('terminates the worker on disconnect', () => {
    service.connect(['BTCUSDT']);
    service.disconnect();
    expect(fake.terminated).toBe(true);
    expect(service.status()).toBe('closed');
  });
});