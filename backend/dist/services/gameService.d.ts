import { Socket } from "socket.io";
export declare const Messages: {
    readonly EVENT: "event";
    readonly LIFE_UPDATE: "life-update";
    readonly POSITION_UPDATE: "position-update";
    readonly PLAYER_CONNECTED: "player-connected";
};
export declare class Game {
    private id;
    private gameCollection;
    private players;
    constructor(id: string, gameCollection: GameCollection);
    getId(): string;
    addPlayer(p: Socket): boolean;
    private addHandlers;
    endGame(playerOut: number): void;
}
export declare class GameCollection {
    private games;
    getGame(game: string): Game | undefined;
    createGame(id: string): boolean;
    removeGame(id: string): boolean;
}
//# sourceMappingURL=gameService.d.ts.map