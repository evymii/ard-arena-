import { Attack } from './attack';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class SquatLowPunch extends Attack {
  constructor(owner: Fighter) {
    super(owner, MoveType.SQUAT_LOW_PUNCH, 3, 4, 70, MoveType.SQUAT, 2);
  }
}

