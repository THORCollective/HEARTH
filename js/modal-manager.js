/**
 * ModalManager - Handles all modal dialog functionality for the HEARTH application
 *
 * This module manages:
 * - Modal creation and initialization
 * - Opening/closing modals
 * - Modal navigation (prev/next)
 * - Modal content generation for hunt details
 * - Keyboard navigation support
 *
 * @class ModalManager
 */
export class ModalManager {
  /**
   * Creates a new ModalManager instance
   * @param {Object} options - Configuration options
   * @param {Function} options.onNavigate - Callback when navigating between hunts
   */
  constructor(options = {}) {
    this.options = options;
    this.modal = null;
    this.modalBody = null;
    this.modalCounter = null;
    this.modalPrevButton = null;
    this.modalNextButton = null;
    this.currentModalIndex = 0;
    this.sortedHunts = [];

    this.createModal();
  }

  /**
   * Creates and initializes the modal DOM structure
   * Sets up event listeners for close, navigation, and keyboard controls
   * @private
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="close" aria-label="Close">&times;</button>
        <div class="modal-toolbar">
          <button class="modal-nav-btn" data-direction="prev" aria-label="Previous hunt">◀</button>
          <span class="modal-counter" id="modalCounter"></span>
          <button class="modal-nav-btn" data-direction="next" aria-label="Next hunt">▶</button>
        </div>
        <div id="modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close');
    const modalBody = document.getElementById('modal-body');
    const modalCounter = document.getElementById('modalCounter');
    const [prevBtn, nextBtn] = modal.querySelectorAll('.modal-nav-btn');

    // Enhanced modal controls
    const closeModal = () => {
      this.close();
    };

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (modal.style.display === 'block') {
        if (e.key === 'Escape') {
          closeModal();
        } else if (e.key === 'ArrowLeft') {
          this.navigateModal(-1);
        } else if (e.key === 'ArrowRight') {
          this.navigateModal(1);
        }
      }
    });

    prevBtn.addEventListener('click', () => this.navigateModal(-1));
    nextBtn.addEventListener('click', () => this.navigateModal(1));

    this.modal = modal;
    this.modalBody = modalBody;
    this.modalCounter = modalCounter;
    this.modalPrevButton = prevBtn;
    this.modalNextButton = nextBtn;
  }

  /**
   * Updates the modal navigation state
   * Sets the counter text and enables/disables navigation buttons
   * @private
   */
  updateModalNavigation() {
    if (!this.modalCounter) {
      return;
    }
    const total = this.sortedHunts.length;
    const current = total ? this.currentModalIndex + 1 : 0;
    this.modalCounter.textContent = total ? `${current} / ${total}` : 'No hunts';

    if (this.modalPrevButton) {
      this.modalPrevButton.disabled = this.currentModalIndex <= 0;
    }
    if (this.modalNextButton) {
      this.modalNextButton.disabled = this.currentModalIndex >= total - 1;
    }
  }

  /**
   * Navigates to a different hunt in the modal
   * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
   */
  navigateModal(direction) {
    if (!this.modal || this.modal.style.display !== 'block') {
      return;
    }
    const targetIndex = this.currentModalIndex + direction;
    if (targetIndex < 0 || targetIndex >= this.sortedHunts.length) {
      return;
    }
    this.showHuntDetailsByIndex(targetIndex);
  }

  /**
   * Shows hunt details for a specific index in the sorted hunts array
   * @param {number} index - The index of the hunt to display
   */
  showHuntDetailsByIndex(index) {
    const hunt = this.sortedHunts[index];
    if (!hunt) {
      return;
    }
    this.currentModalIndex = index;
    this.showHuntDetails(hunt);
  }

  /**
   * Displays hunt details in the modal
   * @param {Object} hunt - The hunt object to display
   */
  showHuntDetails(hunt) {
    const modalContent = this.buildHuntDetailContent(hunt);
    this.modalBody.innerHTML = modalContent;
    this.modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    this.updateModalNavigation();
  }

  /**
   * Closes the modal
   */
  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.style.overflow = 'auto'; // Re-enable scrolling
    }
  }

  /**
   * Updates the sorted hunts array used for modal navigation
   * @param {Array} hunts - Array of hunt objects
   */
  setSortedHunts(hunts) {
    this.sortedHunts = hunts || [];
    this.updateModalNavigation();
  }

  /**
   * Builds the complete HTML content for hunt details
   * @param {Object} hunt - The hunt object
   * @returns {string} HTML string for modal content
   * @private
   */
  buildHuntDetailContent(hunt) {
    const header = this.buildHuntHeader(hunt);
    const sections = this.buildHuntSections(hunt);
    const footer = this.buildHuntFooter(hunt);
    return header + sections + footer;
  }

  /**
   * Builds the header section of hunt details (ID, category, title)
   * @param {Object} hunt - The hunt object
   * @returns {string} HTML string for header
   * @private
   */
  buildHuntHeader(hunt) {
    return `
      <div class="hunt-detail-header">
        <div class="hunt-detail-id">${hunt.id}</div>
        <div class="hunt-detail-category">${hunt.category}</div>
      </div>
      <h2 class="hunt-detail-title">${hunt.title}</h2>
    `;
  }

  /**
   * Builds the main content sections of hunt details
   * Includes tactic, notes, tags, submitter, why, and references
   * @param {Object} hunt - The hunt object
   * @returns {string} HTML string for content sections
   * @private
   */
  buildHuntSections(hunt) {
    let sections = '';

    if (hunt.tactic) {
      sections += `<div class="hunt-detail-tactic"><strong>Tactic:</strong> ${hunt.tactic}</div>`;
    }

    if (hunt.notes) {
      sections += `<div class="hunt-detail-notes"><strong>Notes:</strong> ${hunt.notes}</div>`;
    }

    if (hunt.tags && hunt.tags.length) {
      const tagElements = hunt.tags.map(tag => `<span class="hunt-tag">#${tag}</span>`).join('');
      sections += `<div class="hunt-detail-tags"><strong>Tags:</strong> ${tagElements}</div>`;
    }

    if (hunt.submitter && hunt.submitter.name) {
      const submitterLink = hunt.submitter.link ?
        `<a href="${hunt.submitter.link}" target="_blank">${hunt.submitter.name}</a>` :
        hunt.submitter.name;
      sections += `<div class="hunt-detail-submitter"><strong>Submitter:</strong> ${submitterLink}</div>`;
    }

    if (hunt.why) {
      sections += `<div class="hunt-detail-why"><h3>Why</h3><div class="hunt-detail-content">${hunt.why.replace(/\n/g, '<br>')}</div></div>`;
    }

    if (hunt.references) {
      sections += `<div class="hunt-detail-references"><h3>References</h3><div class="hunt-detail-content">${hunt.references.replace(/\n/g, '<br>')}</div></div>`;
    }

    return sections;
  }

  /**
   * Builds the footer section with action buttons
   * @param {Object} hunt - The hunt object
   * @returns {string} HTML string for footer
   * @private
   */
  buildHuntFooter(hunt) {
    return `
      <div class="hunt-detail-footer">
        <a href="https://github.com/THORCollective/HEARTH/blob/main/${hunt.file_path}" target="_blank" class="btn">
          View Source
        </a>
        <button class="btn btn-primary" onclick="generateNotebook('${hunt.id}')">
          Generate Notebook
        </button>
      </div>
    `;
  }
}
