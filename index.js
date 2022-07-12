//* /////////////////////////////////////////////////////////
//? CONFIGURATION CONSTANTS
const BOARD_SIZE = 20;

//* /////////////////////////////////////////////////////////
//? Selections
const gameContainer = document.querySelector('.game-container');
const cells = document.getElementsByClassName('cell');
const toggleButton = document.querySelector('.toggle-button');
const scoreBoard = document.querySelector('.score');
const modalButton = document.querySelector('.modal-button');
const modal = document.querySelector('.modal');
//* /////////////////////////////////////////////////////////
//? Rendering Cells

gameContainer.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 1fr)`;
gameContainer.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;

for (let row = BOARD_SIZE; row > 0; row--) {
  for (let col = BOARD_SIZE; col > 0; col--) {
    gameContainer.insertAdjacentHTML(
      'afterbegin',
      `<div data-row="${row}" data-col="${col}" class="cell" ></div>`
    );
  }
}

//* /////////////////////////////////////////////////////////

let IS_MODAL_OPEN = true;

//? Game Logic
let FPS_COUNTER = 0;
let FPS = 6;

let MOVE_UP = false;
let MOVE_DOWN = false;
let MOVE_RIGHT = true;
let MOVE_LEFT = false;
let SCORE = 0;

let IS_PLAYING = false;
let FOOD_LOCATION = [];
let HAS_EATEN_FOOD = true;
let SNAKE_POSITION_ARRAY = [[1, 1]];
let PREVIOUS_POSITION = [];

function gameLoop() {
  if (!(FPS_COUNTER < 60 / FPS)) {
    play();
    FPS_COUNTER = 0;
  }

  FPS_COUNTER++;
  if (IS_PLAYING) requestAnimationFrame(gameLoop);
}

//* /////////////////////////////////////////////////////////
//* parent function, provides structures & distributes tasks to other functions

function play() {
  clearBoard();
  renderSnake();
  if (HAS_EATEN_FOOD) renderFood();
  collisionCheck();

  if (MOVE_DOWN) moveDOWN();
  if (MOVE_LEFT) moveLEFT();
  if (MOVE_RIGHT) moveRIGHT();
  if (MOVE_UP) moveUP();

  // check for collision
  foodEatenCheck();
  if (HAS_EATEN_FOOD) {
    incrementCounter();
    growSnake();
  }
}

//* /////////////////////////////////////////////////////////
//* increments score

function incrementCounter() {
  SCORE++;
  scoreBoard.innerHTML = Number(SCORE);
}

//* /////////////////////////////////////////////////////////
//* resets game

function resetGame() {
  alert('Game Over');
  SNAKE_POSITION_ARRAY = [[1, 1]];
  IS_PLAYING = false;
  MOVE_DOWN = false;
  MOVE_LEFT = false;
  MOVE_RIGHT = true;
  MOVE_UP = false;
  HAS_EATEN_FOOD = true;
  FOOD_LOCATION = [];
  gameLoop();
  scoreBoard.innerHTML = 0;
  SCORE = 0;
  toggleButton.innerHTML = 'START';
}

//* /////////////////////////////////////////////////////////
//* collision Check
function collisionCheck() {
  const snakeHeadRow = SNAKE_POSITION_ARRAY[SNAKE_POSITION_ARRAY.length - 1][0];
  const snakeHeadCol = SNAKE_POSITION_ARRAY[SNAKE_POSITION_ARRAY.length - 1][1];

  if (
    snakeHeadCol < 0 ||
    snakeHeadCol > BOARD_SIZE ||
    snakeHeadRow > BOARD_SIZE ||
    snakeHeadRow < 0
  ) {
    resetGame();
  }

  SNAKE_POSITION_ARRAY.forEach((pos, index) => {
    if (index === SNAKE_POSITION_ARRAY.length - 1) return;
    snakeRow = pos[0];
    snakeCol = pos[1];

    if (snakeHeadCol === snakeCol && snakeHeadRow === snakeRow) {
      resetGame();
    }
  });
}

//* /////////////////////////////////////////////////////////
//* Clear board

function clearBoard() {
  [...cells].forEach(cell => {
    if (!cell.classList.contains('food')) {
      cell.classList.remove('snake');
    }
  });
  return;
}

//* /////////////////////////////////////////////////////////
//* For every cell, check if it is a snake position and render it

function renderSnake() {
  [...cells].forEach(cell => {
    const cellRow = Number(cell.dataset.row);
    const cellCol = Number(cell.dataset.col);

    SNAKE_POSITION_ARRAY.forEach(snakeCell => {
      snakeCellRow = snakeCell[0];
      snakeCellCol = snakeCell[1];

      if (cellRow === snakeCellRow && cellCol === snakeCellCol) {
        cell.classList.add('snake');
      }
    });
  });
}

//* /////////////////////////////////////////////////////////
//* Find valid food spawn spaces and choose one randomly

function renderFood() {
  //chosing a location
  const availableSpaces = [];
  [...cells].forEach(cell => {
    cellRow = Number(cell.dataset.row);
    cellCol = Number(cell.dataset.col);

    if (
      !(cell.classList.contains('snake') && cell.classList.contains('food'))
    ) {
      availableSpaces.push([cellRow, cellCol]);
    }
  });

  const foodLocationIndex = randomNumber(1, availableSpaces.length);
  FOOD_LOCATION = availableSpaces[foodLocationIndex];

  //rendering food
  [...cells].forEach(cell => {
    cellRow = Number(cell.dataset.row);
    cellCol = Number(cell.dataset.col);

    cell.classList.remove('food');

    if (cellRow === FOOD_LOCATION[0] && cellCol === FOOD_LOCATION[1]) {
      cell.classList.add('food');
    }
  });
}

//* /////////////////////////////////////////////////////////
//*  check if snake ate  Food

function foodEatenCheck() {
  snakeHeadRow = SNAKE_POSITION_ARRAY[SNAKE_POSITION_ARRAY.length - 1][0];
  snakeHeadCol = SNAKE_POSITION_ARRAY[SNAKE_POSITION_ARRAY.length - 1][1];
  foodRow = FOOD_LOCATION[0];
  foodCol = FOOD_LOCATION[1];

  if (snakeHeadRow === foodRow && snakeHeadCol === foodCol) {
    HAS_EATEN_FOOD = true;
    return true;
  } else {
    HAS_EATEN_FOOD = false;
    return false;
  }
}
//* /////////////////////////////////////////////////////////
//* if the snake ate the food, grow snake
function growSnake() {
  SNAKE_POSITION_ARRAY = [PREVIOUS_POSITION, ...SNAKE_POSITION_ARRAY];
}
//* /////////////////////////////////////////////////////////
//* Movement Functions

function moveUP() {
  // snake moving logic
  if (SNAKE_POSITION_ARRAY.length === 1) {
    previousRow = SNAKE_POSITION_ARRAY[0][0];
    previousCol = SNAKE_POSITION_ARRAY[0][1];

    SNAKE_POSITION_ARRAY = [[previousRow - 1, previousCol]];
  } else {
    const snakeLocationCopy = [...SNAKE_POSITION_ARRAY];
    PREVIOUS_POSITION = SNAKE_POSITION_ARRAY[0];
    const firstElementRemovedArray = snakeLocationCopy.splice(0, 1);

    const snakeHead = SNAKE_POSITION_ARRAY[SNAKE_POSITION_ARRAY.length - 1];
    const returnArray = [
      ...snakeLocationCopy,
      [snakeHead[0] - 1, snakeHead[1]],
    ];
    SNAKE_POSITION_ARRAY = returnArray;
  }

  // ++++++++++++++++++
}

function moveDOWN() {
  // snake moving logic
  if (SNAKE_POSITION_ARRAY.length === 1) {
    previousRow = SNAKE_POSITION_ARRAY[0][0];
    previousCol = SNAKE_POSITION_ARRAY[0][1];

    SNAKE_POSITION_ARRAY = [[previousRow + 1, previousCol]];
  } else {
    const snakeLocationCopy = [...SNAKE_POSITION_ARRAY];
    PREVIOUS_POSITION = SNAKE_POSITION_ARRAY[0];

    const firstElementRemovedArray = snakeLocationCopy.splice(0, 1);
    const snakeHead = SNAKE_POSITION_ARRAY[SNAKE_POSITION_ARRAY.length - 1];
    const returnArray = [
      ...snakeLocationCopy,
      [snakeHead[0] + 1, snakeHead[1]],
    ];
    SNAKE_POSITION_ARRAY = returnArray;
  }
}

function moveRIGHT() {
  // snake moving logic
  if (SNAKE_POSITION_ARRAY.length === 1) {
    previousRow = SNAKE_POSITION_ARRAY[0][0];
    previousCol = SNAKE_POSITION_ARRAY[0][1];

    PREVIOUS_POSITION = [previousRow, previousCol];
    SNAKE_POSITION_ARRAY = [[previousRow, previousCol + 1]];
  } else {
    const snakeLocationCopy = [...SNAKE_POSITION_ARRAY];
    PREVIOUS_POSITION = snakeLocationCopy[0];
    const firstElementRemovedArray = snakeLocationCopy.splice(0, 1);

    const snakeHead = SNAKE_POSITION_ARRAY[SNAKE_POSITION_ARRAY.length - 1];
    const returnArray = [
      ...snakeLocationCopy,
      [snakeHead[0], snakeHead[1] + 1],
    ];
    SNAKE_POSITION_ARRAY = returnArray;
  }
}

function moveLEFT() {
  // snake moving logic
  if (SNAKE_POSITION_ARRAY.length === 1) {
    previousRow = SNAKE_POSITION_ARRAY[0][0];
    previousCol = SNAKE_POSITION_ARRAY[0][1];

    SNAKE_POSITION_ARRAY = [[previousRow, previousCol - 1]];
  } else {
    const snakeLocationCopy = [...SNAKE_POSITION_ARRAY];
    PREVIOUS_POSITION = SNAKE_POSITION_ARRAY[0];

    const firstElementRemovedArray = snakeLocationCopy.splice(0, 1);
    const snakeHead = SNAKE_POSITION_ARRAY[SNAKE_POSITION_ARRAY.length - 1];
    const returnArray = [
      ...snakeLocationCopy,
      [snakeHead[0], snakeHead[1] - 1],
    ];
    SNAKE_POSITION_ARRAY = returnArray;
  }
}

//* /////////////////////////////////////////////////////////
//* /////////////////////////////////////////////////////////
//* /////////////////////////////////////////////////////////
//* EVENT LISTENERS

// for toggle button

toggleButton.addEventListener('click', event => {
  if (IS_PLAYING) {
    IS_PLAYING = false;
    toggleButton.innerHTML = 'START';
  } else {
    IS_PLAYING = true;
    toggleButton.innerHTML = 'STOP';
    gameLoop();
  }
});

// for controls (WASD)

window.addEventListener('keydown', event => {
  pressedKey = event.key;
  // guard clause
  if (
    !(
      pressedKey === 'a' ||
      pressedKey === 'w' ||
      pressedKey === 's' ||
      pressedKey === 'd'
    )
  )
    return;

  // controls
  if (pressedKey === 'w') {
    MOVE_UP = true;
    MOVE_DOWN = false;
    MOVE_RIGHT = false;
    MOVE_LEFT = false;
  }
  if (pressedKey === 'a') {
    MOVE_UP = false;
    MOVE_DOWN = false;
    MOVE_RIGHT = false;
    MOVE_LEFT = true;
  }
  if (pressedKey === 's') {
    MOVE_UP = false;
    MOVE_DOWN = true;
    MOVE_RIGHT = false;
    MOVE_LEFT = false;
  }
  if (pressedKey === 'd') {
    MOVE_UP = false;
    MOVE_DOWN = false;
    MOVE_RIGHT = true;
    MOVE_LEFT = false;
  }
});

//* /////////////////////////////////////////////////////////
modalButton.addEventListener('click', event => {
  modal.style.display = 'none';
});

//* /////////////////////////////////////////////////////////
//* /////////////////////////////////////////////////////////
//* /////////////////////////////////////////////////////////
//* Utility Functions

const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
