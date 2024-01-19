import {
  Bodies,
  Engine,
  Render,
  Runner,
  World,
  Body,
  Events,
  Collision,
} from 'matter-js';
import { FRUITS_BASE, FRUITS_HLW } from './fruits';
const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: '#F7F4C8',
    width: 620,
    height: 850,
  },
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  render: { fillStyle: '#E6B143' },
  isStatic: true,
});

// rectangle은 인자가 x, y, 너비, 높이 순으로 들어감
const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  render: { fillStyle: '#E6B143' },
  isStatic: true,
});
const ground = Bodies.rectangle(310, 820, 620, 60, {
  render: { fillStyle: '#E6B143' },
  isStatic: true,
});
const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: 'topLine',
  render: { fillStyle: '#E6B143' },
  isStatic: true,
  isSensor: true,
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;

function addFruit() {
  const maxIndex = 6;
  const index = 0;
  let randomCount = Math.floor(Math.random() * (maxIndex - index)) + index;
  let fruitRestitution = randomCount >= 5 ? 0.2 : randomCount > 3 ? 0.3 : 0.4;

  const fruit = FRUITS_BASE[randomCount];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: randomCount,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` },
    },
    restitution: fruitRestitution,
  });

  currentBody = body;
  currentFruit = fruit;
  // restitution은 탄성, 0에서 1 사이 값
  World.add(world, body);
}

window.onkeydown = (e) => {
  if (disableAction) {
    return;
  }
  switch (e.code) {
    case 'KeyA':
      if (currentBody.position.x - currentFruit.radius > 40) {
        Body.setPosition(currentBody, {
          x: currentBody.position.x - 10,
          y: currentBody.position.y,
        });
      }

      break;
    case 'KeyS':
      currentBody.isSleeping = false;
      disableAction = true;
      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);

      break;
    case 'KeyD':
      if (currentBody.position.x + currentFruit.radius < 580) {
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 10,
          y: currentBody.position.y,
        });
      }

      break;
  }
};
Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((col) => {
    if (col.bodyA.index === col.bodyB.index) {
      const curIndex = col.bodyA.index;

      World.remove(world, [col.bodyA, col.bodyB]);
      if (curIndex === FRUITS_BASE.length - 1) {
        return;
      }
      const newFruit = FRUITS_BASE[curIndex + 1];
      const newBody = Bodies.circle(
        col.collision.supports[0].x,
        col.collision.supports[0].y,
        newFruit.radius,
        {
          index: curIndex + 1,
          render: {
            sprite: { texture: `${newFruit.name}.png` },
          },
        }
      );
      // col.collision.supports[0] => 충돌 발생지점

      World.add(world, newBody);
    }

    if (
      (!disableAction && col.bodyA.name === 'topLine') ||
      col.bodyB.name === 'topLine'
    ) {
      alert('game over', 'gameOver');
      history.go(0);
    }
  });
});
addFruit();
