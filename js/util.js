'use strict'

function printBoard(board) {
    console.clear();
    var contentBoard = [];
    for (var i = 0; i < board.length; i++) {
        contentBoard[i] = [];
        for (var j = 0; j < board[0].length; j++) {
            var cellContent = (board[i][j].isMine) ? MINE : (!board[i][j].minesAroundCount) ? EMPTY : board[i][j].minesAroundCount;
            contentBoard[i].push(cellContent);
        }
    }
    console.table(contentBoard);
}

function getColorClass(num) {
    var colorClass = '';
    switch (num) {
        case 1:
            colorClass = 'one';
            break;
        case 2:
            colorClass = 'two';
            break;
        case 3:
            colorClass = 'three';
            break;
        case 4:
            colorClass = 'four';
            break;
        case 5:
            colorClass = 'five';
            break;
        case 6:
            colorClass = 'six';
            break;
        case 7:
            colorClass = 'seven';
            break;
        case 8:
            colorClass = 'eight';
    }
    return colorClass;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getGameRunTime(newTime) {
    if (!newTime) newTime = Date.now();
    var timeDiff = newTime - gGame.startTime;
    var seconds = Math.floor((timeDiff / 1000) % 60);
    var minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return `${minutes}:${seconds}`;
}