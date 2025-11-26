import { CycleMove } from '../cycleMove';
import { MoveType } from '../moveTypes';
import { CONFIG } from '../config';
import type { Fighter } from '../../fighters/fighter';

export class Stand extends CycleMove {
  constructor(owner: Fighter) {
    super(owner, MoveType.STAND, 9);
  }

  protected _beforeGo(): void {
    this.owner.setY(CONFIG.PLAYER_TOP);
  }
}

