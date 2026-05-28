export interface DrawerOptions {
  onClose?: () => void;
}

/**
 * Right-side slide-in drawer. Owns its DOM and dismissal. Caller passes
 * content as a DOM node via setContent().
 */
export class Drawer {
  private root: HTMLElement;
  private body: HTMLElement;
  private isOpenState = false;
  private onClose?: () => void;

  constructor(opts: DrawerOptions = {}) {
    this.onClose = opts.onClose;

    const root = document.createElement('div');
    root.className = 'drawer';
    root.setAttribute('aria-hidden', 'true');

    const overlay = document.createElement('div');
    overlay.className = 'drawer__overlay';
    overlay.addEventListener('click', () => this.close());

    const panel = document.createElement('aside');
    panel.className = 'drawer__panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'drawer__close';
    closeBtn.setAttribute('aria-label', 'Close drawer');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.close());

    const body = document.createElement('div');
    body.className = 'drawer__body';

    panel.appendChild(closeBtn);
    panel.appendChild(body);
    root.appendChild(overlay);
    root.appendChild(panel);
    document.body.appendChild(root);

    this.root = root;
    this.body = body;

    document.addEventListener('keydown', (e) => {
      if (this.isOpenState && e.key === 'Escape') this.close();
    });
  }

  open(): void {
    this.root.setAttribute('aria-hidden', 'false');
    this.root.classList.add('drawer--open');
    this.isOpenState = true;
  }

  close(): void {
    if (!this.isOpenState) return;
    this.root.classList.remove('drawer--open');
    this.root.setAttribute('aria-hidden', 'true');
    this.isOpenState = false;
    this.onClose?.();
  }

  isOpen(): boolean {
    return this.isOpenState;
  }

  /** Replace the drawer body with a DOM node. */
  setContent(node: Node): void {
    while (this.body.firstChild) this.body.removeChild(this.body.firstChild);
    this.body.appendChild(node);
  }
}
