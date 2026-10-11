import { Injectable, inject } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { map } from 'rxjs';
import { WebsocketService } from '../../core/services/websocket';
import { ConnectionActions } from './connection.actions';

@Injectable()
export class ConnectionEffects {
    private readonly ws = inject(WebsocketService);

    readonly mirrorStatus$ = createEffect(() =>
        this.ws.status$.pipe(map((status) => ConnectionActions.statusChanged({ status }))),
    );

    readonly markBatch$ = createEffect(() =>
        this.ws.batches$.pipe(map((batch) => ConnectionActions.batchReceived({ at: batch.ts }))),
    );
}