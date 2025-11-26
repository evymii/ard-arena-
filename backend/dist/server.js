"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const gameService_1 = require("./services/gameService");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const games = new gameService_1.GameCollection();
app.use(express_1.default.static(__dirname + '/../../frontend/dist'));
const PORT = Number(process.env.PORT) || 55555;
// Set SO_REUSEADDR to allow immediate port reuse (handles TIME_WAIT state)
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});
// Enable SO_REUSEADDR before listening
server.on('listening', () => {
    const address = server.address();
    if (address && typeof address !== 'string') {
        server.setTimeout(0);
    }
});
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use!`);
        console.error(`\nTo kill the process, run:`);
        console.error(`   lsof -ti:${PORT} | xargs kill -9\n`);
        process.exit(1);
    }
    else {
        throw err;
    }
});
const Responses = {
    SUCCESS: 0,
    GAME_EXISTS: 1,
    GAME_NOT_EXISTS: 2,
    GAME_FULL: 3
};
const Requests = {
    CREATE_GAME: 'create-game',
    JOIN_GAME: 'join-game'
};
io.sockets.on('connection', (socket) => {
    socket.on(Requests.CREATE_GAME, (gameName) => {
        if (games.createGame(gameName)) {
            games.getGame(gameName)?.addPlayer(socket);
            socket.emit('response', Responses.SUCCESS);
        }
        else {
            socket.emit('response', Responses.GAME_EXISTS);
        }
    });
    socket.on(Requests.JOIN_GAME, (gameName) => {
        const game = games.getGame(gameName);
        if (!game) {
            socket.emit('response', Responses.GAME_NOT_EXISTS);
        }
        else {
            if (game.addPlayer(socket)) {
                socket.emit('response', Responses.SUCCESS);
            }
            else {
                socket.emit('response', Responses.GAME_FULL);
            }
        }
    });
});
//# sourceMappingURL=server.js.map