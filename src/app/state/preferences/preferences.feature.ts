import { createFeature, createReducer, on } from '@ngrx/store';
import { PreferencesActions } from './preferences.actions';
import { DEFAULT_PREFERENCES } from './preferences.model';

export const preferencesFeature = createFeature({
    name: 'preferences',
    reducer: createReducer(
        DEFAULT_PREFERENCES,
        on(PreferencesActions.hydrated, (_, { preferences }) => preferences),
        on(PreferencesActions.themeChanged, (state, { theme }) => ({ ...state, theme })),
        on(PreferencesActions.compactToggled, (state) => ({ ...state, compactNumbers: !state.compactNumbers })),
    ),
});

export const { selectPreferencesState, selectTheme, selectCompactNumbers } = preferencesFeature;