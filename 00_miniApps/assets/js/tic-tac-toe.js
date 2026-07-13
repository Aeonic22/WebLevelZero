// Tic Tac Toe Game
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameOver = false;

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function makeMove(index) {
    if (board[index] !== '' || gameOver) return;
    
    board[index] = currentPlayer;
    updateDisplay();
    
    if (checkWinner()) {
        document.getElementById('status').textContent = `${currentPlayer} wins! 🎉`;
        gameOver = true;
        return;
    }
    
    if (board.every(cell => cell !== '')) {
        document.getElementById('status').textContent = "It's a draw!";
        gameOver = true;
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateDisplay();
    
    // Computer move (random)
    if (currentPlayer === 'O' && !gameOver) {
        setTimeout(computerMove, 500);
    }
}

function computerMove() {
    const emptyIndices = board
        .map((cell, index) => cell === '' ? index : null)
        .filter(index => index !== null);
    
    if (emptyIndices.length === 0) return;
    
    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    board[randomIndex] = 'O';
    updateDisplay();
    
    if (checkWinner()) {
        document.getElementById('status').textContent = 'Computer (O) wins! 🤖';
        gameOver = true;
        return;
    }
    
    if (board.every(cell => cell !== '')) {
        document.getElementById('status').textContent = "It's a draw!";
        gameOver = true;
        return;
    }
    
    currentPlayer = 'X';
    updateDisplay();
}

function checkWinner() {
    return WINNING_COMBINATIONS.some(combo => {
        const [a, b, c] = combo;
        return board[a] !== '' && board[a] === board[b] && board[a] === board[c];
    });
}

function updateDisplay() {
    document.querySelectorAll('.cell').forEach((cell, index) => {
        cell.textContent = board[index];
        cell.className = 'cell';
        if (board[index] === 'X') cell.classList.add('x');
        if (board[index] === 'O') cell.classList.add('o');
    });
    
    if (!gameOver) {
        document.getElementById('status').textContent = `Current Player: ${currentPlayer}`;
    }
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameOver = false;
    updateDisplay();
    document.getElementById('status').textContent = 'Current Player: X';
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.cell').forEach((cell, index) => {
        cell.addEventListener('click', () => makeMove(index));
    });
    resetGame();
});
