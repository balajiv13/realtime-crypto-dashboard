import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { TickerData } from '../../../core/models/market-data.model';
import { MarketDataService } from '../../../core/services/market-data';

export interface DashboardState {
  tickers: TickerData[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = { tickers: [], loading: true, error: null };

export function upsertTickers(current: TickerData[], incoming: TickerData[]): TickerData[] {
  const map = new Map(current.map(t => [t.symbol, t] as const));
  for (const t of incoming) map.set(t.symbol, t);
  return [...map.values()];
}

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, marketData = inject(MarketDataService), destroyRef = inject(DestroyRef)) => ({
    initStream(): void {
      patchState(store, { loading: true });
      marketData.getOptimizedMarketStream()
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: (batch) =>
            patchState(store, (s) => ({
              tickers: upsertTickers(s.tickers, Array.isArray(batch) ? batch : [batch]),
              loading: false,
              error: null,
            })),
          error: () =>
            patchState(store, {
              loading: false,
              error: 'Failed to maintain real-time connection stream',
            }),
        });
    },
  })),
  withHooks({
    onInit(store) {
      store.initStream();
    },
  }),
);