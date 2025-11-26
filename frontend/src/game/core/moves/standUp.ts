import { FiniteMove } from '../finiteMove';
import { MoveType } from '../moveTypes';
import { CONFIG } from '../config';
import type { Fighter } from '../../fighters/fighter';

export class StandUp extends FiniteMove {
  constructor(owner: Fighter) {
    super(owner, MoveType.STAND_UP, 100);
    this.totalSteps = 3;
  }

  protected _action(): void {
    if (this.currentStep === 2) {
      this.stop();
      this.owner.setMove(MoveType.STAND);
      this.owner.setY(CONFIG.PLAYER_TOP);
    }
    this.keepDistance();
  }
}
