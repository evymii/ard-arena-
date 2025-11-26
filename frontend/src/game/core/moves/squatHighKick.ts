import { Attack } from './attack';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class SquatHighKick extends Attack {
  constructor(owner: Fighter) {
    super(owner, MoveType.SQUAT_HIGH_KICK, 4, 6, 70, MoveType.SQUAT, 2);
  }
}
