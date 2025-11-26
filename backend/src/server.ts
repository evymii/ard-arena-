import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameCollection, Messages } from './services/gameService';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const games = new GameCollection();

app.use(express.static(__dirname + '/../../frontend/dist'));

const PORT = process.env.PORT || 55555;

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

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`\nTo kill the process, run:`);
    console.error(`   lsof -ti:${PORT} | xargs kill -9\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

const Responses = {
  SUCCESS: 0,
  GAME_EXISTS: 1,
  GAME_NOT_EXISTS: 2,
  GAME_FULL: 3
} as const;

const Requests = {
  CREATE_GAME: 'create-game',
  JOIN_GAME: 'join-game'
} as const;

io.sockets.on('connection', (socket) => {
  socket.on(Requests.CREATE_GAME, (gameName: string) => {
    if (games.createGame(gameName)) {
      games.getGame(gameName)?.addPlayer(socket);
      socket.emit('response', Responses.SUCCESS);
    } else {
      socket.emit('response', Responses.GAME_EXISTS);
    }
  });

  socket.on(Requests.JOIN_GAME, (gameName: string) => {
    const game = games.getGame(gameName);
    if (!game) {
      socket.emit('response', Responses.GAME_NOT_EXISTS);
    } else {
      if (game.addPlayer(socket)) {
        socket.emit('response', Responses.SUCCESS);
      } else {
        socket.emit('response', Responses.GAME_FULL);
      }
    }
  });
});
