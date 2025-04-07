export const isEmulatorMode = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

// Helper to decide whether to use real API or mock
export const useAiMock = isEmulatorMode;

// Helper to decide which implementation to use
export function getAiImplementation() {
  const { menuSuggestionFlow, mockMenuSuggestion } = require('../../functions/src/index');
  return useAiMock ? mockMenuSuggestion : menuSuggestionFlow;
}