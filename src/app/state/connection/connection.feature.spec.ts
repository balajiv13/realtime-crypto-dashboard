import { describe, expect, it } from '@jest/globals';
import { ConnectionActions } from './connection.actions';
import {
  connectionFeature, initialConnectionState, selectLastBatchAt, selectStatus,
} from './connection.feature';

const { reducer } = connectionFeature;

describe('connection feature', () => {
  it('starts closed with no batch yet', () => {
    expect(reducer(undefined, { type: '@@init' })).toEqual(initialConnectionState);
  });

  it('records status changes', () => {
    const next = reducer(initialConnectionState, ConnectionActions.statusChanged({ status: 'open' }));
    expect(next.status).toBe('open');
    expect(next.lastBatchAt).toBeNull();
  });

  it('records the time of the latest batch', () => {
    const next = reducer(initialConnectionState, ConnectionActions.batchReceived({ at: 42 }));
    expect(next.lastBatchAt).toBe(42);
  });

  it('exposes selectors', () => {
    const root = { connection: { status: 'open' as const, lastBatchAt: 7 } };
    expect(selectStatus(root)).toBe('open');
    expect(selectLastBatchAt(root)).toBe(7);
  });
});