import { Attack } from './attack';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class HighKick extends Attack {
  constructor(owner: Fighter) {
    super(owner, MoveType.HIGH_KICK, 7, 10);
  }
}
