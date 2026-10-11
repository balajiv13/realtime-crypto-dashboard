import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { defer, of, tap, withLatestFrom } from 'rxjs';
import { APP_STORAGE } from '../../core/tokens/storage.token';
import { PreferencesActions } from './preferences.actions';
import { selectPreferencesState } from './preferences.feature';
import { PREFERENCES_KEY, readPreferences } from './preferences.model';

@Injectable()
export class PreferencesEffects {
    private readonly actions$ = inject(Actions);
    private readonly store = inject(Store);
    private readonly storage = inject(APP_STORAGE);

    /** Runs once when effects register: load saved prefs into the Store. */
    readonly hydrate$ = createEffect(() =>
        defer(() => of(PreferencesActions.hydrated({ preferences: readPreferences(this.storage) }))),
    );

    /** Save after every user change. Not on hydrate, since that would just rewrite what we read. */
    readonly persist$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PreferencesActions.themeChanged, PreferencesActions.compactToggled),
                withLatestFrom(this.store.select(selectPreferencesState)),
                tap(([, prefs]) => this.storage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))),
            ),
        { dispatch: false },
    );
}