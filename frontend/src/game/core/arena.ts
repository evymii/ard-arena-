import { ArenaType, type ArenaType as ArenaTypeValue } from "./arenaTypes";
import { Orientation } from "./orientations";
import { MoveType } from "./moveTypes";
import { CONFIG } from "./config";
import type { Fighter } from "../fighters/fighter";
import type { BaseController } from "./controller";

export interface ArenaOptions {
  fighters: Fighter[];
  arena: ArenaTypeValue;
  width?: number;
  height?: number;
  container: HTMLElement;
  game: BaseController;
}

export class Arena {
  public width: number;
  public height: number;
  public arena: ArenaTypeValue;
  public fighters: Fighter[];
  private container: HTMLElement;
  private game: BaseController;
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;
  private texture?: HTMLImageElement;

  constructor(options: ArenaOptions) {
    this.width = options.width || CONFIG.ARENA_WIDTH;
    this.height = options.height || CONFIG.ARENA_HEIGHT;
    this.arena = options.arena || ArenaType.TOWER;
    this.fighters = options.fighters;
    this.container = options.container;
    this.game = options.game;
  }

  init(): void {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    this.container.appendChild(canvas);
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2d context");
    }
    this.context = context;
    this.canvas = canvas;
    this.refresh();
  }

  destroy(): void {
    if (this.canvas && this.container.contains(this.canvas)) {
      this.container.removeChild(this.canvas);
    }
    this.canvas = undefined;
    this.context = undefined;
    this.container = undefined as any;
    this.game = undefined as any;
    this.fighters = undefined as any;
    this.arena = undefined as any;
  }

  private drawArena(): void {
    if (!this.context) return;
    if (this.texture) {
      this.context.drawImage(this.texture, 0, 0, this.width, this.height);
    } else {
      const img = document.createElement("img");
      img.src = `${CONFIG.IMAGES}${CONFIG.ARENAS}${this.arena}/arena.png`;
      img.width = this.width;
      img.height = this.height;
      img.onload = () => {
        this.texture = img;
        if (this.context) {
          this.context.drawImage(img, 0, 0, this.width, this.height);
        }
      };
    }
  }

  refresh(): void {
    if (!this.context) return;
    this.drawArena();
    for (let i = 0; i < this.fighters.length; i += 1) {
      const f = this.fighters[i];
      const state = f.getState();
      if (state) {
        this.context.drawImage(state, f.getX(), f.getY());
      }
    }
  }

  moveFighter(
    fighter: Fighter,
    pos: { x: number; y: number }
  ): { x: number; y: number } {
    const opponent = this.game.getOpponent(fighter);
    const op = { x: opponent.getX(), y: opponent.getY() };
    const isOver = pos.y + fighter.getVisibleHeight() <= op.y;

    if (pos.x <= 0) {
      pos.x = 0;
    }
    if (pos.x >= this.width - fighter.getVisibleWidth()) {
      pos.x = this.width - fighter.getVisibleWidth();
    }

    if (!isOver) {
      if (fighter.getOrientation() === Orientation.LEFT) {
        if (pos.x + fighter.getVisibleWidth() > op.x) {
          pos = this.synchronizeFighters(pos, fighter, opponent);
        }
      } else {
        if (pos.x < op.x + opponent.getVisibleWidth()) {
          pos = this.synchronizeFighters(pos, fighter, opponent);
        }
      }
    }

    this.setFightersOrientation(fighter, opponent);
    return pos;
  }

  private synchronizeFighters(
    pos: { x: number; y: number },
    fighter: Fighter,
    opponent: Fighter
  ): { x: number; y: number } {
    const moveType = fighter.getMove().type;
    if (
      moveType === MoveType.FORWARD_JUMP ||
      moveType === MoveType.BACKWARD_JUMP
    ) {
      pos.x = fighter.getX();
      return pos;
    }
    let diff: number;
    if (fighter.getOrientation() === Orientation.LEFT) {
      diff = Math.min(
        this.width -
          (opponent.getX() +
            opponent.getVisibleWidth() +
            fighter.getVisibleWidth()),
        pos.x - fighter.getX()
      );
      pos.x = fighter.getX() + diff;
      if (diff > 0) {
        opponent.setX(opponent.getX() + diff);
      }
    } else {
      diff = Math.min(opponent.getX(), fighter.getX() - pos.x);
      if (diff > 0) {
        pos.x = fighter.getX() - diff;
        opponent.setX(opponent.getX() - diff);
        if (opponent.getX() + opponent.getWidth() > pos.x) {
          pos.x = opponent.getX() + opponent.getVisibleWidth();
        }
      } else {
        pos.x = fighter.getX();
        if (opponent.getX() + opponent.getWidth() > pos.x) {
          pos.x = opponent.getX() + opponent.getVisibleWidth();
        }
      }
    }
    return pos;
  }

  private setFightersOrientation(f1: Fighter, f2: Fighter): void {
    if (f1.getX() < f2.getX()) {
      f1.setOrientation(Orientation.LEFT);
      f2.setOrientation(Orientation.RIGHT);
    } else {
      f1.setOrientation(Orientation.RIGHT);
      f2.setOrientation(Orientation.LEFT);
    }
  }
}
