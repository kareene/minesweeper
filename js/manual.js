'use strict'

var gMinesDeployed;
var gIsManualMines;

// called when "custum mines" button is clicked
function manualPositionMines() {
    if (document.querySelector('.manual-btn').innerText === 'Custom Mines') {
        // button clicked before all mines were deployed
        initGame();
        gIsManualMines = true;
        document.querySelector('.manual').innerText = `You Have ${gLevel.MINES - gMinesDeployed} Mines Left to Deploy`;
    } else { // document.querySelector('.manual-btn').innerText === 'Start Game'
        // button clicked after all mines were deployed
        hideAllMines(gBoard);
        startGame(gBoard);
        gIsManualMines = false; // must be after startGame() to avoid random redeploy of mines
        document.querySelector('.manual-btn').innerText = `Custom Mines`;
        document.querySelector('.manual').innerText = '';
    }
}

// called when a cell is clicked in manual mine mode. places a mine on the board. the mine remains visable.
// if all mines were placed, changes the "custom mines" button to "start game".
function deployMine(board, elCell, posI, posJ) {
    if (gLevel.MINES - gMinesDeployed > 0) {
        if (board[posI][posJ].isMine) return;
        gMinesDeployed++;
        board[posI][posJ].isMine = true;
        elCell.innerText = MINE;
        elCell.classList.add('shown');
        if (gLevel.MINES - gMinesDeployed !== 0) {
            document.querySelector('.manual').innerText = `You Have ${gLevel.MINES - gMinesDeployed} Mines Left to Deploy`;
        } else {
            // All mines were deplyed. Ready to start game
            document.querySelector('.manual').innerText = `You Have Deployed All the Mines`;
            document.querySelector('.manual-btn').innerText = `Start Game`;
        }
    }
}

// called when game is started after manual postion of mines. hides all the mine the player deployed.
function hideAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) {
                var elCell = document.querySelector(`.cell-${i}-${j}`);
                elCell.innerText = EMPTY;
                elCell.classList.remove('shown');
            }
        }
    }
}
 