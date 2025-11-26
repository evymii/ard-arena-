import { FiniteMove } from '../finiteMove';
import { MoveType } from '../moveTypes';
import { CONFIG } from '../config';
import type { Fighter } from '../../fighters/fighter';

export class AttractiveStandUp extends FiniteMove {
  constructor(owner: Fighter) {
    super(owner, MoveType.ATTRACTIVE_STAND_UP, 100);
    this.totalSteps = 4;
  }

  protected _action(): void {
    if (this.currentStep === this.totalSteps - 1) {
      this.stop();
      this.owner.setMove(MoveType.STAND);
    } else {
      this.keepDistance();
    }
  }

  protected _beforeStop(): void {
    this.owner.unlock();
    this.owner.setY(CONFIG.PLAYER_TOP);
  }
}
