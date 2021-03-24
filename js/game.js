'use strict'

var gBoard

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3
}

var gLevel = {
    SIZE: 4,
    MINES: 2
};

var playImg = `<img src="./img/play.png"></img>`
var victoryImg = `<img src="./img/victory.png"></img>`
var gameOverImg = `<img src="./img/game-over.png"></img>`

var mineImg = '💣'
var flagImg = '🏁'

var isFirstClick = true
var gCurrImg = playImg



function initGame() {

    gGame.isOn = true

    gBoard = buildBoard(gLevel.SIZE)

    renderBoard(gBoard)

}

function buildBoard(size) {

    var board = createMat(size)

    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board[i].length; j++) {

            var cell = {
                minesAroundCount: 0,
                isMine: false,
                isShown: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    return board
}

function placeMine(board, pos) {

    var poss = []

    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board[i].length; j++) {

            if (i === pos.i && j === pos.j || board[i][j].isMine) continue

            poss.push({ i: i, j: j })
        }
    }

    var posIdx = getRandomIntInclusive(0, poss.length - 1)

    var pos = poss[posIdx]

    var currCell = board[pos.i][pos.j]

    currCell.isMine = true
}

function setBoardMinesNegsCount(board) {

    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board[i].length; j++) {

            var currCell = board[i][j]

            var currPos = { i: i, j: j }

            currCell.minesAroundCount = setCellMinesNegsCount(board, currPos)
        }
    }
    renderBoard(board)
}

function setCellMinesNegsCount(board, pos) {

    var mineCount = 0

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {

        if (i < 0 || i >= board.length) continue

        for (var j = pos.j - 1; j <= pos.j + 1; j++) {

            if (j < 0 || j >= board[i].length) continue

            if (i === pos.i && j === pos.j) continue

            if (board[i][j].isMine) mineCount++
        }
    }
    return mineCount
}

function renderBoard(board) {

    if (!gGame.isOn) return

    var strHTML = '<tbody>';

    for (var i = 0; i < board.length; i++) {

        strHTML += '<tr>';

        for (var j = 0; j < board[0].length; j++) {

            var cell = board[i][j]

            var className = `cell`

            var cellId = ''

            var cellImg = ''

            if (cell.minesAroundCount) {
                cellImg = `${cell.minesAroundCount}`
                className += `  isNum`
            }

            if (cell.isMine) {
                cellImg = mineImg
                className += ` isMine`
            }

            if (cell.isMarked) {
                cellImg = flagImg
                className += ` isMarked`
            }

            className += (cell.isShown) ? ` show` : ` hide`

            cellId = `${i}-${j}`

            strHTML += `<td id="${cellId}" onmousedown="mouseClick(event , this)" class="${className}"><div>${cellImg}</div></td>`
        }

        strHTML += '</tr>'
    }

    strHTML += '</tbody>'

    var elContainer = document.querySelector("table")
    elContainer.innerHTML = strHTML

    var elSmiley = document.querySelector(".smiley")
    elSmiley.innerHTML = `${gCurrImg}`

    var elLivesCounter = document.querySelector(".lives-count span")
    elLivesCounter.innerText = gGame.lives

}

function showCell(elCell) {

    if (!elCell.classList.contains('hide')) return
    if (elCell.classList.contains('isMarked')) return

    var cellPos = getCellPos(elCell.id)
    var cell = gBoard[cellPos.i][cellPos.j]

    if (isFirstClick) {
        for (var i = 0; i < gLevel.MINES; i++) {
            placeMine(gBoard, cellPos)
        }
        setBoardMinesNegsCount(gBoard)
        isFirstClick = false
    }

    if (!cell.minesAroundCount) {
        expandShown(gBoard, cellPos)
    }

    cell.isShown = true
    gGame.shownCount++

    renderBoard(gBoard)
    checkGameOver(cell)
}

function markCell(elCell) {

    window.oncontextmenu = function () { return false }

    var cellPos = getCellPos(elCell.id)
    var cell = gBoard[cellPos.i][cellPos.j]

    if (elCell.classList.contains('isMarked')) {

        cell.isMarked = false
        gGame.markedCount--

    } else {


        cell.isMarked = true
        gGame.markedCount++
    }

    renderBoard(gBoard)
    checkVictory(gBoard)
}

function expandShown(board, pos) {

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {

        if (i < 0 || i >= board.length) continue

        for (var j = pos.j - 1; j <= pos.j + 1; j++) {

            if (j < 0 || j >= board[i].length) continue

            if (i === pos.i && j === pos.j) continue

            var cell = board[i][j]

            if (!board[i][j].isMine && !board[i][j].isShown) {
                cell.isShown = true
                gGame.shownCount++
            }
        }
    }

}

function checkGameOver(cell) {

    if (cell.isMine && !cell.isMarked) {
        gGame.lives--
        gGame.shownCount++
    }

    if (gGame.lives === 0) {

        var elMineCells = document.querySelectorAll(".isMine")

        for (var i = 0; i < elMineCells.length; i++) {
            elMineCells[i].classList.remove('hide')
        }

        console.log('Game Over');
        gCurrImg = gameOverImg
        renderBoard(gBoard)
        gGame.isOn = false
        return
    }

    renderBoard(gBoard)
}

function checkVictory(board) {

    if (gGame.shownCount >= (gLevel.SIZE ** 2) - gLevel.MINES) {
        console.log('Victory');
        gCurrImg = victoryImg
        renderBoard(board)
        gGame.isOn = false
        return
    }
}

function reSet() {

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    }

    isFirstClick = true
    gCurrImg = playImg

    initGame()
}


function changeLevel(elBtn) {
    var level = +elBtn.id
    gLevel.SIZE = level

    switch (level) {
        case 4:
            gLevel.MINES = 2
            break;

        case 8:
            gLevel.MINES = 12
            break;

        case 12:
            gLevel.MINES = 30
            break;

        default:
            break;
    }
    reSet()
}