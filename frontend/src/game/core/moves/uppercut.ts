import { Attack } from './attack';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class Uppercut extends Attack {
  constructor(owner: Fighter) {
    super(owner, MoveType.UPPERCUT, 5, 13, 60);
  }

  protected _beforeStop(): void {
    this.owner.unlock();
    this.keepDistance();
  }

  protected _action(): void {
    this.keepDistance();
    if (!this.hitPassed && this.currentStep === Math.round(this.totalSteps / 2)) {
      this.owner.attack(this.getDamage());
      this.hitPassed = true;
    }
  }
}
