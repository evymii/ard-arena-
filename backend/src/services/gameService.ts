import { Socket } from 'socket.io';

export const Messages = {
  EVENT: 'event',
  LIFE_UPDATE: 'life-update',
  POSITION_UPDATE: 'position-update',
  PLAYER_CONNECTED: 'player-connected'
} as const;

export class Game {
  private id: string;
  private gameCollection: GameCollection;
  private players: Socket[] = [];

  constructor(id: string, gameCollection: GameCollection) {
    this.id = id;
    this.gameCollection = gameCollection;
  }

  getId(): string {
    return this.id;
  }

  addPlayer(p: Socket): boolean {
    if (this.players.length > 1) {
      return false;
    }
    this.players.push(p);
    if (this.players.length > 1) {
      this.addHandlers();
      this.players[0].emit(Messages.PLAYER_CONNECTED, 0);
    }
    return true;
  }

  private addHandlers(): void {
    const p1 = this.players[0];
    const p2 = this.players[1];
    const m = Messages;
    const self = this;

    p1.on(m.EVENT, (data: any) => {
      p2.emit(m.EVENT, data);
    });

    p1.on(m.LIFE_UPDATE, (data: number) => {
      p2.emit(m.LIFE_UPDATE, data);
    });

    p1.on(m.POSITION_UPDATE, (data: { x: number; y: number }) => {
      p2.emit(m.POSITION_UPDATE, data);
    });

    p2.on(m.EVENT, (data: any) => {
      p1.emit(m.EVENT, data);
    });

    p2.on(m.LIFE_UPDATE, (data: number) => {
      p1.emit(m.LIFE_UPDATE, data);
    });

    p2.on(m.POSITION_UPDATE, (data: { x: number; y: number }) => {
      p1.emit(m.POSITION_UPDATE, data);
    });

    p1.on('disconnect', () => {
      self.endGame(0);
    });

    p2.on('disconnect', () => {
      self.endGame(1);
    });
  }

  endGame(playerOut: number): void {
    if (!this.players.length) return;
    const opponent = +!playerOut;
    const opponentSocket = this.players[opponent];
    this.players = [];
    opponentSocket.disconnect();
    this.gameCollection.removeGame(this.id);
  }
}

export class GameCollection {
  private games: Record<string, Game> = {};

  getGame(game: string): Game | undefined {
    return this.games[game];
  }

  createGame(id: string): boolean {
    if (this.games[id]) {
      return false;
    }
    const game = new Game(id, this);
    this.games[id] = game;
    return true;
  }

  removeGame(id: string): boolean {
    if (this.games[id]) {
      delete this.games[id];
      return true;
    }
    return false;
  }
}

