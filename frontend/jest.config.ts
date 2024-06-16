import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'], // Adjust if your setup file is located elsewhere
  moduleNameMapper: {
    // If you're using paths in tsconfig.json, replicate them here
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    // Add more mappings as needed
  },
  transform: {
    // ts-jest transformation
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Specify your tsconfig if it's not in the root
    },
  },
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)', // Adjust if you use different naming conventions
  ],
  // Add more configuration as needed
};

export default config;