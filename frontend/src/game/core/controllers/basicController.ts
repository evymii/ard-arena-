import { BaseController, type GameOptions } from '../controller';
import { MoveType } from '../moveTypes';
import { Orientation } from '../orientations';
import type { Fighter } from '../../fighters/fighter';

export const KEYS = {
  RIGHT: 39,
  LEFT: 37,
  UP: 38,
  DOWN: 40,
  BLOCK: 16,
  HP: 65,
  LP: 83,
  LK: 68,
  HK: 70
} as const;

export class BasicController extends BaseController {
  private player: number = 0;
  private pressed: Record<number, boolean> = {};

  constructor(options: GameOptions) {
    super(options);
  }

  protected initialize(): void {
    this.player = 0;
    this.addHandlers();
  }

  private addHandlers(): void {
    const self = this;
    const f = this.fighters[this.player];

    document.addEventListener('keydown', (e) => {
      this.pressed[e.keyCode] = true;
      const move = this.getMove(this.pressed, KEYS, this.player);
      this.moveFighter(f, move);
    }, false);

    document.addEventListener('keyup', (e) => {
      delete this.pressed[e.keyCode];
      const move = this.getMove(this.pressed, KEYS, this.player);
      this.moveFighter(f, move);
    }, false);
  }

  private moveFighter(f: Fighter, m: MoveType | null): void {
    if (m) {
      f.setMove(m);
    }
  }

  private getMove(pressed: Record<number, boolean>, k: typeof KEYS, p: number): MoveType | null {
    const f = this.fighters[p];
    const leftOrient = Orientation.LEFT;
    const rightOrient = Orientation.RIGHT;
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
}

