import { Move } from './move';
import { MoveType } from './moveTypes';
import type { Fighter } from '../fighters/fighter';

export class FiniteMove extends Move {
  protected bottom?: number;

  constructor(owner: Fighter, type: MoveType, duration?: number) {
    super(owner, type, duration);
    this.bottom = undefined;
  }

  moveNextStep(): void {
    if (this.currentStep >= this.totalSteps - 1) {
      this.currentStep = this.totalSteps - 1;
    } else {
      this.currentStep += 1;
    }
  }

  protected _beforeGo(): void {
    this.bottom = this.owner.getBottom();
    this.owner.lock();
  }

  protected _beforeStop(): void {
    this.owner.unlock();
  }

  keepDistance(): void {
    if (this.bottom === undefined) return;
    const currentBottom = this.owner.getBottom();
    if (currentBottom > this.bottom) {
      this.owner.setY(this.owner.getY() + currentBottom - this.bottom);
    }
    if (currentBottom < this.bottom) {
      this.owner.setY(this.owner.getY() - (this.bottom - currentBottom));
    }
  }
}

