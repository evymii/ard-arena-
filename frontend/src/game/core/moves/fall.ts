import { FiniteMove } from '../finiteMove';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class Fall extends FiniteMove {
  constructor(owner: Fighter) {
    super(owner, MoveType.FALL, 100);
    this.totalSteps = 7;
  }

  protected _action(): void {
    this.keepDistance();
  }
}

