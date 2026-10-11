import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PreferencesState, Theme } from './preferences.model';

export const PreferencesActions = createActionGroup({
    source: 'Preferences',
    events: {
        Hydrated: props<{ preferences: PreferencesState }>(),
        'Theme Changed': props<{ theme: Theme }>(),
        'Compact Toggled': emptyProps(),
    },
});