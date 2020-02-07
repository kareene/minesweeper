'use strict'

const FLAG = '⛳';
const MINE = '💣';
const EXPLODE = '💥';
const SMILEY_NORMAL = '😃';
const SMILEY_WIN = '😎';
const SMILEY_DEAD = '😵';
const EMPTY = '';
const LIVES = 3;

var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    startTime: 0,
    livesUsed: 0
};
var gTimerInterval;
var gPlayedMoves;

// This is called when page loads
function initGame() {
    if (gTimerInterval) clearInterval(gTimerInterval);
    gPlayedMoves = [];
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        startTime: 0,
        livesUsed: 0
    };
    gBoard = buildBoard();
    renderBoard(gBoard);
    document.querySelector('.smiley').innerText = SMILEY_NORMAL; // init smiley restart button
    document.querySelector('.timer').innerText = '00:00'; // init timer
    document.querySelector('.marker').innerText = gLevel.MINES; // init mine / flag counter
    revealHintElements(); // init hints
    document.querySelector('.lives').innerText = `${LIVES - gGame.livesUsed} ❤️ Left`; // init lives
    document.querySelector('.safe span').innerText = 3; // init safe cell clicks
    // init and display high score
    var bestTime = localStorage.getItem(`bestTime${gLevel.SIZE}`) / 1000 + ' seconds';
    document.querySelector('.score').innerText = `The best time for this level is: ${bestTime}`;
    // init manual mine deploy - custom board
    gMinesDeployed = 0;
    gIsManualMines = false;
    document.querySelector('.manual-btn').innerText = `Custom Mines`;
    document.querySelector('.manual').innerText = '';
}

// Builds the board with cell objects. No mines placed yet. Returns the created board
function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }
    return board;
}

// Place mines randomly on the board
function placeMines(board, numOfMines, excludePos) {
    for (var i = 0; i < numOfMines; i++) {
        var isMinePlaced = false
        while (!isMinePlaced) {
            var posI = getRandomInt(0, board.length);
            var posJ = getRandomInt(0, board[0].length);
            if ((posI !== excludePos.i || posJ !== excludePos.j) && !board[posI][posJ].isMine) {
                board[posI][posJ].isMine = true;
                isMinePlaced = true;
            }
        }
    }
    return board;
}

// Count mines around each cell and set the cell's minesAroundCount
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) continue;
            board[i][j].minesAroundCount = countNegMines(board, i, j);
            if (board[i][j].minesAroundCount) {
                var colorClass = getColorClass(board[i][j].minesAroundCount);
                document.querySelector(`.cell-${i}-${j}`).classList.add(colorClass);
            }
        }
    }
    return board;
}

// Count mines around a single cell and returns the result
function countNegMines(board, posI, posJ) {
    var mineCount = 0;
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === posI && j === posJ) continue;
            if (board[i][j].isMine) mineCount++;
        }
    }
    return mineCount;
}

// Render the board as a <table> to the page
function renderBoard(board) {
    var elBoard = document.querySelector('.board');
    var strTableHeaderSpans = '<span class=marker></span><span class="smiley" onclick="initGame()"></span><span class="timer"></span>';
    var strHTML = `<tr><th colspan="${board[0].length}">${strTableHeaderSpans}</th></tr>`;
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            strHTML += `<td class="cell cell-${i}-${j}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j}); return false">${EMPTY}</td>`;
        }
        strHTML += '</tr>';
    }
    elBoard.innerHTML = strHTML;
}

// Called when the first cell is clicked. Sets up the mines on the board and starts the timer
function startGame(board, pos) {
    if (!gIsManualMines) placeMines(board, gLevel.MINES, pos);
    setMinesNegsCount(board);
    printBoard(board);
    gGame.startTime = Date.now();
    gTimerInterval = setInterval(function () {
        document.querySelector('.timer').innerText = getGameRunTime();
    }, 1000);
}

// Game ends when all mines are marked and all the other cells are shown
function checkGameOver() {
    if (!gGame.isOn) { // Game ended with an explosion
        document.querySelector('.smiley').innerText = SMILEY_DEAD;
    } else if (gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES + gGame.livesUsed) && (gGame.markedCount + gGame.livesUsed) === gLevel.MINES) {
        // All mines are marked an all cells are shown - WIN
        gGame.isOn = false;
        checkHighScore(Date.now());
        document.querySelector('.smiley').innerText = SMILEY_WIN;
    } else return; // Game is not over
    clearInterval(gTimerInterval);
}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gBoard[i][j].isMarked) return;
    if (gBoard[i][j].isShown) return;
    if (gIsManualMines) {
        deployMine(gBoard, elCell, i, j);
        return;
    }
    if (elCell.classList.contains('show-hint')) {
        hintShow(gBoard, i, j);
        return;
    }
    if (!gGame.startTime) startGame(gBoard, { i: i, j: j });
    var playedMove = { action: 'clicked', changedCells: [] }; // for undo()
    if (gBoard[i][j].isMine) explosion(gBoard, elCell, i, j, playedMove.changedCells);
    else expandShown(gBoard, elCell, i, j, playedMove.changedCells);
    gPlayedMoves.push(playedMove);
    checkGameOver();
}

