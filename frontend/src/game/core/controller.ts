import { Arena, type ArenaOptions } from './arena';
import { type ArenaType as ArenaTypeValue } from './arenaTypes';
import { Orientation } from './orientations';
import { MoveType } from './moveTypes';
import { Fighter } from '../fighters/fighter';

export interface GameCallbacks {
  attack?: (fighter: Fighter, opponent: Fighter, damage: number) => void;
  'game-end'?: (fighter: Fighter) => void;
  'player-connected'?: () => void;
}

export interface GameOptions {
  arena: {
    container: HTMLElement;
    arena: number;
    width?: number;
    height?: number;
  };
  fighters: Array<{ name: string }>;
  callbacks?: GameCallbacks;
}

export abstract class BaseController {
  public fighters: Fighter[] = [];
  protected opponents: Map<string, Fighter> = new Map();
  public arena: Arena;
  protected callbacks: GameCallbacks;

  constructor(options: GameOptions) {
    this.callbacks = options.callbacks || {};
    this.initializeFighters(options.fighters);
    const arenaOptions: ArenaOptions = {
      fighters: this.fighters,
      arena: options.arena.arena as ArenaTypeValue,
      width: options.arena.width,
      height: options.arena.height,
      container: options.arena.container,
      game: this
    };
    this.arena = new Arena(arenaOptions);
  }

  protected initializeFighters(fighters: Array<{ name: string }>): void {
    this.fighters = [];
    this.opponents = new Map();

    for (let i = 0; i < fighters.length; i += 1) {
      const current = fighters[i];
      const orientation = i === 0 ? Orientation.LEFT : Orientation.RIGHT;
      this.fighters.push(
        new Fighter({
          name: current.name,
          arena: undefined,
          orientation,
          game: this
        })
      );
    }
    if (this.fighters.length >= 2) {
      this.opponents.set(this.fighters[0].getName(), this.fighters[1]);
      this.opponents.set(this.fighters[1].getName(), this.fighters[0]);
    }
  }

  getOpponent(f: Fighter): Fighter {
    const opponent = this.opponents.get(f.getName());
    if (!opponent) {
      throw new Error('Opponent not found');
    }
    return opponent;
  }

  init(promise: GamePromise): void {
    let current = 0;
    const total = this.fighters.length;
    const self = this;

    for (let i = 0; i < this.fighters.length; i += 1) {
      const f = this.fighters[i];
      f.init(() => {
        f.setMove(MoveType.STAND);
        current += 1;
        if (current === total) {
          self.arena.init();
          self.setFightersArena();
          self.initialize();
          promise.initialized();
        }
      });
    }
  }

  protected abstract initialize(): void;

  protected setFightersArena(): void {
    for (let i = 0; i < this.fighters.length; i += 1) {
      const f = this.fighters[i];
      f.setArena(this.arena);
    }
    this.fighters[1].setX(940);
  }

  fighterAttacked(fighter: Fighter, damage: number): void {
    const opponent = this.getOpponent(fighter);
    const opponentLife = opponent.getLife();

    if (
      this.requiredDistance(fighter, opponent) &&
      this.attackCompatible(fighter.getMove().type, opponent.getMove().type)
    ) {
      opponent.endureAttack(damage, fighter.getMove().type);
      const callback = this.callbacks.attack;
      if (typeof callback === 'function') {
        callback.call(null, fighter, opponent, opponentLife - opponent.getLife());
      }
    }
  }

  protected attackCompatible(attack: MoveType, opponentStand: MoveType): boolean {
    if (opponentStand === MoveType.SQUAT) {
      if (attack !== MoveType.LOW_PUNCH && attack !== MoveType.LOW_KICK) {
        return false;
      }
    }
    return true;
  }

  protected requiredDistance(attacker: Fighter, opponent: Fighter): boolean {
    const fMiddle = attacker.getX() + attacker.getWidth() / 2;
    const oMiddle = opponent.getX() + opponent.getWidth() / 2;
    const distance = Math.abs(fMiddle - oMiddle);
    const type = attacker.getMove().type;
    const width = opponent.getWidth();

    if (distance <= width) {
      return true;
    }
    if (type === MoveType.UPPERCUT && distance <= width * 1.2) {
      return true;
    }
    if (
      (type === MoveType.BACKWARD_JUMP_KICK ||
        type === MoveType.FORWARD_JUMP_KICK ||
        type === MoveType.FORWARD_JUMP_PUNCH ||
        type === MoveType.BACKWARD_JUMP_PUNCH) &&
      distance <= width * 1.5
    ) {
      return true;
    }
    return false;
  }

  fighterDead(fighter: Fighter): void {
    const opponent = this.getOpponent(fighter);
    const callback = this.callbacks['game-end'];
    opponent.getMove().stop();
    opponent.setMove(MoveType.WIN);
    if (typeof callback === 'function') {
      callback.call(null, fighter);
    }
  }

  reset(): void {
    this.fighters.forEach((f) => {
      f.getMove().stop();
    });
    this.fighters = [];
    this.opponents = new Map();
    this.arena.destroy();
    this.arena = undefined as any;
    this.callbacks = {};
  }
}

export class GamePromise {
  private callbacks: Array<() => void> = [];

  initialized(): void {
    this.callbacks.forEach((c) => {
      if (typeof c === 'function') {
        c();
      }
    });
  }

  ready(callback: () => void): void {
    this.callbacks.push(callback);
  }
}
