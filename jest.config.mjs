import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createEsmPreset } = require('jest-preset-angular/presets');

export default {
  ...createEsmPreset(),
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.worker.ts',
    '!src/app/**/*.provider.ts',
    '!src/app/app.config.ts',
    '!src/app/app.routes.ts',
  ],
  coverageThreshold: {
    global: { statements: 85, branches: 80, functions: 85, lines: 85 },
  },
};
