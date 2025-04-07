import { isEmulatorMode } from '../utils/environment';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

export async function getMenuSuggestion(cuisine: string): Promise<string> {
  if (isEmulatorMode) {
    // In emulator mode, import and use the mock directly
    const { mockMenuSuggestion } = require('../../functions/src/index');
    return mockMenuSuggestion(cuisine);
  } else {
    // In production, call the deployed function
    const menuSuggestionFn = httpsCallable(functions, 'menuSuggestionFlow');
    const result = await menuSuggestionFn(cuisine);
    return result.data as string;
  }
}