import React, { useEffect } from "react";
import * as PIXI from "pixi.js";
import io, { Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../(contexts)/userContext";
import { Lilita_One } from "next/font/google";

let p1score = 0;
let p2score = 0;
let gamestarted = false;

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

const Font = Lilita_One({
  subsets: ["latin"],
  weight: "400",
});

const textStyle = new PIXI.TextStyle({
  fontFamily: Font.style.fontFamily,
});

function initBall(app: PIXI.Application) {
  const ballgfx = new PIXI.Graphics();
  ballgfx.beginFill(0xdddddd);
  const ballRadius = Math.min(app.screen.width, app.screen.height) / 40; 
  ballgfx.drawCircle(0, 0, 100);
  ballgfx.endFill();
  const texture = app.renderer.generateTexture(ballgfx);
  const ball = new PIXI.Sprite(texture);
  ballgfx.destroy();
  ball.anchor.set(0.5);
  ball.eventMode = "dynamic";
  return ball;
}

function initPaddle(app: PIXI.Application) {
  const paddlegfx = new PIXI.Graphics();
  paddlegfx.beginFill(0xdddddd);
  const paddleWidth = Math.min(app.screen.width, app.screen.height) / 25;
  const paddleHeight = Math.min(app.screen.width, app.screen.height) / 4;
  paddlegfx.drawRect(0, 0, 500, 100);
  paddlegfx.endFill();
  const texture = app.renderer.generateTexture(paddlegfx);
  const paddle = new PIXI.Sprite(texture);
  paddlegfx.destroy();
  paddle.anchor.set(0.5);
  paddle.eventMode = "dynamic";
  return paddle;
}

function initText(app: PIXI.Application, score: number) {
  const text = new PIXI.Text(score.toString(), {
    fontFamily: Font.style.fontFamily,
    fontSize: Math.min(app.screen.width, app.screen.height) / 15,
    fill: 0xdddddd,
    align: "center",
  });
  text.anchor.set(0.5);
  text.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  return text;
}

function stageAssets(app: PIXI.Application, assets: any) {
  app.stage.addChild(assets.Ball);
  app.stage.addChild(assets.Paddle1);
  app.stage.addChild(assets.Paddle2);
  app.stage.addChild(assets.Score1);
  app.stage.addChild(assets.Score2);
  app.stage.addChild(assets.halfline);
}

function initAssets(app: PIXI.Application) {
  const halfline = new PIXI.Graphics();
  halfline.beginFill(0xdddddd);
  halfline.drawRect(0, 0, 5, app.screen.height);
  halfline.endFill();
  const ball = initBall(app);
  const paddle1 = initPaddle(app);
  const paddle2 = initPaddle(app);
  const score1 = initText(app, p1score);
  const score2 = initText(app, p2score);
  const Waiting = new PIXI.Text("Waiting for opponent", textStyle);
  Waiting.anchor.set(0.5);
  Waiting.x = app.screen.width / 2;
  Waiting.y = app.screen.height / 2;

  score1.x = app.screen.width / 4;
  score1.y = app.screen.height / 4;
  score2.x = (app.screen.width / 4) * 3;
  score2.y = app.screen.height / 4;

  halfline.x = app.screen.width / 2 - 2.5;
  halfline.y = 0;
  halfline.alpha = 0.5;

  return {
    Ball: ball,
    Paddle1: paddle1,
    Paddle2: paddle2,
    Score1: score1,
    Score2: score2,
    halfline: halfline,
    Waiting: Waiting,
  };
}

function initPixi() {
  let size = [window.innerWidth / 2, window.innerHeight / 2];
  const ratio = 16 / 9;
  let w;
  let h;
  if (size[0] / size[1] >= ratio) {
    w = size[1] * ratio;
    h = size[1];
  } else {
    w = size[0];
    h = size[0] / ratio;
  }

  const app = new PIXI.Application({
    width: w,
    height: h,
    backgroundColor: 0xf05454,
    antialias: true,
  });

  window.onresize = () => {
    size = [window.innerWidth / 2, window.innerHeight / 2];
    if (size[0] / size[1] >= ratio) {
      w = size[1] * ratio;
      h = size[1];
      app.renderer.resize(w, h);
    } else {
      w = size[0];
      h = size[0] / ratio;
      app.renderer.resize(w, h);
    }
  };
  app.stage.hitArea = app.screen;
  app.stage.eventMode = "static";
  const pixiContainer = document.getElementById("pixi-container");
  pixiContainer?.appendChild(app.view as any);
  return {
    App: app,
    Container: pixiContainer,
  };
}

const updateAssetsSize = (app: PIXI.Application, assets: any) => {
  const ballRadius = app.screen.height / 40;
  const paddleWidth = app.screen.height / 25;
  const paddleHeight = app.screen.height / 4;
  assets.Ball.width = ballRadius * 2;
  assets.Ball.height = ballRadius * 2;
  assets.Paddle1.width = paddleWidth;
  assets.Paddle1.height = paddleHeight;
  assets.Paddle2.width = paddleWidth;
  assets.Paddle2.height = paddleHeight;
  assets.Score1.style.fontSize = app.screen.height / 15;
  assets.Score2.style.fontSize = app.screen.height / 15;
  assets.halfline.height = app.screen.height;
  assets.halfline.x = app.screen.width / 2 - 2.5;
  assets.Score1.x = app.screen.width / 4;
  assets.Score1.y = app.screen.height / 4;
  assets.Score2.x = (app.screen.width / 4) * 3;
  assets.Score2.y = app.screen.height / 4;
  assets.Waiting.x = app.screen.width / 2;
  assets.Waiting.y = app.screen.height / 2;
};

const PixiComponent = () => {
  const router = useRouter();
  const user = useUser();
  const mode = useSearchParams().get("mode");
  const invited = useSearchParams().get("invite");
  const gameId = useSearchParams().get("id");
  let socket: Socket | null = null;
  const token = Cookies.get("token");

  useEffect(() => {
    if (!mode && !invited && !gameId) {
      toast.error("No parameters provided");
      router.push("/pregame");
    }
    if(user.intraLogin === invited)
    {
      toast.error("You cannot invite yourself to a game");
      router.push("/pregame");
    }
    if (!user || !token) router.push("/");
    if (!socket) {
      socket = io(`http://${process.env.NEXT_PUBLIC_HOSTNAME}:3001/game`, {
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      socket.on("error", (error) => {
        toast.error(error);
        router.push("/pregame");
      });
    }
    if (!user || !socket) return;
    const pixi = initPixi();
    let assets = initAssets(pixi.App);
    let game: Game;
    socket.emit("joinGame", {
      gameId: gameId,
      mode: mode,
      expectedPlayer: invited,
    });
    socket.on("waiting", () => {
      pixi.App.stage.addChild(assets.Waiting);
    });

    socket.on("gameReady", (data) => {
      gamestarted = true;
      game = data;
      pixi.App.stage.removeChild(assets.Waiting);
      stageAssets(pixi.App, assets);
    });
    socket.on("gameUpdate", (data) => {
      if (!gamestarted || !data) return;
      if (game.gameId !== data.gameId) return;
      game = data;
      assets.Ball.x = game.ballPosition.x * pixi.App.screen.width;
      assets.Ball.y = game.ballPosition.y * pixi.App.screen.height;
      assets.Paddle1.y = game.player1.position.y * pixi.App.screen.height;
      assets.Paddle2.y = game.player2.position.y * pixi.App.screen.height;
      assets.Paddle1.x = game.player1.position.x * pixi.App.screen.width;
      assets.Paddle2.x = game.player2.position.x * pixi.App.screen.width;
      assets.Score1.text = game.player1.score.toString();
      assets.Score2.text = game.player2.score.toString();
    });

    socket.on("gameFinished", (data) => {
      if (!gamestarted || !data) return;
      if (data.gameId !== game.gameId) return;
      gamestarted = false;
      router.push("/pregame");
    });
    pixi.App.stage.on("pointermove", (e) => {
      if (!gamestarted) return;
      if (game) {
        socket?.emit("move", {
          gameId: game.gameId,
          username: user.intraLogin,
          position: {
            y: e.screenY / pixi.App.screen.height,
          },
        });
      }
    });
    pixi.App.ticker.add(() => {
      updateAssetsSize(pixi.App, assets);
    });
    return () => {
      socket?.off("waiting");
      socket?.off("gameReady");
      socket?.off("gameUpdate");
      socket?.off("gameWin");
      socket?.off("gameFinished");
      socket?.off("error");
      socket?.disconnect();
      pixi.App.destroy();
      window.onresize = null;
    };
  }, []);

  return <div id="pixi-container" className="box-shadow"></div>;
};

export default PixiComponent;
