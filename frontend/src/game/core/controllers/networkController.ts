import { BaseController, type GameOptions } from '../controller';
import { MoveType } from '../moveTypes';
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
      const move = this.getMove(e.keyCode);
      this.moveFighter(f, move);
    }, false);

    document.addEventListener('keyup', (e) => {
      const move = this.getMove(e.keyCode);
      this.moveFighter(f, move);
    }, false);
  }

  private getMove(keyCode: number): MoveType | null {
    // Simplified - you can expand this based on your key mapping
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

