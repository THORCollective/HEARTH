import type { AppState } from '../state/AppState';

/**
 * Observer pattern interface for components that react to state changes
 */
export interface Observer {
  /**
   * Called when AppState changes
   * @param state The updated application state
   */
  onStateChange(state: AppState): void;
}
