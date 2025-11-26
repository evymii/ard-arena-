import { FiniteMove } from '../finiteMove';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class Squat extends FiniteMove {
  constructor(owner: Fighter) {
    super(owner, MoveType.SQUAT, 40);
    this.totalSteps = 3;
  }

  protected _action(): void {
    this.keepDistance();
    if (this.currentStep === 2) {
      this.stop();
    }
  }
}
