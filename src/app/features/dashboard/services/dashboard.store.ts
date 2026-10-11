import { computed, inject } from '@angular/core';
import { patchState, signalStore, type, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { entityConfig, upsertEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, pipe, switchMap, tap } from 'rxjs';
import { TickerData } from '../../../core/models/market-data.model';
import { MarketDataService } from '../../../core/services/market-data';

const tickerConfig = entityConfig({
  entity: type<TickerData>(),
  selectId: (t) => t.symbol,
});

interface DashboardState {
  loading: boolean;
  error: string | null;
  selectedSymbol: string | null;
  refreshMs: number;
}

const initialState: DashboardState = {
  loading: true,
  error: null,
  selectedSymbol: null,
  refreshMs: 1000,
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(tickerConfig),
  withComputed(({ entities, entityMap, selectedSymbol }) => ({
    count: computed(() => entities().length),
    topGainer: computed(() =>
      entities().reduce<TickerData | null>((best, t) => (!best || t.changePercent > best.changePercent ? t : best), null)),
    topLoser: computed(() =>
      entities().reduce<TickerData | null>((worst, t) => (!worst || t.changePercent < worst.changePercent ? t : worst), null)),
    selected: computed(() => {
      const symbol = selectedSymbol();
      return symbol ? entityMap()[symbol] ?? null : null;
    }),
  })),
  withMethods((store, marketData = inject(MarketDataService)) => {
    const listen = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          marketData.getOptimizedMarketStream().pipe(
            tap((batch) =>
              patchState(store, upsertEntities(batch, tickerConfig), { loading: false, error: null })),
            catchError(() => {
              patchState(store, { loading: false, error: 'Failed to maintain real-time connection stream' });
              return EMPTY;
            }),
          ),
        ),
      ),
    );

    return {
      initStream(): void {
        listen();               // subscribe first
        marketData.start();     // then start the feed
      },
      selectSymbol(symbol: string | null): void {
        patchState(store, { selectedSymbol: symbol });
      },
      setRefreshRate(ms: number): void {
        marketData.setRefreshRate(ms);
        patchState(store, { refreshMs: ms });
      },
    };
  }),
  withHooks({
    onInit(store) {
      store.initStream();
    },
  }),
);


// export function upsertTickers(current: TickerData[], incoming: TickerData[]): TickerData[] {
//   const map = new Map(current.map(t => [t.symbol, t] as const));
//   for (const t of incoming) map.set(t.symbol, t);
//   return [...map.values()];
// }

// export const DashboardStore = signalStore(
//   { providedIn: 'root' },
//   withState(initialState),
//   withMethods((store, marketData = inject(MarketDataService), destroyRef = inject(DestroyRef)) => ({
//     initStream(): void {
//       patchState(store, { loading: true });
//       marketData.getOptimizedMarketStream()
//         .pipe(takeUntilDestroyed(destroyRef))
//         .subscribe({
//           next: (batch) =>
//             patchState(store, (s) => ({
//               tickers: upsertTickers(s.tickers, Array.isArray(batch) ? batch : [batch]),
//               loading: false,
//               error: null,
//             })),
//           error: () =>
//             patchState(store, {
//               loading: false,
//               error: 'Failed to maintain real-time connection stream',
//             }),
//         });
//     },
//   })),
//   withHooks({
//     onInit(store) {
//       store.initStream();
//     },
//   }),
// );