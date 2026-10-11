import { InjectionToken } from '@angular/core';

export type WorkerFactory = () => Worker;
export const TICKER_WORKER_FACTORY = new InjectionToken<WorkerFactory>('TICKER_WORKER_FACTORY');