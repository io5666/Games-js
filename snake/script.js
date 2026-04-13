const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const score1Element = document.getElementById('score1');
const score2Element = document.getElementById('score2');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverDiv = document.getElementById('gameOver');
const winnerMessage = document.getElementById('winnerMessage');
const playAgainBtn = document.getElementById('playAgainBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Snake objects
let snake1 = {
    x: 5,
    y: 5,
    dx: 0,
    dy: 0,
    cells: [],
    maxCells: 4
};

let snake2 = {
    x: 15,
    y: 15,
    dx: 0,
    dy: 0,
    cells: [],
    maxCells: 4
};

// Food (array of 3 fruits)
let food = [];

let score1 = 0;
let score2 = 0;
let gameRunning = false;
let gameLoop;

// Key press handling
document.addEventListener('keydown', function(e) {
    // Player 1 (Arrow keys)
    if (e.key === 'ArrowLeft' && snake1.dx === 0) {
        snake1.dx = -1;
        snake1.dy = 0;
        snake1.moving = true;
    } else if (e.key === 'ArrowUp' && snake1.dy === 0) {
        snake1.dx = 0;
        snake1.dy = -1;
        snake1.moving = true;
    } else if (e.key === 'ArrowRight' && snake1.dx === 0) {
        snake1.dx = 1;
        snake1.dy = 0;
        snake1.moving = true;
    } else if (e.key === 'ArrowDown' && snake1.dy === 0) {
        snake1.dx = 0;
        snake1.dy = 1;
        snake1.moving = true;
    }

    // Player 2 (WASD)
    if (e.key === 'a' && snake2.dx === 0) {
        snake2.dx = -1;
        snake2.dy = 0;
        snake2.moving = true;
    } else if (e.key === 'w' && snake2.dy === 0) {
        snake2.dx = 0;
        snake2.dy = -1;
        snake2.moving = true;
    } else if (e.key === 'd' && snake2.dx === 0) {
        snake2.dx = 1;
        snake2.dy = 0;
        snake2.moving = true;
    } else if (e.key === 's' && snake2.dy === 0) {
        snake2.dx = 0;
        snake2.dy = 1;
        snake2.moving = true;
    }
});

function resetGame() {
    snake1 = {
        x: 5,
        y: 5,
        dx: 0,
        dy: 0,
        cells: [],
        maxCells: 4,
        moving: false
    };

    snake2 = {
        x: 15,
        y: 15,
        dx: 0,
        dy: 0,
        cells: [],
        maxCells: 4,
        moving: false
    };

    // Initialize snake cells
    snake1.cells = [{x: snake1.x, y: snake1.y}];
    snake2.cells = [{x: snake2.x, y: snake2.y}];

    // Initialize 3 foods
    food = [];
    for (let i = 0; i < 3; i++) {
        food.push({
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        });
    }

    score1 = 0;
    score2 = 0;
    score1Element.textContent = score1;
    score2Element.textContent = score2;
    gameRunning = false;
    gameOverDiv.classList.add('hidden');
    clearInterval(gameLoop);
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameLoop = setInterval(gameStep, 100);
    }
}

function gameStep() {
    // Only move snakes if they are moving
    if (snake1.moving) {
        snake1.x += snake1.dx;
        snake1.y += snake1.dy;
    }

    if (snake2.moving) {
        snake2.x += snake2.dx;
        snake2.y += snake2.dy;
    }

    // Wrap around edges
    if (snake1.x < 0) snake1.x = tileCount - 1;
    if (snake1.x >= tileCount) snake1.x = 0;
    if (snake1.y < 0) snake1.y = tileCount - 1;
    if (snake1.y >= tileCount) snake1.y = 0;

    if (snake2.x < 0) snake2.x = tileCount - 1;
    if (snake2.x >= tileCount) snake2.x = 0;
    if (snake2.y < 0) snake2.y = tileCount - 1;
    if (snake2.y >= tileCount) snake2.y = 0;

    // Add current position to cells only if moving
    if (snake1.moving) {
        snake1.cells.unshift({x: snake1.x, y: snake1.y});
    }
    if (snake2.moving) {
        snake2.cells.unshift({x: snake2.x, y: snake2.y});
    }

    // Remove cells if too many
    if (snake1.cells.length > snake1.maxCells) {
        snake1.cells.pop();
    }
    if (snake2.cells.length > snake2.maxCells) {
        snake2.cells.pop();
    }

    // Check food collision
    for (let i = 0; i < food.length; i++) {
        if (snake1.x === food[i].x && snake1.y === food[i].y) {
            snake1.maxCells++;
            score1++;
            score1Element.textContent = score1;
            food.splice(i, 1); // Remove eaten food
            generateFood(); // Generate new food to maintain 3 foods
            break;
        }
    }

    for (let i = 0; i < food.length; i++) {
        if (snake2.x === food[i].x && snake2.y === food[i].y) {
            snake2.maxCells++;
            score2++;
            score2Element.textContent = score2;
            food.splice(i, 1); // Remove eaten food
            generateFood(); // Generate new food to maintain 3 foods
            break;
        }
    }

    // Check self collision and collision with other snake (only if moving)
    if (snake1.moving && (checkCollision(snake1) || checkCollisionWithOther(snake1, snake2))) {
        endGame(2);
        return;
    }

    if (snake2.moving && (checkCollision(snake2) || checkCollisionWithOther(snake2, snake1))) {
        endGame(1);
        return;
    }

    // Draw everything
    draw();
}

function checkCollision(snake) {
    for (let i = 1; i < snake.cells.length; i++) {
        if (snake.x === snake.cells[i].x && snake.y === snake.cells[i].y) {
            return true;
        }
    }
    return false;
}

function checkCollisionWithOther(snake, otherSnake) {
    for (let cell of otherSnake.cells) {
        if (snake.x === cell.x && snake.y === cell.y) {
            return true;
        }
    }
    return false;
}

function generateFood() {
    let newFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // Make sure food doesn't spawn on snakes
    for (let cell of snake1.cells) {
        if (newFood.x === cell.x && newFood.y === cell.y) {
            generateFood();
            return;
        }
    }

    for (let cell of snake2.cells) {
        if (newFood.x === cell.x && newFood.y === cell.y) {
            generateFood();
            return;
        }
    }

    // Make sure food doesn't spawn on existing food
    for (let existingFood of food) {
        if (newFood.x === existingFood.x && newFood.y === existingFood.y) {
            generateFood();
            return;
        }
    }

    food.push(newFood);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snakes
    ctx.fillStyle = 'lime';
    for (let cell of snake1.cells) {
        ctx.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize - 2, gridSize - 2);
    }

    ctx.fillStyle = 'red';
    for (let cell of snake2.cells) {
        ctx.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize - 2, gridSize - 2);
    }

    // Draw food
    ctx.fillStyle = 'yellow';
    for (let fruit of food) {
        ctx.fillRect(fruit.x * gridSize, fruit.y * gridSize, gridSize - 2, gridSize - 2);
    }
}

function endGame(winner) {
    gameRunning = false;
    clearInterval(gameLoop);
    gameOverDiv.classList.remove('hidden');
    
    if (winner === 1) {
        winnerMessage.textContent = `¡Jugador 1 gana! Puntuación: ${score1}`;
    } else if (winner === 2) {
        winnerMessage.textContent = `¡Jugador 2 gana! Puntuación: ${score2}`;
    } else {
        winnerMessage.textContent = `¡Empate! Jugador 1: ${score1}, Jugador 2: ${score2}`;
    }
}

// Event listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);

// Initialize
resetGame();