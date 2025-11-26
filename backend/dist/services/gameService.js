"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameCollection = exports.Game = exports.Messages = void 0;
exports.Messages = {
    EVENT: 'event',
    LIFE_UPDATE: 'life-update',
    POSITION_UPDATE: 'position-update',
    PLAYER_CONNECTED: 'player-connected'
};
class Game {
    constructor(id, gameCollection) {
        this.players = [];
        this.id = id;
        this.gameCollection = gameCollection;
    }
    getId() {
        return this.id;
    }
    addPlayer(p) {
        if (this.players.length > 1) {
            return false;
        }
        this.players.push(p);
        if (this.players.length > 1) {
            this.addHandlers();
            this.players[0].emit(exports.Messages.PLAYER_CONNECTED, 0);
        }
        return true;
    }
    addHandlers() {
        const p1 = this.players[0];
        const p2 = this.players[1];
        const m = exports.Messages;
        const self = this;
        p1.on(m.EVENT, (data) => {
            p2.emit(m.EVENT, data);
        });
        p1.on(m.LIFE_UPDATE, (data) => {
            p2.emit(m.LIFE_UPDATE, data);
        });
        p1.on(m.POSITION_UPDATE, (data) => {
            p2.emit(m.POSITION_UPDATE, data);
        });
        p2.on(m.EVENT, (data) => {
            p1.emit(m.EVENT, data);
        });
        p2.on(m.LIFE_UPDATE, (data) => {
            p1.emit(m.LIFE_UPDATE, data);
        });
        p2.on(m.POSITION_UPDATE, (data) => {
            p1.emit(m.POSITION_UPDATE, data);
        });
        p1.on('disconnect', () => {
            self.endGame(0);
        });
        p2.on('disconnect', () => {
            self.endGame(1);
        });
    }
    endGame(playerOut) {
        if (!this.players.length)
            return;
        const opponent = +!playerOut;
        const opponentSocket = this.players[opponent];
        this.players = [];
        opponentSocket.disconnect();
        this.gameCollection.removeGame(this.id);
    }
}
exports.Game = Game;
class GameCollection {
    constructor() {
        this.games = {};
    }
    getGame(game) {
        return this.games[game];
    }
    createGame(id) {
        if (this.games[id]) {
            return false;
        }
        const game = new Game(id, this);
        this.games[id] = game;
        return true;
    }
    removeGame(id) {
        if (this.games[id]) {
            delete this.games[id];
            return true;
        }
        return false;
    }
}
exports.GameCollection = GameCollection;
//# sourceMappingURL=gameService.js.map