'use strict'

// Called when the player clicks the undo button. Undo one move
function undo() {
    if (!gGame.isOn) return;
    if (!gPlayedMoves.length) return;
    var currMove = gPlayedMoves.pop();
    for (var i = 0; i < currMove.changedCells.length; i++) {
        var currCell = currMove.changedCells[i];
        if (currMove.action === 'marked') {
            cellMarked(currCell.elCell, currCell.i, currCell.j, true);
        } else { // CurrMove.action === 'clicked'
            unShowCell(gBoard, currCell.elCell, currCell.i, currCell.j);
        }
    }
}

// unshow a single cell
function unShowCell(board, elCell, posI, posJ) {
    if (!board[posI][posJ].isShown) return;
    if (gBoard[posI][posJ].isMine) {
        gGame.livesUsed--;
        document.querySelector('.lives').innerText = `${LIVES - gGame.livesUsed} ❤️ Left`;
        document.querySelector('.marker').innerText = gLevel.MINES - gGame.markedCount - gGame.livesUsed;
    }
    board[posI][posJ].isShown = false;
    gGame.shownCount--;
    elCell.innerText = EMPTY;
    elCell.classList.remove('shown');
}