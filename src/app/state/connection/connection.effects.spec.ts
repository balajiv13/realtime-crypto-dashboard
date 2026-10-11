import { beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { ConnectionStatus, TickerBatch } from '../../core/models/market-data.model';
import { WebsocketService } from '../../core/services/websocket';
import { ConnectionActions } from './connection.actions';
import { ConnectionEffects } from './connection.effects';

describe('ConnectionEffects', () => {
  let status$: BehaviorSubject<ConnectionStatus>;
  let batches$: Subject<TickerBatch>;
  let effects: ConnectionEffects;

  beforeEach(() => {
    status$ = new BehaviorSubject<ConnectionStatus>('closed');
    batches$ = new Subject<TickerBatch>();
    TestBed.configureTestingModule({
      providers: [
        ConnectionEffects,
        { provide: WebsocketService, useValue: { status$, batches$ } },
      ],
    });
    effects = TestBed.inject(ConnectionEffects);
  });

  it('mirrors worker status into actions (including the initial value)', () => {
    const out: Action[] = [];
    const sub = effects.mirrorStatus$.subscribe((a) => out.push(a));

    status$.next('connecting');
    status$.next('open');

    expect(out).toEqual([
      ConnectionActions.statusChanged({ status: 'closed' }),
      ConnectionActions.statusChanged({ status: 'connecting' }),
      ConnectionActions.statusChanged({ status: 'open' }),
    ]);
    sub.unsubscribe();
  });

  it('dispatches one batchReceived per batch with its timestamp', () => {
    const out: Action[] = [];
    const sub = effects.markBatch$.subscribe((a) => out.push(a));

    batches$.next({ ts: 100, tickers: [] });
    batches$.next({ ts: 200, tickers: [] });

    expect(out).toEqual([
      ConnectionActions.batchReceived({ at: 100 }),
      ConnectionActions.batchReceived({ at: 200 }),
    ]);
    sub.unsubscribe();
  });
});