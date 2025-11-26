import { Attack } from './attack';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export class SpinKick extends Attack {
  constructor(owner: Fighter) {
    super(owner, MoveType.SPIN_KICK, 8, 13, 60, MoveType.STAND);
    (this as any).dontReturn = true;
  }
}
