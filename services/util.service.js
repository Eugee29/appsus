export const utilService = {
  makeId,
  generateRandomColor,
  padNum,
}

function makeId(length = 6) {
  var txt = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return txt
}

function generateRandomColor() {
  let maxVal = 0xFFFFFF // 16777215
  let randomNumber = Math.random() * maxVal
  randomNumber = Math.floor(randomNumber)
  randomNumber = randomNumber.toString(16)
  let randColor = randomNumber.padStart(6, 0)
  return `#${randColor.toUpperCase()}`
}

function padNum(num) {
  return num < 10 ? `0${num}` : num
}