import { describe, expect, it } from '@jest/globals';
import { DEFAULT_PREFERENCES, PREFERENCES_KEY, readPreferences } from './preferences.model';

const storageWith = (value: string | null) => ({
    getItem: (key: string) => (key === PREFERENCES_KEY ? value : null),
});

describe('readPreferences', () => {
    it('returns defaults when nothing is stored', () => {
        expect(readPreferences(storageWith(null))).toEqual(DEFAULT_PREFERENCES);
    });

    it('reads valid stored values', () => {
        expect(readPreferences(storageWith('{"theme":"light","compactNumbers":true}')))
            .toEqual({ theme: 'light', compactNumbers: true });
    });

    it('falls back to defaults on malformed JSON', () => {
        expect(readPreferences(storageWith('{not json'))).toEqual(DEFAULT_PREFERENCES);
    });

    it('falls back per field when values are invalid', () => {
        expect(readPreferences(storageWith('{"theme":"neon","compactNumbers":"yes"}')))
            .toEqual(DEFAULT_PREFERENCES);
        expect(readPreferences(storageWith('{"theme":"light","compactNumbers":"yes"}')))
            .toEqual({ theme: 'light', compactNumbers: false });
    });

    it('survives storage throwing (private mode, blocked storage)', () => {
        const throwing = { getItem: () => { throw new Error('denied'); } };
        expect(readPreferences(throwing)).toEqual(DEFAULT_PREFERENCES);
    });
});