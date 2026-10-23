const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const boardElement = document.querySelector('#ultimate-board');
const turnMark = document.querySelector('#turn-mark');
const turnLabel = document.querySelector('#turn-label');
const turnHint = document.querySelector('#turn-hint');
const scoreElements = {
  X: document.querySelector('#score-x'),
  O: document.querySelector('#score-o'),
  draws: document.querySelector('#score-draws'),
};

let cells = Array.from({ length: 9 }, () => Array(9).fill(''));
let boardWinners = Array(9).fill('');
let currentPlayer = 'X';
let activeBoard = null;
let gameWinner = '';
let scores = { X: 0, O: 0, draws: 0 };

function lineWinner(values) {
  for (const [a, b, c] of WINNING_LINES) {
    if (values[a] && values[a] === values[b] && values[a] === values[c]) return values[a];
  }
  return '';
}

function isBoardFull(boardIndex) {
  return cells[boardIndex].every(Boolean);
}

function availableBoards() {
  return boardWinners.map((winner, index) => winner || isBoardFull(index) ? -1 : index).filter(index => index >= 0);
}

function renderBoard() {
  boardElement.replaceChildren();

  for (let boardIndex = 0; boardIndex < 9; boardIndex += 1) {
    const miniBoard = document.createElement('div');
    miniBoard.className = 'mini-board';
    miniBoard.setAttribute('role', 'row');
    miniBoard.setAttribute('aria-label', `Small board ${boardIndex + 1}${boardWinners[boardIndex] ? `, won by ${boardWinners[boardIndex]}` : isBoardFull(boardIndex) ? ', drawn' : ''}`);

    if (!boardWinners[boardIndex] && !isBoardFull(boardIndex)) miniBoard.classList.add('is-open');
    if (activeBoard === boardIndex && !gameWinner) miniBoard.classList.add('is-active');
    if (boardWinners[boardIndex] || isBoardFull(boardIndex)) miniBoard.classList.add('is-closed');

    for (let cellIndex = 0; cellIndex < 9; cellIndex += 1) {
      const value = cells[boardIndex][cellIndex];
      const button = document.createElement('button');
      const cellIsAvailable = !gameWinner
        && !boardWinners[boardIndex]
        && !value
        && (activeBoard === null || activeBoard === boardIndex);

      button.type = 'button';
      button.className = `cell${value ? ` mark-${value.toLowerCase()}` : ''}`;
      button.textContent = value;
      button.disabled = !cellIsAvailable;
      button.setAttribute('role', 'gridcell');
      button.setAttribute('aria-label', `Board ${boardIndex + 1}, square ${cellIndex + 1}, ${value || 'empty'}${cellIsAvailable ? ', available' : ''}`);
      button.addEventListener('click', () => play(boardIndex, cellIndex));
      miniBoard.append(button);
    }

    if (boardWinners[boardIndex] || isBoardFull(boardIndex)) {
      const result = document.createElement('div');
      const winner = boardWinners[boardIndex];
      result.className = `board-result${winner === 'O' ? ' result-o' : ''}${winner ? '' : ' result-draw'}`;
      result.setAttribute('aria-hidden', 'true');
      result.textContent = winner || '–';
      miniBoard.append(result);
    }

    boardElement.append(miniBoard);
  }
}

function renderStatus() {
  const indicator = document.querySelector('.turn-indicator');
  turnMark.textContent = gameWinner === 'draw' ? '=' : gameWinner || currentPlayer;
  indicator.classList.toggle('is-o', (gameWinner === 'O') || (!gameWinner && currentPlayer === 'O'));

  if (gameWinner === 'draw') {
    turnLabel.textContent = 'A BIG BOARD DRAW';
    turnHint.textContent = 'No one claimed three big squares. Play another round?';
  } else if (gameWinner) {
    turnLabel.textContent = `${gameWinner} WINS THE BIG BOARD`;
    turnHint.textContent = 'Nicely played. Ready for a rematch?';
  } else {
    turnLabel.textContent = `${currentPlayer} TO MOVE`;
    turnHint.textContent = activeBoard === null
      ? 'Choose any open small board.'
      : `Play in small board ${activeBoard + 1}.`;
  }

  for (const player of ['X', 'O']) scoreElements[player].textContent = scores[player];
  scoreElements.draws.textContent = scores.draws;
}

function play(boardIndex, cellIndex) {
  const boardIsOpen = !boardWinners[boardIndex] && !isBoardFull(boardIndex);
  if (gameWinner || !boardIsOpen || cells[boardIndex][cellIndex]) return;
  if (activeBoard !== null && activeBoard !== boardIndex) return;

  cells[boardIndex][cellIndex] = currentPlayer;
  const localWinner = lineWinner(cells[boardIndex]);
  if (localWinner) boardWinners[boardIndex] = localWinner;

  const macroWinner = lineWinner(boardWinners);
  if (macroWinner) {
    gameWinner = macroWinner;
    scores[macroWinner] += 1;
  } else if (availableBoards().length === 0) {
    gameWinner = 'draw';
    scores.draws += 1;
  } else {
    const targetBoard = cellIndex;
    activeBoard = boardWinners[targetBoard] || isBoardFull(targetBoard) ? null : targetBoard;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }

  renderBoard();
  renderStatus();
}

function newRound() {
  cells = Array.from({ length: 9 }, () => Array(9).fill(''));
  boardWinners = Array(9).fill('');
  currentPlayer = 'X';
  activeBoard = null;
  gameWinner = '';
  renderBoard();
  renderStatus();
}

document.querySelector('#new-round').addEventListener('click', newRound);
document.querySelector('#new-match').addEventListener('click', () => {
  scores = { X: 0, O: 0, draws: 0 };
  newRound();
});

renderBoard();
renderStatus();
