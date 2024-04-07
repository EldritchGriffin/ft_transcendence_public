import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Server } from 'socket.io';
import { ChannelGateway } from 'src/channel/channel.gateway';
import { last } from 'rxjs';

interface Game {
  intervalId?: NodeJS.Timeout;
  gameId: string;
  ballSpeed: number;
  ballDirection: {
    x: number;
    y: number;
  };
  ballPosition: {
    x: number;
    y: number;
  };
  player1: {
    id: string;
    position: {
      x: number;
      y: number;
    };
    score: number;
  };
  player2: {
    id: string;
    position: {
      x: number;
      y: number;
    };
    score: number;
  };
  result: number;
  startedAt: Date;
  finishedAt: Date;
  status: string;
  expectedPlayer: string;
  gameMode: string;
}

const getspeed = (mode: string) => {
  switch (mode) {
    case 'easy':
      return 0.001;
    case 'medium':
      return 0.0013;
    case 'hard':
      return 0.0017;
    default:
      return 0;
  }
};

@Injectable()
export class gameService {
  private random = new Map<string, Game>();
  private invited = new Map<string, Game>();

  constructor(private prisma: PrismaService) {}

  private virtualCanvas = { width: 1, height: 1 };
  private paddle = { width: 1 / 25, height: 1 / 4 };
  private ball = { radius: 1 / 40 };

  leaveGame(username: string) {
    this.invited.forEach((game, gameId) => {
      if (game.status === 'ready') {
        if (game.player1.id === username) {
          game.status = 'finished';
          game.player1.score = 0;
          game.player2.score = 5;
        } else if (game.player2.id === username) {
          game.status = 'finished';
          game.player2.score = 0;
          game.player1.score = 5;
        }
      }
    });
    this.random.forEach((game, gameId) => {
      if (game.status === 'ready') {
        if (game.player1.id === username) {
          game.status = 'finished';
          game.player1.score = 0;
          game.player2.score = 5;
        } else if (game.player2.id === username) {
          game.status = 'finished';
          game.player2.score = 0;
          game.player1.score = 5;
        }
      }
    });
  }
  clearDanglingGames(username: string) {
    this.invited.forEach((game, gameId) => {
      if (game.status === 'waiting' && game.player1.id === username) {
        this.invited.delete(gameId);
      }
    });
    this.random.forEach((game, gameId) => {
      if (game.status === 'waiting' && game.player1.id === username) {
        this.random.delete(gameId);
      }
    });
  }

  async joinRandomGame(username: string, mode: string) {
    if (!['easy', 'medium', 'hard'].includes(mode)) return null;
    const modeFiltered = Array.from(this.random.entries()).filter(
      ([gameId, game]) => game.gameMode === mode && game.status === 'waiting',
    );
    if (modeFiltered.length === 0) {
      const speed = getspeed(mode);
      const gameId = randomBytes(16).toString('hex');
      const game: Game = {
        gameId: gameId,
        ballSpeed: speed,
        ballDirection: { x: 0, y: 0 },
        ballPosition: { x: 0.5, y: 0.5 },
        player1: {
          id: username,
          position: { x: 0.05, y: 0.5 },
          score: 0,
        },
        player2: null,
        result: 0,
        startedAt: null,
        finishedAt: null,
        status: 'waiting',
        expectedPlayer: null,
        gameMode: mode,
      };
      this.random.set(gameId, game);
      return gameId;
    } else {
      const [gameId, game] = modeFiltered[0];
      game.player2 = {
        id: username,
        position: { x: 0.95, y: 0.5 },
        score: 0,
      };
      game.status = 'ready';
      game.startedAt = new Date();
      this.resetBall(game);
      this.random.set(gameId, game);
      return gameId;
    }
  }

