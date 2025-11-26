import { MoveType } from '../moveTypes';
import { KEYS } from './basicController';

export interface TouchButton {
  keyCode: number;
  element: HTMLElement;
  isPressed: boolean;
}

export class MobileController {
  private container: HTMLElement;
  private pressed: Record<number, boolean> = {};
  private touchButtons: Map<number, TouchButton> = new Map();
  private onKeyPress: (keyCode: number, pressed: boolean) => void;
  private isVisible: boolean = false;

  constructor(
    container: HTMLElement,
    onKeyPress: (keyCode: number, pressed: boolean) => void
  ) {
    this.container = container;
    this.onKeyPress = onKeyPress;
    this.createController();
    this.setupOrientationLock();
    this.updateVisibility();
    window.addEventListener('resize', () => this.updateVisibility());
  }

  private isMobile(): boolean {
    const width = window.innerWidth;
    // Mobile controller only works between 375px and 1024px
    // If screen is smaller or larger, don't show mobile controller
    return width >= 375 && width <= 1024;
  }

  private updateVisibility(): void {
    const shouldShow = this.isMobile();
    if (shouldShow !== this.isVisible) {
      this.isVisible = shouldShow;
      const controller = this.container.querySelector('.mobile-controller');
      if (controller) {
        (controller as HTMLElement).style.display = shouldShow ? 'flex' : 'none';
      }
    }
  }

  private setupOrientationLock(): void {
    if (!this.isMobile()) return;

    // Try to lock orientation to landscape
    const lockOrientation = () => {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {
          // Orientation lock may fail in some browsers, ignore silently
        });
      } else if ((screen as any).lockOrientation) {
        (screen as any).lockOrientation('landscape');
      } else if ((screen as any).mozLockOrientation) {
        (screen as any).mozLockOrientation('landscape');
      } else if ((screen as any).msLockOrientation) {
        (screen as any).msLockOrientation('landscape');
      }
    };

    // Lock on initial load
    lockOrientation();

    // Lock on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(lockOrientation, 100);
    });

    // Lock on resize (for some devices)
    window.addEventListener('resize', () => {
      if (this.isMobile()) {
        setTimeout(lockOrientation, 100);
      }
    });
  }

  private createController(): void {
    const controller = document.createElement('div');
    controller.className = 'mobile-controller';
    controller.style.display = this.isMobile() ? 'flex' : 'none';

    // Left side - D-pad and movement controls
    const leftSide = this.createLeftSide();
    controller.appendChild(leftSide);

    // Right side - Action buttons (ASDF)
    const rightSide = this.createRightSide();
    controller.appendChild(rightSide);

    this.container.appendChild(controller);
  }

  private createLeftSide(): HTMLElement {
    const leftSide = document.createElement('div');
    leftSide.className = 'controller-left';

    // D-pad container
    const dpadContainer = document.createElement('div');
    dpadContainer.className = 'dpad-container';

    // D-pad buttons
    const dpadUp = this.createButton('↑', KEYS.UP, 'dpad-btn dpad-up');
    const dpadDown = this.createButton('↓', KEYS.DOWN, 'dpad-btn dpad-down');
    const dpadLeft = this.createButton('←', KEYS.LEFT, 'dpad-btn dpad-left');
    const dpadRight = this.createButton('→', KEYS.RIGHT, 'dpad-btn dpad-right');
    const dpadCenter = document.createElement('div');
    dpadCenter.className = 'dpad-center';

    dpadContainer.appendChild(dpadUp);
    dpadContainer.appendChild(dpadDown);
    dpadContainer.appendChild(dpadLeft);
    dpadContainer.appendChild(dpadRight);
    dpadContainer.appendChild(dpadCenter);

    leftSide.appendChild(dpadContainer);

    return leftSide;
  }

  private createRightSide(): HTMLElement {
    const rightSide = document.createElement('div');
    rightSide.className = 'controller-right';

    // Action buttons (ASDF)
    const buttonA = this.createButton('A', KEYS.HP, 'action-btn btn-a');
    const buttonS = this.createButton('S', KEYS.LP, 'action-btn btn-s');
    const buttonD = this.createButton('D', KEYS.LK, 'action-btn btn-d');
    const buttonF = this.createButton('F', KEYS.HK, 'action-btn btn-f');

    rightSide.appendChild(buttonA);
    rightSide.appendChild(buttonS);
    rightSide.appendChild(buttonD);
    rightSide.appendChild(buttonF);

    return rightSide;
  }

  private createButton(
    label: string,
    keyCode: number,
    className: string
  ): HTMLElement {
    const button = document.createElement('div');
    button.className = className;
    button.textContent = label;
    button.setAttribute('data-key', keyCode.toString());

    const touchButton: TouchButton = {
      keyCode,
      element: button,
      isPressed: false,
    };

    this.touchButtons.set(keyCode, touchButton);

    // Touch start
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleTouch(keyCode, true);
    });

    // Touch end
    button.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleTouch(keyCode, false);
    });

    // Touch cancel (when finger leaves screen)
    button.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.handleTouch(keyCode, false);
    });

    // Mouse events for testing on desktop
    button.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.handleTouch(keyCode, true);
    });

    button.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.handleTouch(keyCode, false);
    });

    button.addEventListener('mouseleave', (e) => {
      e.preventDefault();
      this.handleTouch(keyCode, false);
    });

    return button;
  }

  private handleTouch(keyCode: number, pressed: boolean): void {
    const touchButton = this.touchButtons.get(keyCode);
    if (!touchButton) return;

    touchButton.isPressed = pressed;
    this.pressed[keyCode] = pressed;

    if (pressed) {
      touchButton.element.classList.add('pressed');
    } else {
      touchButton.element.classList.remove('pressed');
    }

    this.onKeyPress(keyCode, pressed);
  }

  public getPressedKeys(): Record<number, boolean> {
    return { ...this.pressed };
  }

  public destroy(): void {
    try {
      const controller = this.container.querySelector('.mobile-controller');
      if (controller && controller.parentNode) {
        controller.parentNode.removeChild(controller);
      }
    } catch (e) {
      // Container may already be destroyed, ignore
    }
    this.touchButtons.clear();
    this.pressed = {};
  }
}

