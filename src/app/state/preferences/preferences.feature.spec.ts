import { describe, expect, it } from '@jest/globals';
import { PreferencesActions } from './preferences.actions';
import { preferencesFeature, selectCompactNumbers, selectTheme } from './preferences.feature';
import { DEFAULT_PREFERENCES } from './preferences.model';

const { reducer } = preferencesFeature;

describe('preferences feature', () => {
  it('starts with defaults', () => {
    expect(reducer(undefined, { type: '@@init' })).toEqual(DEFAULT_PREFERENCES);
  });

  it('replaces state on hydrate', () => {
    const next = reducer(DEFAULT_PREFERENCES,
      PreferencesActions.hydrated({ preferences: { theme: 'light', compactNumbers: true } }));
    expect(next).toEqual({ theme: 'light', compactNumbers: true });
  });

  it('changes theme', () => {
    expect(reducer(DEFAULT_PREFERENCES, PreferencesActions.themeChanged({ theme: 'light' })).theme)
      .toBe('light');
  });

  it('toggles compact numbers back and forth', () => {
    const on = reducer(DEFAULT_PREFERENCES, PreferencesActions.compactToggled());
    expect(on.compactNumbers).toBe(true);
    expect(reducer(on, PreferencesActions.compactToggled()).compactNumbers).toBe(false);
  });

  it('exposes selectors', () => {
    const root = { preferences: { theme: 'light' as const, compactNumbers: true } };
    expect(selectTheme(root)).toBe('light');
    expect(selectCompactNumbers(root)).toBe(true);
  });
});