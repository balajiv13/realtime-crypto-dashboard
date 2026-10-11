import { AppStorage } from '../../core/tokens/storage.token';

export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

export interface PreferencesState {
    theme: Theme;
    compactNumbers: boolean;
}

export const DEFAULT_PREFERENCES: PreferencesState = { theme: 'dark', compactNumbers: false };
export const PREFERENCES_KEY = 'pulse.preferences';

/** Never trust persisted data: validate every field, fall back per field. */
export function readPreferences(storage: Pick<AppStorage, 'getItem'>): PreferencesState {
    try {
        const raw = storage.getItem(PREFERENCES_KEY);
        if (!raw) return DEFAULT_PREFERENCES;
        const parsed = JSON.parse(raw) as Partial<PreferencesState> | null;
        return {
            theme: THEMES.includes(parsed?.theme as Theme) ? (parsed!.theme as Theme) : DEFAULT_PREFERENCES.theme,
            compactNumbers:
                typeof parsed?.compactNumbers === 'boolean' ? parsed.compactNumbers : DEFAULT_PREFERENCES.compactNumbers,
        };
    } catch {
        return DEFAULT_PREFERENCES;
    }
}