import { type Orientation as OrientationType } from '../core/orientations';
import { MoveType } from '../core/moveTypes';
import { CONFIG } from '../core/config';
import { Move } from '../core/move';
import { Stand } from '../core/moves/stand';
import { Walk } from '../core/moves/walk';
import { WalkBack } from '../core/moves/walkBack';
import { Squat } from '../core/moves/squat';
import { Block } from '../core/moves/block';
import { StandUp } from '../core/moves/standUp';
import { AttractiveStandUp } from '../core/moves/attractiveStandUp';
import { HighKick } from '../core/moves/highKick';
import { LowKick } from '../core/moves/lowKick';
import { SpinKick } from '../core/moves/spinKick';
import { LowPunch } from '../core/moves/lowPunch';
import { HighPunch } from '../core/moves/highPunch';
import { Uppercut } from '../core/moves/uppercut';
import { SquatLowKick } from '../core/moves/squatLowKick';
import { SquatHighKick } from '../core/moves/squatHighKick';
import { SquatLowPunch } from '../core/moves/squatLowPunch';
import { Fall } from '../core/moves/fall';
import { KnockDown } from '../core/moves/knockDown';
import { Win } from '../core/moves/win';
import { Jump } from '../core/moves/jump';
import { JumpKick, JumpPunch } from '../core/moves/jumpAttack';
import { ForwardJump } from '../core/moves/forwardJump';
import { BackwardJump } from '../core/moves/backwardJump';
import { Endure } from '../core/moves/endure';
import { SquatEndure } from '../core/moves/squatEndure';
import type { Arena } from '../core/arena';
import type { BaseController } from '../core/controller';

export interface FighterOptions {
  name: string;
  arena?: Arena;
  orientation: OrientationType;
  game: BaseController;
}

export class Fighter {
  private name: string;
  private arena?: Arena;
  private game: BaseController;
  private life: number = 100;
  private orientation: OrientationType;
  private width: number = 30;
  private height: number = 60;
  private locked: boolean = false;
  private position: { x: number; y: number };
  private currentState?: HTMLImageElement;
  private currentMove?: Move;
  public moves: Record<MoveType, Move> = {} as Record<MoveType, Move>;

  constructor(options: FighterOptions) {
    const name = options.name.toLowerCase();
    if (name !== 'subzero' && name !== 'kano') {
      throw new Error('Invalid fighter name!');
    }
    this.name = name;
    this.arena = options.arena;
    this.game = options.game;
    this.orientation = options.orientation;
    this.position = {
      x: 50,
      y: CONFIG.PLAYER_TOP
    };
  }

  init(callback: () => void): void {
    this.moves[MoveType.STAND] = new Stand(this);
    this.moves[MoveType.WALK] = new Walk(this);
    this.moves[MoveType.WALK_BACKWARD] = new WalkBack(this);
    this.moves[MoveType.SQUAT] = new Squat(this);
    this.moves[MoveType.BLOCK] = new Block(this);
    this.moves[MoveType.STAND_UP] = new StandUp(this);
    this.moves[MoveType.ATTRACTIVE_STAND_UP] = new AttractiveStandUp(this);
    this.moves[MoveType.HIGH_KICK] = new HighKick(this);
    this.moves[MoveType.LOW_KICK] = new LowKick(this);
    this.moves[MoveType.SPIN_KICK] = new SpinKick(this);
    this.moves[MoveType.LOW_PUNCH] = new LowPunch(this);
    this.moves[MoveType.HIGH_PUNCH] = new HighPunch(this);
    this.moves[MoveType.UPPERCUT] = new Uppercut(this);
    this.moves[MoveType.SQUAT_LOW_KICK] = new SquatLowKick(this);
    this.moves[MoveType.SQUAT_HIGH_KICK] = new SquatHighKick(this);
    this.moves[MoveType.SQUAT_LOW_PUNCH] = new SquatLowPunch(this);
    this.moves[MoveType.FALL] = new Fall(this);
    this.moves[MoveType.KNOCK_DOWN] = new KnockDown(this);
    this.moves[MoveType.WIN] = new Win(this);
    this.moves[MoveType.JUMP] = new Jump(this);
    this.moves[MoveType.FORWARD_JUMP_KICK] = new JumpKick(this, true);
    this.moves[MoveType.BACKWARD_JUMP_KICK] = new JumpKick(this, false);
    this.moves[MoveType.FORWARD_JUMP_PUNCH] = new JumpPunch(this, true);
    this.moves[MoveType.BACKWARD_JUMP_PUNCH] = new JumpPunch(this, false);
    this.moves[MoveType.ENDURE] = new Endure(this);
    this.moves[MoveType.SQUAT_ENDURE] = new SquatEndure(this);
    this.moves[MoveType.FORWARD_JUMP] = new ForwardJump(this);
    this.moves[MoveType.BACKWARD_JUMP] = new BackwardJump(this);

    let initialized = 0;
    const total = Object.keys(this.moves).length;

    for (const moveKey in this.moves) {
      const move = this.moves[moveKey as MoveType];
      move.init(() => {
        initialized += 1;
        if (initialized === total) {
          if (typeof callback === 'function') {
            callback();
          }
        }
      });
    }
  }

