import { AppState } from './state/AppState';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { HuntGrid } from './components/HuntGrid';
import { Pagination } from './components/Pagination';
import { Modal } from './components/Modal';
import type { Hunt } from './types/Hunt';
import './styles/main.css';

/**
 * Load hunt data from JSON file
 */
async function loadHunts(): Promise<Hunt[]> {
  const response = await fetch('/hunts-data.json');

  if (!response.ok) {
    throw new Error(`Failed to load hunt data: HTTP ${response.status} ${response.statusText}`);
  }

  const data: Hunt[] = await response.json();
  return data;
}

/**
 * Hide loading indicator
 */
function hideLoading(): void {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'none';
  }
}

/**
 * Show error message to user
 */
function showError(message: string): void {
  const container = document.getElementById('huntsGrid');
  if (container) {
    container.innerHTML = `
      <div class="error-message">
        <h2>⚠️ Error</h2>
        <p>${message}</p>
        <button onclick="location.reload()" class="btn btn-primary">Reload Page</button>
      </div>
    `;
  }
  hideLoading();
}

/**
 * Initialize the application
 */
async function initApp(): Promise<void> {
  try {
    console.log('HEARTH initializing...');

    // Load hunt data
    const hunts = await loadHunts();
    console.log(`Loaded ${hunts.length} hunts`);

    if (hunts.length === 0) {
      showError('No hunts found in database');
      return;
    }

    // Initialize state
    const state = new AppState(hunts);

    // Initialize modal (must be created before HuntGrid)
    const modal = new Modal(state);

    // Initialize components (order matters for dependencies)
    new SearchBar(state);
    new FilterPanel(state);
    new HuntGrid(state, modal);
    new Pagination(state);

    // Hide loading indicator
    hideLoading();

    // Trigger initial render
    state.render();

    console.log('HEARTH initialized successfully');
    console.log(`- Total hunts: ${state.getTotalHuntCount()}`);
    console.log(`- Unique tactics: ${state.getUniqueTactics().size}`);
    console.log(`- Contributors: ${state.getUniqueContributors().size}`);

  } catch (error) {
    console.error('Failed to initialize HEARTH:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      showError('Failed to load hunt data. Please check your network connection.');
    } else if (error instanceof Error && error.message.includes('404')) {
      showError('Hunt data file not found. Please contact support.');
    } else if (error instanceof Error) {
      showError(`Failed to load hunt data: ${error.message}`);
    } else {
      showError('An unexpected error occurred. Please refresh the page.');
    }
  }
}

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Start the application
initApp();
