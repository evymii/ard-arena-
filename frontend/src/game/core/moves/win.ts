import { FiniteMove } from '../finiteMove';
import { MoveType } from '../moveTypes';
import { CONFIG } from '../config';
import type { Fighter } from '../../fighters/fighter';

export class Win extends FiniteMove {
  constructor(owner: Fighter) {
    super(owner, MoveType.WIN, 100);
    this.totalSteps = 10;
  }

  protected _action(): void {
    this.keepDistance();
  }

  protected _beforeGo(): void {
    this.owner.lock();
    this.owner.setY(CONFIG.PLAYER_TOP);
    this.bottom = this.owner.getBottom();
  }
}

