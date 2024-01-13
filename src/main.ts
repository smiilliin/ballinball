import * as PIXI from "pixi.js";

const app = new PIXI.Application({
  background: "#000000",
  resizeTo: document.body,
});

document.body.appendChild(app.view as HTMLCanvasElement);

app.stage.eventMode = "static";
app.stage.hitArea = app.screen;

const view = new PIXI.Container();

app.stage.addChild(view);

const bigBallRadius = 2;

const bigBall = new PIXI.Graphics();
bigBall.lineStyle(2, 0xffffff);
bigBall.drawCircle(0, 0, bigBallRadius * 100);
bigBall.endFill();

class Vector2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(vector: Vector2) {
    return new Vector2(vector.x + this.x, vector.y + this.y);
  }
  sub(vector: Vector2) {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  }
  mul(x: number) {
    return new Vector2(this.x * x, this.y * x);
  }
  div(x: number) {
    return new Vector2(this.x / x, this.y / x);
  }
  distance() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }
  normalize() {
    return this.div(this.distance());
  }
  set(vector: Vector2) {
    this.x = vector.x;
    this.y = vector.y;
  }
  clone() {
    return new Vector2(this.x, this.y);
  }
}
const g = 9.8;
class Ball extends PIXI.Graphics {
  radius: number;
  velocity: Vector2;

  constructor(radius: number) {
    super();
    this.radius = radius;
    this.beginFill(0xffffff);
    this.drawCircle(0, 0, radius * 100);
    this.endFill();
    this.velocity = new Vector2(0, 0);
    const theta = Math.random() * 2 * Math.PI;
    const r = Math.random() * (bigBallRadius - this.radius);
    this.set(new Vector2(Math.cos(theta) * r, Math.sin(theta) * r));
  }
  move(movement: Vector2) {
    this.x += movement.x * 100;
    this.y += movement.y * 100;
  }
  set(vector: Vector2) {
    this.x = vector.x * 100;
    this.y = vector.y * 100;
  }
  getVector() {
    return new Vector2(this.x, this.y).div(100);
  }
  isCollide(ball: Ball) {
    return (
      ball.getVector().sub(this.getVector()).distance() <
      ball.radius + this.radius
    );
  }
  tick(timeDelta: number) {
    const startVector = this.getVector().clone();
    const d = this.velocity.mul(timeDelta / 1000);
    this.move(d);

    if (this.getVector().distance() + this.radius > bigBallRadius) {
      const t =
        (-startVector.x * d.x -
          startVector.y * d.y +
          Math.sqrt(
            Math.pow(bigBallRadius - this.radius - 0.01, 2) *
              (Math.pow(d.x, 2) + Math.pow(d.y, 2)) -
              Math.pow(startVector.x * d.y - startVector.y * d.x, 2)
          )) /
        (Math.pow(d.x, 2) + Math.pow(d.y, 2) || 0.001);
      const oldVector = this.getVector().clone();
      //move in big ball
      this.set(startVector.add(d.mul(t)));
      const dy = oldVector.y - this.getVector().y;

      const A = Math.atan2(-this.getVector().y, this.getVector().x);
      const newVelocity = new Vector2(0, 0);
      newVelocity.x =
        -this.velocity.x * Math.cos(2 * A) - -this.velocity.y * Math.sin(2 * A);
      newVelocity.y =
        -this.velocity.x * Math.sin(2 * A) + -this.velocity.y * Math.cos(2 * A);
      newVelocity.y = -newVelocity.y;
      //calculate velocity error
      newVelocity.y -= g - Math.sqrt(Math.pow(g, 2) - 2 * g * dy);
      this.velocity.set(newVelocity);
    }

    const oldMVelocity = this.velocity.clone();
    this.velocity.y += (timeDelta / 1000) * g;
    if (oldMVelocity.y < 0 && this.velocity.y > 0) {
      const dv = oldMVelocity.y;
      //calculate velocity error
      this.move(new Vector2(0, dv * (timeDelta / 1000)));
      this.velocity.y = 0;
    }
  }
}

const balls: Ball[] = [];

const addBall = (radius: number) => {
  const ball = new Ball(radius);
  view.addChild(ball);
  balls.push(ball);
};
for (let i = 0; i < 10; i++) {
  addBall(Math.random() * 0.1 + 0.15);
}

view.addChild(bigBall);
view.x = window.innerWidth / 2;
view.y = window.innerHeight / 2;
window.onresize = () => {
  view.x = window.innerWidth / 2;
  view.y = window.innerHeight / 2;
};

const paused = false;

let lastTime = Date.now();
app.ticker.add(() => {
  const currentTime = Date.now();

  if (!paused) {
    let timePassed = currentTime - lastTime;

    //limit by 60fps
    if (timePassed > 1000 / 60) {
      timePassed = 1000 / 60;
    }

    balls.forEach((ball) => ball.tick(timePassed));
  }

  lastTime = currentTime;
});