  isJumping(): boolean {
    if (!this.currentMove) return false;
    const move = this.currentMove.type;
    return (
      move === MoveType.JUMP ||
      move === MoveType.BACKWARD_JUMP ||
      move === MoveType.FORWARD_JUMP ||
      move === MoveType.FORWARD_JUMP_KICK ||
      move === MoveType.BACKWARD_JUMP_KICK ||
      move === MoveType.FORWARD_JUMP_PUNCH ||
      move === MoveType.BACKWARD_JUMP_PUNCH
    );
  }

  getName(): string {
    return this.name;
  }

  setArena(arena: Arena): void {
    this.arena = arena;
  }

  getWidth(): number {
    if (this.currentState && this.currentState.width) {
      return this.currentState.width;
    }
    return this.width;
  }

  getVisibleWidth(): number {
    return this.width;
  }

  getVisibleHeight(): number {
    if (this.currentState && this.currentState.height) {
      return this.currentState.height;
    }
    return this.height;
  }

  setHeight(height: number): void {
    this.height = height;
  }

  setWidth(width: number): void {
    this.width = width;
  }

  setOrientation(orientation: OrientationType): void {
    this.orientation = orientation;
  }

  getOrientation(): OrientationType {
    return this.orientation;
  }

  refresh(): void {
    if (this.arena && typeof this.arena.refresh === 'function') {
      this.arena.refresh();
    }
  }

  getX(): number {
    return this.position.x;
  }

  lock(): void {
    this.locked = true;
  }

  unlock(): void {
    this.locked = false;
  }

  getY(): number {
    return this.position.y;
  }

  setX(x: number): void {
    if (this.arena) {
      this.position.x = this.arena.moveFighter(this, { x, y: this.getY() }).x;
    } else {
      this.position.x = x;
    }
  }

  setY(y: number): void {
    this.position.y = y;
  }

  setState(state: HTMLImageElement): void {
    this.currentState = state;
  }

  getState(): HTMLImageElement | undefined {
    return this.currentState;
  }

  attack(damage: number): void {
    this.game.fighterAttacked(this, damage);
  }

  endureAttack(damage: number, attackType: MoveType): number {
    if (this.getMove().type === MoveType.BLOCK) {
      damage *= CONFIG.BLOCK_DAMAGE;
    } else {
      this.unlock();
      if (this.getMove().type === MoveType.SQUAT) {
        this.setMove(MoveType.SQUAT_ENDURE);
      } else {
        if (attackType === MoveType.UPPERCUT || attackType === MoveType.SPIN_KICK) {
          this.setMove(MoveType.KNOCK_DOWN);
        } else {
          this.setMove(MoveType.ENDURE);
        }
      }
    }
    this.setLife(this.getLife() - damage);
    if (this.getLife() === 0) {
      this.game.fighterDead(this);
      this.unlock();
      this.setMove(MoveType.FALL);
    }
    return this.getLife();
  }

  setLife(life: number): void {
    this.life = Math.max(life, 0);
  }

  getLife(): number {
    return this.life;
  }

  getBottom(): number {
    if (!this.arena || !this.currentState) return 0;
    const bottomY = this.currentState.height + this.getY();
    return this.arena.height - bottomY;
  }

  setMove(move: MoveType, step?: number): void {
    step = step || 0;
    const currentMove = this.currentMove;

    if (!(move in this.moves)) {
      throw new Error(`This player does not have the move - ${move}`);
    }

    if (this.currentMove && this.currentMove.type === move) {
      return;
    }

    if (
      move === MoveType.FORWARD_JUMP_KICK ||
      move === MoveType.BACKWARD_JUMP_KICK ||
      move === MoveType.FORWARD_JUMP_PUNCH ||
      move === MoveType.BACKWARD_JUMP_PUNCH
    ) {
      if (currentMove && (currentMove as any)._currentStep >= (currentMove as any)._totalSteps / 2) {
        this.currentMove?.stop();
        this.unlock();
        this.currentMove = this.moves[move];
        (this.currentMove as any)._totalSteps = (currentMove as any)._totalSteps - (currentMove as any)._currentStep;
      }
    }

    if (this.locked && move !== MoveType.WIN) {
      return;
    }

    if (this.currentMove && typeof this.currentMove.stop === 'function') {
      this.currentMove.stop();
    }

    this.currentMove = this.moves[move];
    this.currentMove.go(step);
  }

  getMove(): Move {
    if (!this.currentMove) {
      throw new Error('No current move set');
    }
    return this.currentMove;
  }
}