  async inviteToGame(username: string, expectedPlayer: string, mode: string) {
    const expectedPlayerUser = await this.prisma.user.findUnique({
      where: { intraLogin: expectedPlayer },
      select: { status: true },
    });
    if (!expectedPlayerUser) {
      return null;
    }
    if (expectedPlayerUser.status !== 'online' || expectedPlayer === username) {
      return null;
    }
    const gameId = randomBytes(16).toString('hex');
    const game: Game = {
      gameId: gameId,
      ballSpeed: getspeed(mode),
      ballDirection: { x: 0, y: 0 },
      ballPosition: { x: 0.5, y: 0.5 },
      player1: {
        id: username,
        position: { x: 0.05, y: 0.5 },
        score: 0,
      },
      player2: null,
      result: 0,
      startedAt: null,
      finishedAt: null,
      status: 'waiting',
      expectedPlayer: expectedPlayer,
      gameMode: mode,
    };
    this.invited.set(gameId, game);

    return gameId;
  }
  async joinSpecificGame(username: string, gameId: string) {
    const game = this.invited.get(gameId);
    if (game) {
      if (game.expectedPlayer !== username) {
        return null;
      }
      game.player2 = {
        id: username,
        position: { x: 0.95, y: 0.5 },
        score: 0,
      };
      game.status = 'ready';
      game.startedAt = new Date();
      this.resetBall(game);
      this.invited.set(gameId, game);
      return gameId;
    }
  }
  joinGame(
    username: string,
    payload: {
      gameId: string | null;
      mode: string | null;
      expectedPlayer: string | null;
    },
  ) {
    if (!payload.gameId && !payload.expectedPlayer && !payload.mode) {
      return null;
    }
    if (!payload.gameId) {
      if (!payload.expectedPlayer) {
        return this.joinRandomGame(username, payload.mode);
      } else {
        return this.inviteToGame(
          username,
          payload.expectedPlayer,
          payload.mode,
        );
      }
    } else {
      return this.joinSpecificGame(username, payload.gameId);
    }
  }
  getGame(gameId: string) {
    const game = this.invited.get(gameId);
    if (game) {
      return game;
    }
    const game2 = this.random.get(gameId);
    if (game2) {
      return game2;
    }
    return null;
  }

  resetBall(game: Game) {
    if (game) {
      game.ballPosition.x = 0.5;
      game.ballPosition.y = 0.5;
      game.ballDirection.x = Math.random() * 2 - 1;
      game.ballDirection.y = 0;
    }
  }
  checkSideCollisions(game: Game) {
    if (game) {
      if (game.ballPosition.y < 0) {
        game.ballPosition.y = 0;
        game.ballDirection.y = -game.ballDirection.y;
      }
      if (game.ballPosition.y > 1) {
        game.ballPosition.y = 1;
        game.ballDirection.y = -game.ballDirection.y;
      }
      if (game.ballPosition.x < 0) {
        this.resetBall(game);
        game.player2.score += 1;
      }
      if (game.ballPosition.x > 1) {
        this.resetBall(game);
        game.player1.score += 1;
      }
    }
  }

  normalize(x: number, y: number) {
    const length = Math.sqrt(x * x + y * y);
    return { x: x / length, y: y / length };
  }

  calculateBallPosition(game: Game, delta) {
    if (game) {
      const normalized = this.normalize(
        game.ballDirection.x,
        game.ballDirection.y,
      );

      const adjustedSpeed = game.ballSpeed * delta;

      game.ballPosition.x += normalized.x * adjustedSpeed;
      game.ballPosition.y += normalized.y * adjustedSpeed;
    }
  }

