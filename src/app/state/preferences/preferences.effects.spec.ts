import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, firstValueFrom, of } from 'rxjs';
import { APP_STORAGE } from '../../core/tokens/storage.token';
import { PreferencesActions } from './preferences.actions';
import { PreferencesEffects } from './preferences.effects';
import { PREFERENCES_KEY } from './preferences.model';

describe('PreferencesEffects', () => {
  let actions$: Observable<Action>;
  const storage = {
    getItem: jest.fn<(key: string) => string | null>(),
    setItem: jest.fn<(key: string, value: string) => void>(),
  };
  const state = { theme: 'light' as const, compactNumbers: true };

  beforeEach(() => {
    storage.getItem.mockReset();
    storage.setItem.mockReset();
    actions$ = of();
    TestBed.configureTestingModule({
      providers: [
        PreferencesEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: { preferences: state } }),
        { provide: APP_STORAGE, useValue: storage },
      ],
    });
  });

  it('hydrates from storage on startup', async () => {
    storage.getItem.mockReturnValue(JSON.stringify(state));
    const effects = TestBed.inject(PreferencesEffects);

    await expect(firstValueFrom(effects.hydrate$))
      .resolves.toEqual(PreferencesActions.hydrated({ preferences: state }));
  });

  it('persists the new state after a theme change', () => {
    actions$ = of(PreferencesActions.themeChanged({ theme: 'light' }));
    const effects = TestBed.inject(PreferencesEffects);

    effects.persist$.subscribe();

    expect(storage.setItem).toHaveBeenCalledWith(PREFERENCES_KEY, JSON.stringify(state));
  });

  it('persists after compact is toggled', () => {
    actions$ = of(PreferencesActions.compactToggled());
    const effects = TestBed.inject(PreferencesEffects);

    effects.persist$.subscribe();

    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it('does not write back when hydrating', () => {
    actions$ = of(PreferencesActions.hydrated({ preferences: state }));
    const effects = TestBed.inject(PreferencesEffects);

    effects.persist$.subscribe();

    expect(storage.setItem).not.toHaveBeenCalled();
  });
});