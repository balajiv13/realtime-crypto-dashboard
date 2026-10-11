import { createActionGroup, props } from '@ngrx/store';
import { WatchlistItem } from './watchlist.model';

export const WatchlistActions = createActionGroup({
    source: 'Watchlist',
    events: {
        Hydrated: props<{ items: WatchlistItem[] }>(),
        'Symbol Toggled': props<{ symbol: string; at: number }>(),
        'Symbol Removed': props<{ symbol: string }>(),
    },
});