import { utilService } from '../../../services/util.service.js'

export const emailUtilService = {
  getTimeToShow,
}

function getTimeToShow(timestamp) {
  const date = new Date(timestamp)
  if (_isToday(date)) return `${utilService.padNum(date.getHours())}:${utilService.padNum(date.getMinutes())}`
  if (_isThisYear(date)) return `${utilService.padNum(date.getDate())}/${utilService.padNum((date.getMonth() + 1))}`
  return date.toDateString()
}

function _isToday(date) {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

function _isThisYear(date) {
  const today = new Date()
  return date.getFullYear() === today.getFullYear()
}