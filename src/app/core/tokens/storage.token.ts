import { InjectionToken } from '@angular/core';

export type AppStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const APP_STORAGE = new InjectionToken<AppStorage>('APP_STORAGE', {
    providedIn: 'root',
    factory: () => localStorage,
});