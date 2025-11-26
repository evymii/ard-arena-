import { BaseController, type GameOptions } from '../controller';
import { MoveType } from '../moveTypes';
import { KEYS } from './basicController';
import type { Fighter } from '../../fighters/fighter';
import type { Socket as SocketIOCSocket } from 'socket.io-client';

export type Socket = SocketIOCSocket;

export interface NetworkGameOptions extends GameOptions {
  isHost: boolean;
  gameName: string;
  transport?: Socket;
}

export const Messages = {
  EVENT: 'event',
  LIFE_UPDATE: 'life-update',
  POSITION_UPDATE: 'position-update',
  PLAYER_CONNECTED: 'player-connected'
} as const;

export const Requests = {
  CREATE_GAME: 'create-game',
  JOIN_GAME: 'join-game'
} as const;

export const Responses = {
  SUCCESS: 0,
  GAME_EXISTS: 1,
  GAME_NOT_EXISTS: 2,
  GAME_FULL: 3
} as const;

export class NetworkController extends BaseController {
  private isHost: boolean;
  private gameName: string;
  private transport?: Socket;
  private player: number = 0;
  private pressed: Record<number, boolean> = {};

  constructor(options: NetworkGameOptions) {
    super(options);
    this.isHost = options.isHost;
    this.gameName = options.gameName;
    this.transport = options.transport;
  }

  protected initialize(): void {
    if (this.isHost) {
      this.player = 1;
    } else {
      this.player = 0;
    }
    this.addHandlers();
    if (this.transport) {
      this.transport.on('connect', () => {
        if (this.isHost) {
          this.createGame();
        } else {
          this.joinGame();
        }
      });
      this.transport.on('response', (response: number) => {
        if (response !== Responses.SUCCESS) {
          alert('Error while connecting to the server.');
        }
      });
      this.transport.on('disconnect', () => {
        alert('Disconnected from the server.');
      });
    }
  }

  private addHandlers(): void {
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

  private getMove(pressed: Record<number, boolean>, k: typeof KEYS, p: number): MoveType | null {
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

  private createGame(): void {
    if (this.transport) {
      this.transport.emit(Requests.CREATE_GAME, this.gameName);
      this.addSocketHandlers();
    }
  }

  private joinGame(): void {
    if (this.transport) {
      this.transport.emit(Requests.JOIN_GAME, this.gameName);
      this.addSocketHandlers();
    }
  }

  private addSocketHandlers(): void {
    if (!this.transport) return;
    const opponent = this.fighters[+!this.player];
    const f = this.fighters[this.player];
    const self = this;

    this.transport.on(Messages.EVENT, (move: MoveType) => {
      opponent.setMove(move);
    });

    this.transport.on(Messages.LIFE_UPDATE, (data: number) => {
      opponent.setLife(data);
    });

    this.transport.on(Messages.POSITION_UPDATE, (data: { x: number; y: number }) => {
      opponent.setX(data.x);
      opponent.setY(data.y);
    });

    setInterval(() => {
      if (self.transport) {
        self.transport.emit(Messages.LIFE_UPDATE, f.getLife());
      }
    }, 2000);

    setInterval(() => {
      if (!f.isJumping() && self.transport) {
        self.transport.emit(Messages.POSITION_UPDATE, {
          x: f.getX(),
          y: f.getY()
        });
      }
    }, 500);

    if (this.isHost) {
      this.transport.on(Messages.PLAYER_CONNECTED, () => {
        const callback = (this as any).callbacks['player-connected'];
        if (typeof callback === 'function') {
          callback();
        }
      });
    }
  }

  protected moveFighter(f: Fighter, m: MoveType | null): void {
    if (m && this.transport) {
      this.transport.emit(Messages.EVENT, m);
      f.setMove(m);
    }
  }
}
