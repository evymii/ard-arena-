import { Attack } from './attack';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class LowPunch extends Attack {
  constructor(owner: Fighter) {
    super(owner, MoveType.LOW_PUNCH, 5, 5);
  }
}

