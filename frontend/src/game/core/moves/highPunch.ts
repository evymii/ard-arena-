import { Attack } from './attack';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class HighPunch extends Attack {
  constructor(owner: Fighter) {
    super(owner, MoveType.HIGH_PUNCH, 5, 8);
  }
}

