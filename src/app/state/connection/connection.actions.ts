import { createActionGroup, props } from '@ngrx/store';
import { ConnectionStatus } from '../../core/models/market-data.model';

export const ConnectionActions = createActionGroup({
    source: 'Connection',
    events: {
        'Status Changed': props<{ status: ConnectionStatus }>(),
        'Batch Received': props<{ at: number }>(),
    },
});