  isRectColliding(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  calculateBallY(paddlePosition, ballPosition) {
    const relativePosition =
      (ballPosition.y - paddlePosition.y) / (this.paddle.height / 2);

    const clampedValue = Math.min(Math.max(relativePosition, -0.3), 0.3);

    if (clampedValue > 0.3) {
      return 0.3;
    }
    if (clampedValue < -0.3) {
      return -0.3;
    }
    return clampedValue;
  }

  checkPaddleCollision(game: Game) {
    if (game) {
      const ball = {
        x: game.ballPosition.x - this.ball.radius,
        y: game.ballPosition.y - this.ball.radius,
        width: this.ball.radius * 2,
        height: this.ball.radius * 2,
      };
      const paddle1 = {
        x: game.player1.position.x - this.paddle.width / 2,
        y: game.player1.position.y - this.paddle.height / 2,
        width: this.paddle.width,
        height: this.paddle.height,
      };
      const paddle2 = {
        x: game.player2.position.x - this.paddle.width / 2,
        y: game.player2.position.y - this.paddle.height / 2,
        width: this.paddle.width,
        height: this.paddle.height,
      };
      if (this.isRectColliding(ball, paddle1)) {
        game.ballDirection.x = -game.ballDirection.x;
        game.ballDirection.y = this.calculateBallY(
          game.player1.position,
          game.ballPosition,
        );
        game.ballPosition.x = paddle1.x + this.paddle.width + this.ball.radius;
      }
      if (this.isRectColliding(ball, paddle2)) {
        game.ballDirection.x = -game.ballDirection.x;
        game.ballDirection.y = this.calculateBallY(
          game.player2.position,
          game.ballPosition,
        );
        game.ballPosition.x = paddle2.x - this.paddle.width;
      }
    }
  }

  checkWinCondition(game: Game) {
    if (game) {
      if (game.player1.score === 5) {
        game.result = 1;
        game.finishedAt = new Date();
        game.status = 'finished';
      }
      if (game.player2.score === 5) {
        game.result = 2;
        game.finishedAt = new Date();
        game.status = 'finished';
      }
    }
  }

  move(data: { gameId: string; username: string; position: any }) {
    const game = this.getGame(data.gameId);
    if (game) {
      if (game.player1.id === data.username) {
        game.player1.position.y = data.position.y;
      } else if (game.player2.id === data.username) {
        game.player2.position.y = data.position.y;
      }
    }
  }
  updateGame(game: Game, delta: number, server: Server) {
    if (game) {
      this.calculateBallPosition(game, delta);
      this.checkSideCollisions(game);
      this.checkPaddleCollision(game);
      this.checkWinCondition(game);
      this.afterGameFinished(game, server);
      server.to(game.gameId).emit('gameUpdate', game);
    }
  }

  async createDatabaseEntry(game: Game) {
    const currUser1 = await this.prisma.user.findUnique({
      where: { intraLogin: game.player1.id },
    });
    const currUser2 = await this.prisma.user.findUnique({
      where: { intraLogin: game.player2.id },
    });
    var result = game.player1.score - game.player2.score;
    const currgame = await this.prisma.games.create({
      data: {
        gameId: game.gameId,
        players: {
          connect: [
            { intraLogin: game.player1.id },
            { intraLogin: game.player2.id },
          ],
        },
        player1: game.player1.id,
        player2: game.player2.id,
        result: result,
        startedAt: game.startedAt,
        finishedAt: new Date(),
      },
      include: {
        players: true,
      },
    });
    result = Math.abs(result);
    if (game.player1.score > game.player2.score) {
      await this.prisma.user.update({
        where: { intraLogin: game.player1.id },
        data: {
          score: currUser1.score + 3 * result,
        },
      });
      if (currUser2.score >= result) {
        await this.prisma.user.update({
          where: { intraLogin: game.player2.id },
          data: {
            score: currUser2.score - result,
          },
        });
      } else {
        await this.prisma.user.update({
          where: { intraLogin: game.player2.id },
          data: {
            score: 0,
          },
        });
      }
    } else {
      await this.prisma.user.update({
        where: { intraLogin: game.player2.id },
        data: {
          score: currUser2.score + 3 * result,
        },
      });
      if (currUser1.score >= result) {
        await this.prisma.user.update({
          where: { intraLogin: game.player1.id },
          data: {
            score: currUser1.score - result,
          },
        });
      } else {
        await this.prisma.user.update({
          where: { intraLogin: game.player1.id },
          data: {
            score: 0,
          },
        });
      }
    }
  }
  afterGameFinished(game: Game, server: Server) {
    if (game.status === 'finished') {
      server.to(game.gameId).emit('gameFinished', game);
      clearInterval(game.intervalId);
      this.createDatabaseEntry(game);
      this.invited.delete(game.gameId);
      this.random.delete(game.gameId);
    }
  }
  startGameLoop(gameId: string, server: Server) {
    const game = this.getGame(gameId);
    if (game) {
      let lastFrameTime = Date.now();
      game.intervalId = setInterval(() => {
        const currFrame = Date.now();
        const delta = currFrame - lastFrameTime;
        lastFrameTime = currFrame;
        this.updateGame(game, delta, server);
      }, 10);
    }
  }
}
