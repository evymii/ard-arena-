import { Orientation } from './orientations';
import { MoveType } from './moveTypes';
import { CONFIG } from './config';
import type { Fighter } from '../fighters/fighter';

export abstract class Move {
  protected owner: Fighter;
  public readonly type: MoveType;
  protected stepDuration: number;
  protected interval: number = -1;
  public currentStep: number = 0;
  protected actionPending: (() => void) | null = null;
  protected steps: Record<Orientation, HTMLImageElement[]> = {
    left: [],
    right: []
  };
  public totalSteps: number = 0;

  constructor(owner: Fighter, type: MoveType, stepDuration?: number) {
    this.owner = owner;
    this.type = type;
    this.stepDuration = stepDuration || CONFIG.STEP_DURATION;
  }

  go(step?: number): void {
    if (typeof (this as any)._beforeGo === 'function') {
      (this as any)._beforeGo.call(this);
    }
    this.currentStep = step || 0;
    this.nextStep(() => {
      if (typeof (this as any)._action === 'function') {
        (this as any)._action.call(this);
      }
    });
    this.interval = window.setInterval(() => {
      this.nextStep(() => {
        if (typeof (this as any)._action === 'function') {
          (this as any)._action.call(this);
        }
      });
    }, this.stepDuration);
  }

  protected nextStep(callback: () => void): void {
    const img = this.steps[this.owner.getOrientation()][this.currentStep];
    this.owner.setState(img);
    callback();
    this.owner.refresh();
    this.moveNextStep();
  }

  init(callback: () => void): void {
    let loaded = 0;
    const o = { LEFT: 'left' as Orientation, RIGHT: 'right' as Orientation };
    this.steps = { left: [], right: [] };
    
    for (let i = 0; i < this.totalSteps; i += 1) {
      for (const orientationKey in o) {
        const orientation = o[orientationKey as keyof typeof o];
        const img = document.createElement('img');
        img.onload = () => {
          loaded += 1;
          if (loaded === this.totalSteps * 2) {
            callback();
          }
        };
        img.src = this.getImageUrl(i, orientation);
        this.steps[orientation].push(img);
      }
    }
    
    if (typeof (this as any).addHandlers === 'function') {
      (this as any).addHandlers.call(this);
    }
  }

  protected getImageUrl(id: number, ownerOrientation: Orientation): string {
    return `${CONFIG.IMAGES}${CONFIG.FIGHTERS}${this.owner.getName()}/${ownerOrientation}/${this.type}/${id}.png`;
  }

  stop(_callback?: () => void): void {
    if (typeof (this as any)._beforeStop === 'function') {
      (this as any)._beforeStop.call(this);
    }

    if (this.interval !== -1) {
      clearInterval(this.interval);
      this.interval = -1;
    }

    if (typeof this.actionPending === 'function') {
      const func = this.actionPending;
      this.actionPending = null;
      func();
    }
  }

  abstract moveNextStep(): void;
}
