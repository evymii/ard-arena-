import { BaseController, type GameOptions } from '../controller';
import { MoveType } from '../moveTypes';
import type { Fighter } from '../../fighters/fighter';

export const KEYS_P1 = {
  RIGHT: 74,
  LEFT: 71,
  UP: 89,
  DOWN: 72,
  BLOCK: 16,
  HP: 65,
  LP: 83,
  LK: 68,
  HK: 70
} as const;

export const KEYS_P2 = {
  RIGHT: 39,
  LEFT: 37,
  UP: 38,
  DOWN: 40,
  BLOCK: 17,
  HP: 80,
  LP: 219,
  LK: 221,
  HK: 220
} as const;

export class MultiplayerController extends BaseController {
  private pressed: Record<number, boolean> = {};

  constructor(options: GameOptions) {
    super(options);
  }

  protected initialize(): void {
    this.addHandlers();
  }

  private addHandlers(): void {
    const f1 = this.fighters[0];
    const f2 = this.fighters[1];

    document.addEventListener('keydown', (e) => {
      this.pressed[e.keyCode] = true;
      let move = this.getMove(this.pressed, KEYS_P1, 0);
      this.moveFighter(f1, move);
      move = this.getMove(this.pressed, KEYS_P2, 1);
      this.moveFighter(f2, move);
    }, false);

    document.addEventListener('keyup', (e) => {
      delete this.pressed[e.keyCode];
      let move = this.getMove(this.pressed, KEYS_P1, 0);
      this.moveFighter(f1, move);
      move = this.getMove(this.pressed, KEYS_P2, 1);
      this.moveFighter(f2, move);
    }, false);
  }

  private getMove(pressed: Record<number, boolean>, k: typeof KEYS_P1, p: number): MoveType | null {
    const f = this.fighters[p];
    const leftOrient = 'left' as const;
    const rightOrient = 'right' as const;
    const orient = f.getOrientation();

    if (f.getMove().type === MoveType.SQUAT && !pressed[k.DOWN]) {
      return MoveType.STAND_UP;
    }
    if (f.getMove().type === MoveType.BLOCK && !pressed[k.BLOCK]) {
      return MoveType.STAND;
    }
    if (Object.keys(pressed).length === 0) {
      return MoveType.STAND;
    }
    if (pressed[k.BLOCK]) {
      return MoveType.BLOCK;
    } else if (pressed[k.LEFT]) {
      if (pressed[k.UP]) {
        return MoveType.BACKWARD_JUMP;
      } else if (pressed[k.HK] && orient === leftOrient) {
        return MoveType.SPIN_KICK;
      }
      return MoveType.WALK_BACKWARD;
    } else if (pressed[k.RIGHT]) {
      if (pressed[k.UP]) {
        return MoveType.FORWARD_JUMP;
      } else if (pressed[k.HK] && orient === rightOrient) {
        return MoveType.SPIN_KICK;
      }
      return MoveType.WALK;
    } else if (pressed[k.DOWN]) {
      if (pressed[k.HP]) {
        return MoveType.UPPERCUT;
      } else if (pressed[k.LK]) {
        return MoveType.SQUAT_LOW_KICK;
      } else if (pressed[k.HK]) {
        return MoveType.SQUAT_HIGH_KICK;
      } else if (pressed[k.LP]) {
        return MoveType.SQUAT_LOW_PUNCH;
      }
      return MoveType.SQUAT;
    } else if (pressed[k.HK]) {
      if (f.getMove().type === MoveType.FORWARD_JUMP) {
        return MoveType.FORWARD_JUMP_KICK;
      } else if (f.getMove().type === MoveType.BACKWARD_JUMP) {
        return MoveType.BACKWARD_JUMP_KICK;
      }
      return MoveType.HIGH_KICK;
    } else if (pressed[k.UP]) {
      return MoveType.JUMP;
    } else if (pressed[k.LK]) {
      if (f.getMove().type === MoveType.FORWARD_JUMP) {
        return MoveType.FORWARD_JUMP_KICK;
      } else if (f.getMove().type === MoveType.BACKWARD_JUMP) {
        return MoveType.BACKWARD_JUMP_KICK;
      }
      return MoveType.LOW_KICK;
    } else if (pressed[k.LP]) {
      if (f.getMove().type === MoveType.FORWARD_JUMP) {
        return MoveType.FORWARD_JUMP_PUNCH;
      } else if (f.getMove().type === MoveType.BACKWARD_JUMP) {
        return MoveType.BACKWARD_JUMP_PUNCH;
      }
      return MoveType.LOW_PUNCH;
    } else if (pressed[k.HP]) {
      if (f.getMove().type === MoveType.FORWARD_JUMP) {
        return MoveType.FORWARD_JUMP_PUNCH;
      } else if (f.getMove().type === MoveType.BACKWARD_JUMP) {
        return MoveType.BACKWARD_JUMP_PUNCH;
      }
      return MoveType.HIGH_PUNCH;
    }
    return null;
  }

  private moveFighter(fighter: Fighter, move: MoveType | null): void {
    if (move) {
      fighter.setMove(move);
    }
  }
}

