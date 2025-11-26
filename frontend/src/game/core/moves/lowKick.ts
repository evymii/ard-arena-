import { Attack } from './attack';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class LowKick extends Attack {
  constructor(owner: Fighter) {
    super(owner, MoveType.LOW_KICK, 6, 6);
  }
}

