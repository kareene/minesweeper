'use strict'

// Called when the safe cell button is clicked. marks a single safe cell for a 1 second hint
// TODO: limit the number of times this feature can be used
function showSafe() {
    if (!gGame.isOn) return;
    if (!gGame.startTime) return;
    var elClickesLeft = document.querySelector('.safe span');
    if (elClickesLeft.innerText > 0) {
        elClickesLeft.innerText--;
        var elCell = getRandomSafeCell(gBoard);
        if (!elCell) return;
        elCell.classList.add('safe-cell');
        setTimeout(function() {
            elCell.classList.remove('safe-cell');
        }, 1000)
    }
}

// returns a random cell from the safe cell array
function getRandomSafeCell(board) {
    var safeCells = getSafeCells(board);
    if (!safeCells.length) return null;
    var randIdx = getRandomInt(0, safeCells.length - 1);
    return safeCells[randIdx];
}

// Creates an array of cells that are not mines and haven't been shown yet
function getSafeCells(board) {
    var safeCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) continue;
            if (board[i][j].isShown) continue;
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            safeCells.push(elCell);
        }
    }
    return safeCells;
}