'use strict'

var gBoard

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    safeClicks: 3
}

var gLevel = {
    SIZE: 4,
    MINES: 2,
    lives: 3
}

var elPlayImg = document.querySelector('.play')
var elVictoryImg = document.querySelector('.victory')
var elGameOverImg = document.querySelector('.game-over')

var mineImg = '💣'
var flagImg = '🏁'

var isFirstClick = true
var isHint = false
var elCurrHintBtn
var hintPosissions = []


function initGame() {

    gGame.isOn = true

    var elMinutes = document.querySelector('.min')
    elMinutes.innerText = 0
    var elSeconds = document.querySelector('.sec')
    elSeconds.innerText = 0

    clearInterval(gGameInterval)

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

            className += (cell.isShown || cell.isMarked) ? ` show` : ` hide`
            cellId = `cell-${i}-${j}`
            strHTML += `<td id="${cellId}" onmousedown="mouseClick(event , this)" class="${className}"><div>${cellImg}</div></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody>'

    var elContainer = document.querySelector("table")
    elContainer.innerHTML = strHTML

    var elLivesCounter = document.querySelector(".lives-count span")
    elLivesCounter.innerText = gLevel.lives

    var elSafeButtonCounter = document.querySelector(".safe-click span")
    elSafeButtonCounter.innerText = gGame.safeClicks

    var elMinesCounter = document.querySelector(".mine-count span")
    elMinesCounter.innerText = gLevel.MINES - gGame.markedCount

}

function showCell(elCell) {

    if (isHint) {
        showHint(elCell)
        setTimeout(function () {
            for (var i = 0; i < hintPosissions.length; i++) {
                var cellPos = hintPosissions[i]
                gBoard[cellPos.i][cellPos.j].isShown = false
            }
            elCurrHintBtn.hidden = true
            renderBoard(gBoard)
        }, 1000);
        return
    }

    if (!elCell.classList.contains('hide')) return
    if (elCell.classList.contains('isMarked')) return

    var cellPos = getCellPos(elCell.id)
    var cell = gBoard[cellPos.i][cellPos.j]

    cell.isShown = true

    if (isFirstClick) {

        timer()

        for (var i = 0; i < gLevel.MINES; i++) {
            placeMine(gBoard, cellPos)
        }
        setBoardMinesNegsCount(gBoard)
        isFirstClick = false
    }

    if (!cell.minesAroundCount && !cell.isMine) expandShown(gBoard, cellPos)
    if (!cell.isMine) gGame.shownCount++
    if (cell.isMine) gGame.markedCount++




    renderBoard(gBoard)
    checkGameOver(cell)
    checkVictory(gBoard)
}

function markCell(elCell) {

    if (isHint) return

    if (gGame.markedCount >= gLevel.MINES && !elCell.classList.contains('isMarked')) return

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

            if (!cell.isMine && !cell.isShown) {
                cell.isShown = true
                gGame.shownCount++
                if (cell.minesAroundCount === 0) expandShown(board, { i: i, j: j })
            }
        }
    }
}

function checkGameOver(cell) {

    if (!gGame.isOn) return

    if (cell.isMine && !cell.isMarked) {
        gLevel.lives--
    }

    if (gLevel.lives === 0) {
        var elMineCells = document.querySelectorAll(".isMine")

        for (var i = 0; i < elMineCells.length; i++) {
            elMineCells[i].classList.remove('hide')
        }

        console.log(timePass);
        clearInterval(gGameInterval)
        elPlayImg.hidden = true
        elGameOverImg.hidden = false

        renderBoard(gBoard)
        gGame.isOn = false
        return
    }

    renderBoard(gBoard)
}

function checkVictory(board) {

    if (!gGame.isOn) return

    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {

        clearInterval(gGameInterval)

        elPlayImg.hidden = true
        elVictoryImg.hidden = false
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
        safeClicks: 3
    }

    isFirstClick = true
    elPlayImg.hidden = false
    elVictoryImg.hidden = true
    elGameOverImg.hidden = true

    isHint = false

    var elHints = document.querySelectorAll('.hint')
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].classList.remove('click')
        elHints[i].hidden = false
    }

    gLevel.lives = 3

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

function getHint(elBtn) {
    if (isFirstClick) return
    isHint = true
    elBtn.classList.add('click')
    elCurrHintBtn = elBtn
}

function showHint(elCell) {

    var pos = getCellPos(elCell.id)

    var cell = gBoard[pos.i][pos.j]

    hintPosissions = []

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue

            if (gBoard[i][j].isShown) continue

            var cell = gBoard[i][j]
            var cellPos = { i: i, j: j }
            hintPosissions.push(cellPos)
            cell.isShown = true
        }
    }
    renderBoard(gBoard)

    isHint = false
}

function safeClick() {

    var safeCells = []

    if (gGame.safeClicks < 1) return

    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[0].length; j++) {

            if (gBoard[i][j].isMine === false && gBoard[i][j].isShown === false) {

                var cellPos = {i:i,j:j}

                safeCells.push(cellPos)
            }
        }
    }

    var randIdx = getRandomIntInclusive(0,safeCells.length-1)

    var randCellPos = safeCells[randIdx]

    var selector = `cell-${randCellPos.i}-${randCellPos.j}`

    var elCell = document.querySelector(`#${selector}`)

    elCell.classList.add('isSafe')

    gGame.safeClicks--

    setTimeout(function () {
        elCell.classList.remove('isSafe')
    }, 1000);

    var elSafeButtonCounter = document.querySelector(".safe-click span")
    elSafeButtonCounter.innerText = gGame.safeClicks
}