// When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors
function expandShown(board, elCell, posI, posJ, changedCells) {
    showCell(board, elCell, posI, posJ, changedCells);
    if (board[posI][posJ].minesAroundCount) return; // Expands only if the number of mines around is 0
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (board[i][j].isMine || board[i][j].isMarked || board[i][j].isShown) continue;
            elCell = document.querySelector(`.cell-${i}-${j}`);
            if (board[i][j].isMarked) cellMarked(elCell, i, j); // Handles a flag marked in a wrong place that needs to be shown
            expandShown(board, elCell, i, j, changedCells);
        }
    }
}

// Show a single cell
function showCell(board, elCell, i, j, changedCells, value) {
    if (board[i][j].isShown) return;
    if (changedCells) changedCells.push({ elCell: elCell, i: i, j: j });
    board[i][j].isShown = true;
    gGame.shownCount++;
    // the value that needs to be shown is either a mine, or a number of the mines around the cell or
    // noting if there are no mines around
    if (!value) value = (board[i][j].isMine) ? MINE : (board[i][j].minesAroundCount) ? board[i][j].minesAroundCount : EMPTY;
    elCell.innerText = value;
    elCell.classList.add('shown');
}

// Called when the user clicks a mine. Player loses a life. If he ran out of lives - GAME OVER
function explosion(board, elCell, i, j, changedCells) {
    showCell(board, elCell, i, j, changedCells, EXPLODE);
    gGame.livesUsed++;
    document.querySelector('.lives').innerText = `${LIVES - gGame.livesUsed} ❤️ Left`;
    document.querySelector('.marker').innerText = gLevel.MINES - gGame.markedCount - gGame.livesUsed;
    if (gGame.livesUsed === LIVES) {
        gGame.isOn = false;
        showAllMines(board);
    }
}

// calls showCell() to show all the mines on the board. This function is called after the player
// clicked a mine and exploded with no more lives
function showAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine && !board[i][j].isShown) { // Don't show the mine that was already revealed
                var elCell = document.querySelector(`.cell-${i}-${j}`);
                showCell(board, elCell, i, j);
            }
        }
    }
}

// Called on right click to mark a cell (suspected to be a mine)
// If the cell is already marked, remove the flag
//can also be called by undo() to reverse the flag placment - in that case parameter undo will be true
function cellMarked(elCell, i, j, undo = false) {
    if (!gGame.isOn) return;
    if (gBoard[i][j].isShown) return;
    if (!undo) gPlayedMoves.push({ action: 'marked', changedCells: [{ elCell: elCell, i: i, j: j }] });
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        elCell.innerText = FLAG;
    } else {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        elCell.innerText = EMPTY;
    }
    document.querySelector('.marker').innerText = gLevel.MINES - gGame.markedCount - gGame.livesUsed;
    checkGameOver();
}

// Called when a level button is clicked
function changeLevel(level) {
    switch (level) {
        case 4: // Beginner (4*4 with 2 MINES)
            gLevel = {
                SIZE: 4,
                MINES: 2
            };
            break;
        case 8: // Medium (8 * 8 with 12 MINES)
            gLevel = {
                SIZE: 8,
                MINES: 12
            };
            break;
        case 12: // Expert (12 * 12 with 30 MINES)
            gLevel = {
                SIZE: 12,
                MINES: 30
            };
    }
    // Restart the game with the new setting
    initGame();
}

// Called when game ends with a win. compares the game time to the time in local storage for this level
function checkHighScore(endTime) {
    var gameRunTime = endTime - gGame.startTime;
    var bestTime = localStorage.getItem(`bestTime${gLevel.SIZE}`);
    if (bestTime === null || gameRunTime < bestTime) {
        bestTime = gameRunTime;
        localStorage.setItem(`bestTime${gLevel.SIZE}`, bestTime);
        document.querySelector('.score').innerText = `New High Score!!! ${bestTime / 1000} seconds`;
    }
}