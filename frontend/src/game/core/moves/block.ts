import { FiniteMove } from '../finiteMove';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class Block extends FiniteMove {
  constructor(owner: Fighter) {
    super(owner, MoveType.BLOCK, 40);
    this.totalSteps = 3;
  }

  protected _action(): void {
    this.keepDistance();
    if (this.currentStep === 2) {
      this.stop();
    }
  }
}

