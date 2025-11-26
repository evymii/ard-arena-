import { BaseController, GamePromise, type GameOptions } from './core/controller';
import { BasicController } from './core/controllers/basicController';
import { MultiplayerController } from './core/controllers/multiplayerController';
import { NetworkController, type NetworkGameOptions } from './core/controllers/networkController';

export type GameType = 'basic' | 'network' | 'multiplayer';

export interface StartOptions extends GameOptions {
  gameType?: GameType;
  isHost?: boolean;
  gameName?: string;
  transport?: any;
}

let game: BaseController | null = null;

export function start(options: StartOptions): GamePromise {
  const type = (options.gameType || 'basic').toLowerCase() as GameType;
  const promise = new GamePromise();

  switch (type) {
    case 'basic':
      game = new BasicController(options);
      break;
    case 'network':
      game = new NetworkController(options as NetworkGameOptions);
      break;
    case 'multiplayer':
      game = new MultiplayerController(options);
      break;
    default:
      game = new BasicController(options);
  }

  game.init(promise);
  return promise;
}

export function reset(): void {
  if (game) {
    game.reset();
    game = null;
  }
}

export function getGame(): BaseController | null {
  return game;
}

