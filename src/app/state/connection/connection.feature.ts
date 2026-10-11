import { createFeature, createReducer, on } from '@ngrx/store';
import { ConnectionStatus } from '../../core/models/market-data.model';
import { ConnectionActions } from './connection.actions';

export interface ConnectionState {
    status: ConnectionStatus;
    lastBatchAt: number | null;
}

export const initialConnectionState: ConnectionState = {
    status: 'closed',
    lastBatchAt: null,
};

export const connectionFeature = createFeature({
    name: 'connection',
    reducer: createReducer(
        initialConnectionState,
        on(ConnectionActions.statusChanged, (state, { status }) => ({ ...state, status })),
        on(ConnectionActions.batchReceived, (state, { at }) => ({ ...state, lastBatchAt: at })),
    ),
});

export const { selectConnectionState, selectStatus, selectLastBatchAt } = connectionFeature;