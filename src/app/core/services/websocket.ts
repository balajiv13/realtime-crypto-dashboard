// core/service/websocket.service.ts  (adjust the import paths to your folders)
import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ConnectionStatus, TickerBatch, WorkerIn, WorkerOut } from '../models/market-data.model';
import { TICKER_WORKER_FACTORY } from '../tokens/ticker-worker.token';

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private readonly createWorker = inject(TICKER_WORKER_FACTORY);
  private worker?: Worker;

  private readonly _status = signal<ConnectionStatus>('closed');
  readonly status = this._status.asReadonly();

  private readonly statusSubject = new BehaviorSubject<ConnectionStatus>('closed');
  readonly status$ = this.statusSubject.asObservable();

  private setStatus(s: ConnectionStatus): void {
    this._status.set(s);
    this.statusSubject.next(s);
  }

  private readonly batchSubject = new Subject<TickerBatch>();
  readonly batches$ = this.batchSubject.asObservable();

  /** Starts (or re-targets) the feed. Safe to call more than once. */
  connect(symbols: string[]): void {
    if (!this.worker) {
      this.worker = this.createWorker();
      this.worker.onmessage = ({ data }: MessageEvent<WorkerOut>) => {
        if (data.type === 'status') this.setStatus(data.status);
        else this.batchSubject.next(data.batch);
      };
      this.worker.onerror = () => this.setStatus('closed');
    }
    this.send({ type: 'connect', symbols });
  }

  disconnect(): void {
    if (!this.worker) return;
    this.send({ type: 'disconnect' });
    this.worker.terminate();
    this.worker = undefined;
    this.setStatus('closed');
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.batchSubject.complete();
    this.statusSubject.complete();
  }

  private send(msg: WorkerIn): void {
    this.worker?.postMessage(msg);
  }
}