'use strict'

var gGameInterval
var startTime
var timePass
var gMinutes
var gSeconds


function createMat(size) {
    var mat = []
    for (var i = 0; i < size; i++) {
        var row = []
        for (var j = 0; j < size; j++) {
            row.push({})
        }
        mat.push(row)
    }
    return mat
}


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function mouseClick(event, elBtn) {
    if (event.button === 0) showCell(elBtn)
    if (event.button === 2) markCell(elBtn)
}


function getCellPos(strCellId) {
    var parts = strCellId.split('-')
    var pos = { i: +parts[0], j: +parts[1] };
    return pos;
}


function timer() {
    var elMinutes = document.querySelector('.min')
    var elSeconds = document.querySelector('.sec')

    startTime = Date.now()

    gGameInterval = setInterval(function () {

        timePass = Date.now() - startTime

        gMinutes = Math.floor(timePass / 1000 / 60) + ''
        gSeconds = Math.floor(timePass / 1000 - gMinutes * 60)

        elMinutes.innerText = gMinutes
        elSeconds.innerText = gSeconds

    }, 1000);
}

