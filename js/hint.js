'use strict'

var gHintTimeout = null;

// Called when a player clicks a hint
function startHint(elHint) {
    if (!gGame.isOn) return;
    if (!gGame.startTime) return;
    var elHintBox = document.querySelector('.hint');
    // If the game is already in hint mode, don't click another hint
    if (!elHintBox.classList.contains('show-hint')) elHintBox.classList.add('show-hint');
    else return;
    // Set all the cells to show-hint
    var elements = document.querySelectorAll('.cell');
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.add('show-hint');
    }
    // Hide the used hint
    elHint.hidden = true;
}

// Called from cellClicked() if the cell element contains the class show-hint
// Shows the cell clicked and all its neighbors for one second
function hintShow(board, posI, posJ) {
    if (gHintTimeout) return;
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            var value = (board[i][j].isMine) ? MINE : (board[i][j].minesAroundCount) ? board[i][j].minesAroundCount : EMPTY;
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            elCell.innerText = value;
            elCell.classList.add('shown');
        }
    }
    // Hide the revealed cells after 1 second timeout
    gHintTimeout = setTimeout(function () {
        hintUnShow(board, posI, posJ);
        gHintTimeout = null;
    }, 1000);
}

// returns the board back to the original display, after the hint time is over
function hintUnShow(board, posI, posJ) {
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (board[i][j].isShown) continue;
            var value = (board[i][j].isMarked) ? FLAG : EMPTY;
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            elCell.innerText = value;
            elCell.classList.remove('shown');
        }
    }
    stopHint();
}

// Removes the show-hint class from all the cells and the hint box
function stopHint() {
    var elements = document.querySelectorAll('.show-hint');
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove('show-hint');
    }
}

// Reveal the hint elements - Called in initGame()
function revealHintElements() {
    var hintElms = document.querySelectorAll('.hint span');
    for (var i = 0; i < hintElms.length; i++) {
        hintElms[i].hidden = false;
    }
}