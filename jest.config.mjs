import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createEsmPreset } = require('jest-preset-angular/presets');

export default {
  ...createEsmPreset(),
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  collectCoverageFrom: ['src/app/**/*.ts', '!src/app/**/*.worker.ts'],
};