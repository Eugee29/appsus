import { utilService } from '../../../services/util.service.js'
import { storageService } from '../../../services/storage.service.js'
import { eventBusService } from '../../../services/event-bus-service.js'

export const emailService = {
  query,
  getById,
  changeReadStatus,
  addEmail,
  deleteEmail,
  toggleStar,
  getUserName,
  getUnreadCount,
  updateEmail,
  sendEmail,
}

const KEY = 'emailDB'
const loggedInUser = {
  email: 'user@appsus.com',
  fullName: 'Mahatma Appsus',
}

function query(folder, filter, sortBy) {
  let emails = _loadFromStorage()

  if (!emails) {
    emails = _makeEmails()
    _saveToStorage(emails)
  }

  emails = _getEmailsFromFolder(emails, folder)
  if (filter) emails = _getFilteredEmails(emails, filter)
  emails = _sortEmails(emails, sortBy)

  return Promise.resolve(emails)
}

function getUserName() {
  return loggedInUser.fullName
}

function getById(emailId) {
  const emails = _loadFromStorage()
  const email = emails.find((email) => email.id === emailId)
  return Promise.resolve(email)
}

function changeReadStatus(emailId, isRead) {
  const emails = _loadFromStorage()
  const email = emails.find((email) => email.id === emailId)
  if (!isRead) isRead = !email.isRead
  email.isRead = isRead
  _saveToStorage(emails)
  return Promise.resolve()
}

function getUnreadCount() {
  const emails = _loadFromStorage()
  const unreads = emails.filter((email) => {
    return (
      !email.isRead &&
      !email.removedAt &&
      email.authorEmail !== loggedInUser.email
    )
  })
  return Promise.resolve(unreads.length)
}

function sendEmail(emailToSend) {
  const emails = _loadFromStorage()
  const email = emails.find(email => email.id === emailToSend.id)
  console.log(email)
  email.body = emailToSend.body
  email.subject = emailToSend.subject
  email.to = emailToSend.to
  email.isDraft = false
  _saveToStorage(emails)
  return Promise.resolve()
}

function addEmail({ subject, body, to }) {
  let emails = _loadFromStorage()
  const email = _makeEmail(
    subject,
    body,
    true,
    false,
    false,
    Date.now(),
    to,
    loggedInUser.fullName,
    loggedInUser.email,
    true
  )
  email.isRead = true
  emails = [email, ...emails]
  _saveToStorage(emails)
  return Promise.resolve(email)
}

function updateEmail(update) {
  const emails = _loadFromStorage()
  let email = emails.find(email => email.id === update.id)
  email.to = update.to
  email.subject = update.subject
  email.body = update.body
  _saveToStorage(emails)
  return Promise.resolve()
}

function deleteEmail(emailId) {
  let emails = _loadFromStorage()
  const email = emails.find((email) => email.id === emailId)
  if (email.removedAt) {
    emails = emails.filter((email) => email.id !== emailId)
    eventBusService.emit('user-msg', { txt: 'Email deleted', type: 'success' })
  } else {
    email.removedAt = Date.now()
    eventBusService.emit('user-msg', {
      txt: 'Email sent to trash',
      type: 'success',
    })
  }
  _saveToStorage(emails)
  return Promise.resolve(email)
}

function toggleStar(emailId) {
  const emails = _loadFromStorage()
  const email = emails.find((email) => email.id === emailId)
  email.isStarred = !email.isStarred
  _saveToStorage(emails)
  return Promise.resolve()
}

function _sortEmails(emails, sortBy) {
  let key
  if (sortBy.date !== undefined) key = 'date'
  else key = 'title'

  switch (key) {
    case 'date':
      emails = _sortByDate(emails, sortBy[key])
      break
    case 'title':
      emails = _sortByTitle(emails, sortBy[key])
      break
  }
  return emails
}

function _sortByDate(emails, isAsc) {
  return emails.sort((a, b) => {
    return isAsc ? b.sentAt - a.sentAt : a.sentAt - b.sentAt
  })
}

function _sortByTitle(emails, isAsc) {
  return emails.sort((a, b) => {
    return isAsc
      ? a.subject.localeCompare(b.subject)
      : b.subject.localeCompare(a.subject)
  })
}

function _getEmailsFromFolder(emails, folder) {
  switch (folder) {
    case 'inbox':
      emails = emails.filter(
        (email) => email.to === loggedInUser.email && !email.removedAt
      )
      break
    case 'starred':
      emails = emails.filter((email) => email.isStarred)
      break
    case 'sent':
      emails = emails.filter(
        (email) => email.authorEmail === loggedInUser.email && !email.removedAt && !email.isDraft)
      break
    case 'draft':
      emails = emails.filter(
        (email) => email.isDraft && !email.removedAt)
      break
    case 'trash':
      emails = emails.filter((email) => email.removedAt)
      break
  }
  return emails
}

function _getFilteredEmails(emails, filter) {
  const { search, option } = filter

  if (search) {
    const regex = new RegExp(search, 'i')
    emails = emails.filter((email) => {
      return (
        email.subject.search(regex) !== -1 ||
        email.authorName.search(regex) !== -1 ||
        email.body.search(regex) !== -1
      )
    })
  }

  if (option) {
    switch (option) {
      case 'read':
        emails = emails.filter((email) => email.isRead)
        break
      case 'unread':
        emails = emails.filter((email) => !email.isRead)
    }
  }
  return emails
}

function _saveToStorage(emails) {
  storageService.saveToStorage(KEY, emails)
}

function _loadFromStorage() {
  return storageService.loadFromStorage(KEY)
}

function _makeEmail(
  subject,
  body,
  isRead,
  removedAt,
  isStarred,
  sentAt,
  to,
  authorName,
  authorEmail,
  isDraft = false
) {
  return {
    id: utilService.makeId(),
    subject,
    body,
    isRead,
    removedAt,
    isStarred,
    sentAt,
    to,
    authorName,
    authorEmail,
    isDraft,
  }
}

function _makeEmails() {
  return [
    _makeEmail(
      'Miss you!',
      'Would love to catch up sometimes',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Date.now(),
      'momo@momo.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'How are you?',
      'How are you doing',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'bob@gmail.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Check out new APIs on RapidAPI',
      "We're constantly adding new APIs to the RapidAPI Hub. Search the Hub and see what you're missing out on!",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Team RapidAPI',
      'support@rapidapi.com'
    ),
    _makeEmail(
      'There’s a podcast for everyone. Find yours.',
      "Want to know what's good when it comes to podcasts?",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Spotify ',
      'no-reply@spotify.com'
    ),
    _makeEmail(
      'Car Extended Warranty',
      "We've been trying to reach you concerning your vehicle's extended warranty",
      Math.random() > 0.7 ? true : false,
      Date.now(),
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Warranty Master',
      'warrantym@appsus.com'
    ),
    _makeEmail(
      'Lorem Ipsum',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      Math.random() > 0.7 ? true : false,
      Date.now() - 1000,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Mr. Lorem',
      'lorem@ipsum.com'
    ),
    _makeEmail(
      'Your Dropbox is lonely. Add some files!',
      'Add files to your Dropbox Once your files are in Dropbox, they’ll be waiting for you anywhere you install the app—like your computer, phone, or tablet. Your files will also be securely backed up and easy to share, no matter what type of files they are.',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Dropbox',
      'no-reply@dropbox.com'
    ),
    _makeEmail(
      'Important policy updates coming to Discord',
      'Hey there, Some important changes are coming to Discord: we’re updating our Terms of Service, Privacy Policy, and Community Guidelines. These changes will take effect on March 28, 2022. We’re letting you know ahead of time so you can learn what’s changing. Here are the main things to know:  How we use your information We’ve updated our Privacy Policy to provide better clarity on what information we collect and how we use and share it.How we describe our services As Discord has evolved, it has become clear that not all communities on Discord are the same. We want users to understand the difference between posting in public and private spaces on Discord and to choose the appropriate space, features, and settings for them and their messages. New and clearer rules for prohibited content Our Community Guidelines now officially prohibit misinformation and disinformation, malicious impersonation, and better define spam and platform manipulation. We encourage you to read the updated documents in full. We’ve also summarized some of the most important changes in a post on the Discord Blog.These policies will be in effect on March 28, 2022. Using Discord on or after that date means you agree to these changes. Thanks for helping us build a place where everyone can belong.Discord',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Discord ',
      'no-reply@dropbox.com'
    ),

    _makeEmail(
      'Hello!',
      'Hello there',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'world@universe.all',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Miss you!',
      'Would love to catch up sometimes',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'momo@momo.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'How are you?',
      'How are you doing',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Date.now(),
      'bob@gmail.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Check out new APIs on RapidAPI',
      "We're constantly adding new APIs to the RapidAPI Hub. Search the Hub and see what you're missing out on!",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Team RapidAPI',
      'support@rapidapi.com'
    ),
    _makeEmail(
      'There’s a podcast for everyone. Find yours.',
      "Want to know what's good when it comes to podcasts?",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Spotify ',
      'no-reply@spotify.com'
    ),
    _makeEmail(
      'Car Extended Warranty',
      "We've been trying to reach you concerning your vehicle's extended warranty",
      Math.random() > 0.7 ? true : false,
      Date.now(),
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Warranty Master',
      'warrantym@appsus.com'
    ),
    _makeEmail(
      'Lorem Ipsum',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      Math.random() > 0.7 ? true : false,
      Date.now() - 1000,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Mr. Lorem',
      'lorem@ipsum.com'
    ),
    _makeEmail(
      'Your Dropbox is lonely. Add some files!',
      'Add files to your Dropbox Once your files are in Dropbox, they’ll be waiting for you anywhere you install the app—like your computer, phone, or tablet. Your files will also be securely backed up and easy to share, no matter what type of files they are.',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Dropbox',
      'no-reply@dropbox.com'
    ),
    _makeEmail(
      'Important policy updates coming to Discord',
      'Hey there, Some important changes are coming to Discord: we’re updating our Terms of Service, Privacy Policy, and Community Guidelines. These changes will take effect on March 28, 2022. We’re letting you know ahead of time so you can learn what’s changing. Here are the main things to know:  How we use your information We’ve updated our Privacy Policy to provide better clarity on what information we collect and how we use and share it.How we describe our services As Discord has evolved, it has become clear that not all communities on Discord are the same. We want users to understand the difference between posting in public and private spaces on Discord and to choose the appropriate space, features, and settings for them and their messages. New and clearer rules for prohibited content Our Community Guidelines now officially prohibit misinformation and disinformation, malicious impersonation, and better define spam and platform manipulation. We encourage you to read the updated documents in full. We’ve also summarized some of the most important changes in a post on the Discord Blog.These policies will be in effect on March 28, 2022. Using Discord on or after that date means you agree to these changes. Thanks for helping us build a place where everyone can belong.Discord',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Discord ',
      'no-reply@dropbox.com'
    ),

    _makeEmail(
      'Hello!',
      'Hello there',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'world@universe.all',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Miss you!',
      'Would love to catch up sometimes',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'momo@momo.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'How are you?',
      'How are you doing',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'bob@gmail.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Check out new APIs on RapidAPI',
      "We're constantly adding new APIs to the RapidAPI Hub. Search the Hub and see what you're missing out on!",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Team RapidAPI',
      'support@rapidapi.com'
    ),
    _makeEmail(
      'There’s a podcast for everyone. Find yours.',
      "Want to know what's good when it comes to podcasts?",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Spotify ',
      'no-reply@spotify.com'
    ),
    _makeEmail(
      'Car Extended Warranty',
      "We've been trying to reach you concerning your vehicle's extended warranty",
      Math.random() > 0.7 ? true : false,
      Date.now(),
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Warranty Master',
      'warrantym@appsus.com'
    ),
    _makeEmail(
      'Lorem Ipsum',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      Math.random() > 0.7 ? true : false,
      Date.now() - 1000,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Mr. Lorem',
      'lorem@ipsum.com'
    ),
    _makeEmail(
      'Your Dropbox is lonely. Add some files!',
      'Add files to your Dropbox Once your files are in Dropbox, they’ll be waiting for you anywhere you install the app—like your computer, phone, or tablet. Your files will also be securely backed up and easy to share, no matter what type of files they are.',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Dropbox',
      'no-reply@dropbox.com'
    ),
    _makeEmail(
      'Important policy updates coming to Discord',
      'Hey there, Some important changes are coming to Discord: we’re updating our Terms of Service, Privacy Policy, and Community Guidelines. These changes will take effect on March 28, 2022. We’re letting you know ahead of time so you can learn what’s changing. Here are the main things to know:  How we use your information We’ve updated our Privacy Policy to provide better clarity on what information we collect and how we use and share it.How we describe our services As Discord has evolved, it has become clear that not all communities on Discord are the same. We want users to understand the difference between posting in public and private spaces on Discord and to choose the appropriate space, features, and settings for them and their messages. New and clearer rules for prohibited content Our Community Guidelines now officially prohibit misinformation and disinformation, malicious impersonation, and better define spam and platform manipulation. We encourage you to read the updated documents in full. We’ve also summarized some of the most important changes in a post on the Discord Blog.These policies will be in effect on March 28, 2022. Using Discord on or after that date means you agree to these changes. Thanks for helping us build a place where everyone can belong.Discord',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Discord ',
      'no-reply@dropbox.com'
    ),

    _makeEmail(
      'Hello!',
      'Hello there',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'world@universe.all',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Miss you!',
      'Would love to catch up sometimes',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'momo@momo.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'How are you?',
      'How are you doing',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'bob@gmail.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Check out new APIs on RapidAPI',
      "We're constantly adding new APIs to the RapidAPI Hub. Search the Hub and see what you're missing out on!",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Team RapidAPI',
      'support@rapidapi.com'
    ),
    _makeEmail(
      'There’s a podcast for everyone. Find yours.',
      "Want to know what's good when it comes to podcasts?",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Spotify ',
      'no-reply@spotify.com'
    ),
    _makeEmail(
      'Car Extended Warranty',
      "We've been trying to reach you concerning your vehicle's extended warranty",
      Math.random() > 0.7 ? true : false,
      Date.now(),
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Warranty Master',
      'warrantym@appsus.com'
    ),
    _makeEmail(
      'Lorem Ipsum',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      Math.random() > 0.7 ? true : false,
      Date.now() - 1000,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Mr. Lorem',
      'lorem@ipsum.com'
    ),
    _makeEmail(
      'Your Dropbox is lonely. Add some files!',
      'Add files to your Dropbox Once your files are in Dropbox, they’ll be waiting for you anywhere you install the app—like your computer, phone, or tablet. Your files will also be securely backed up and easy to share, no matter what type of files they are.',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Dropbox',
      'no-reply@dropbox.com'
    ),
    _makeEmail(
      'Important policy updates coming to Discord',
      'Hey there, Some important changes are coming to Discord: we’re updating our Terms of Service, Privacy Policy, and Community Guidelines. These changes will take effect on March 28, 2022. We’re letting you know ahead of time so you can learn what’s changing. Here are the main things to know:  How we use your information We’ve updated our Privacy Policy to provide better clarity on what information we collect and how we use and share it.How we describe our services As Discord has evolved, it has become clear that not all communities on Discord are the same. We want users to understand the difference between posting in public and private spaces on Discord and to choose the appropriate space, features, and settings for them and their messages. New and clearer rules for prohibited content Our Community Guidelines now officially prohibit misinformation and disinformation, malicious impersonation, and better define spam and platform manipulation. We encourage you to read the updated documents in full. We’ve also summarized some of the most important changes in a post on the Discord Blog.These policies will be in effect on March 28, 2022. Using Discord on or after that date means you agree to these changes. Thanks for helping us build a place where everyone can belong.Discord',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Discord ',
      'no-reply@dropbox.com'
    ),

    _makeEmail(
      'Hello!',
      'Hello there',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'world@universe.all',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Miss you!',
      'Would love to catch up sometimes',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'momo@momo.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'How are you?',
      'How are you doing',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'bob@gmail.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Check out new APIs on RapidAPI',
      "We're constantly adding new APIs to the RapidAPI Hub. Search the Hub and see what you're missing out on!",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Team RapidAPI',
      'support@rapidapi.com'
    ),
    _makeEmail(
      'There’s a podcast for everyone. Find yours.',
      "Want to know what's good when it comes to podcasts?",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Spotify ',
      'no-reply@spotify.com'
    ),
    _makeEmail(
      'Car Extended Warranty',
      "We've been trying to reach you concerning your vehicle's extended warranty",
      Math.random() > 0.7 ? true : false,
      Date.now(),
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Warranty Master',
      'warrantym@appsus.com'
    ),
    _makeEmail(
      'Lorem Ipsum',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      Math.random() > 0.7 ? true : false,
      Date.now() - 1000,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Mr. Lorem',
      'lorem@ipsum.com'
    ),
    _makeEmail(
      'Your Dropbox is lonely. Add some files!',
      'Add files to your Dropbox Once your files are in Dropbox, they’ll be waiting for you anywhere you install the app—like your computer, phone, or tablet. Your files will also be securely backed up and easy to share, no matter what type of files they are.',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Dropbox',
      'no-reply@dropbox.com'
    ),
    _makeEmail(
      'Important policy updates coming to Discord',
      'Hey there, Some important changes are coming to Discord: we’re updating our Terms of Service, Privacy Policy, and Community Guidelines. These changes will take effect on March 28, 2022. We’re letting you know ahead of time so you can learn what’s changing. Here are the main things to know:  How we use your information We’ve updated our Privacy Policy to provide better clarity on what information we collect and how we use and share it.How we describe our services As Discord has evolved, it has become clear that not all communities on Discord are the same. We want users to understand the difference between posting in public and private spaces on Discord and to choose the appropriate space, features, and settings for them and their messages. New and clearer rules for prohibited content Our Community Guidelines now officially prohibit misinformation and disinformation, malicious impersonation, and better define spam and platform manipulation. We encourage you to read the updated documents in full. We’ve also summarized some of the most important changes in a post on the Discord Blog.These policies will be in effect on March 28, 2022. Using Discord on or after that date means you agree to these changes. Thanks for helping us build a place where everyone can belong.Discord',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Discord ',
      'no-reply@dropbox.com'
    ),

    _makeEmail(
      'Hello!',
      'Hello there',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'world@universe.all',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Miss you!',
      'Would love to catch up sometimes',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'momo@momo.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'How are you?',
      'How are you doing',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'bob@gmail.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Check out new APIs on RapidAPI',
      "We're constantly adding new APIs to the RapidAPI Hub. Search the Hub and see what you're missing out on!",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Team RapidAPI',
      'support@rapidapi.com'
    ),
    _makeEmail(
      'There’s a podcast for everyone. Find yours.',
      "Want to know what's good when it comes to podcasts?",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Spotify ',
      'no-reply@spotify.com'
    ),
    _makeEmail(
      'Car Extended Warranty',
      "We've been trying to reach you concerning your vehicle's extended warranty",
      Math.random() > 0.7 ? true : false,
      Date.now(),
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Warranty Master',
      'warrantym@appsus.com'
    ),
    _makeEmail(
      'Lorem Ipsum',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      Math.random() > 0.7 ? true : false,
      Date.now() - 1000,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Mr. Lorem',
      'lorem@ipsum.com'
    ),
    _makeEmail(
      'Your Dropbox is lonely. Add some files!',
      'Add files to your Dropbox Once your files are in Dropbox, they’ll be waiting for you anywhere you install the app—like your computer, phone, or tablet. Your files will also be securely backed up and easy to share, no matter what type of files they are.',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Dropbox',
      'no-reply@dropbox.com'
    ),
    _makeEmail(
      'Important policy updates coming to Discord',
      'Hey there, Some important changes are coming to Discord: we’re updating our Terms of Service, Privacy Policy, and Community Guidelines. These changes will take effect on March 28, 2022. We’re letting you know ahead of time so you can learn what’s changing. Here are the main things to know:  How we use your information We’ve updated our Privacy Policy to provide better clarity on what information we collect and how we use and share it.How we describe our services As Discord has evolved, it has become clear that not all communities on Discord are the same. We want users to understand the difference between posting in public and private spaces on Discord and to choose the appropriate space, features, and settings for them and their messages. New and clearer rules for prohibited content Our Community Guidelines now officially prohibit misinformation and disinformation, malicious impersonation, and better define spam and platform manipulation. We encourage you to read the updated documents in full. We’ve also summarized some of the most important changes in a post on the Discord Blog.These policies will be in effect on March 28, 2022. Using Discord on or after that date means you agree to these changes. Thanks for helping us build a place where everyone can belong.Discord',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Discord ',
      'no-reply@dropbox.com'
    ),

    _makeEmail(
      'Hello!',
      'Hello there',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'world@universe.all',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Miss you!',
      'Would love to catch up sometimes',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'momo@momo.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'How are you?',
      'How are you doing',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'bob@gmail.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Check out new APIs on RapidAPI',
      "We're constantly adding new APIs to the RapidAPI Hub. Search the Hub and see what you're missing out on!",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Team RapidAPI',
      'support@rapidapi.com'
    ),
    _makeEmail(
      'There’s a podcast for everyone. Find yours.',
      "Want to know what's good when it comes to podcasts?",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Spotify ',
      'no-reply@spotify.com'
    ),
    _makeEmail(
      'Car Extended Warranty',
      "We've been trying to reach you concerning your vehicle's extended warranty",
      Math.random() > 0.7 ? true : false,
      Date.now(),
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Warranty Master',
      'warrantym@appsus.com'
    ),
    _makeEmail(
      'Lorem Ipsum',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      Math.random() > 0.7 ? true : false,
      Date.now() - 1000,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Mr. Lorem',
      'lorem@ipsum.com'
    ),
    _makeEmail(
      'Your Dropbox is lonely. Add some files!',
      'Add files to your Dropbox Once your files are in Dropbox, they’ll be waiting for you anywhere you install the app—like your computer, phone, or tablet. Your files will also be securely backed up and easy to share, no matter what type of files they are.',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Dropbox',
      'no-reply@dropbox.com'
    ),
    _makeEmail(
      'Important policy updates coming to Discord',
      'Hey there, Some important changes are coming to Discord: we’re updating our Terms of Service, Privacy Policy, and Community Guidelines. These changes will take effect on March 28, 2022. We’re letting you know ahead of time so you can learn what’s changing. Here are the main things to know:  How we use your information We’ve updated our Privacy Policy to provide better clarity on what information we collect and how we use and share it.How we describe our services As Discord has evolved, it has become clear that not all communities on Discord are the same. We want users to understand the difference between posting in public and private spaces on Discord and to choose the appropriate space, features, and settings for them and their messages. New and clearer rules for prohibited content Our Community Guidelines now officially prohibit misinformation and disinformation, malicious impersonation, and better define spam and platform manipulation. We encourage you to read the updated documents in full. We’ve also summarized some of the most important changes in a post on the Discord Blog.These policies will be in effect on March 28, 2022. Using Discord on or after that date means you agree to these changes. Thanks for helping us build a place where everyone can belong.Discord',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Discord ',
      'no-reply@dropbox.com'
    ),

    _makeEmail(
      'Hello!',
      'Hello there',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'world@universe.all',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Miss you!',
      'Would love to catch up sometimes',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'momo@momo.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'How are you?',
      'How are you doing',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'bob@gmail.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Check out new APIs on RapidAPI',
      "We're constantly adding new APIs to the RapidAPI Hub. Search the Hub and see what you're missing out on!",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Team RapidAPI',
      'support@rapidapi.com'
    ),
    _makeEmail(
      'There’s a podcast for everyone. Find yours.',
      "Want to know what's good when it comes to podcasts?",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Spotify ',
      'no-reply@spotify.com'
    ),
    _makeEmail(
      'Car Extended Warranty',
      "We've been trying to reach you concerning your vehicle's extended warranty",
      Math.random() > 0.7 ? true : false,
      Date.now(),
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Warranty Master',
      'warrantym@appsus.com'
    ),
    _makeEmail(
      'Lorem Ipsum',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      Math.random() > 0.7 ? true : false,
      Date.now() - 1000,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Mr. Lorem',
      'lorem@ipsum.com'
    ),
    _makeEmail(
      'Your Dropbox is lonely. Add some files!',
      'Add files to your Dropbox Once your files are in Dropbox, they’ll be waiting for you anywhere you install the app—like your computer, phone, or tablet. Your files will also be securely backed up and easy to share, no matter what type of files they are.',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Dropbox',
      'no-reply@dropbox.com'
    ),
    _makeEmail(
      'Important policy updates coming to Discord',
      'Hey there, Some important changes are coming to Discord: we’re updating our Terms of Service, Privacy Policy, and Community Guidelines. These changes will take effect on March 28, 2022. We’re letting you know ahead of time so you can learn what’s changing. Here are the main things to know:  How we use your information We’ve updated our Privacy Policy to provide better clarity on what information we collect and how we use and share it.How we describe our services As Discord has evolved, it has become clear that not all communities on Discord are the same. We want users to understand the difference between posting in public and private spaces on Discord and to choose the appropriate space, features, and settings for them and their messages. New and clearer rules for prohibited content Our Community Guidelines now officially prohibit misinformation and disinformation, malicious impersonation, and better define spam and platform manipulation. We encourage you to read the updated documents in full. We’ve also summarized some of the most important changes in a post on the Discord Blog.These policies will be in effect on March 28, 2022. Using Discord on or after that date means you agree to these changes. Thanks for helping us build a place where everyone can belong.Discord',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Discord ',
      'no-reply@dropbox.com'
    ),

    _makeEmail(
      'Hello!',
      'Hello there',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'world@universe.all',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Miss you!',
      'Would love to catch up sometimes',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'momo@momo.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'How are you?',
      'How are you doing',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'bob@gmail.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Check out new APIs on RapidAPI',
      "We're constantly adding new APIs to the RapidAPI Hub. Search the Hub and see what you're missing out on!",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Team RapidAPI',
      'support@rapidapi.com'
    ),
    _makeEmail(
      'There’s a podcast for everyone. Find yours.',
      "Want to know what's good when it comes to podcasts?",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Spotify ',
      'no-reply@spotify.com'
    ),
    _makeEmail(
      'Car Extended Warranty',
      "We've been trying to reach you concerning your vehicle's extended warranty",
      Math.random() > 0.7 ? true : false,
      Date.now(),
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Warranty Master',
      'warrantym@appsus.com'
    ),
    _makeEmail(
      'Lorem Ipsum',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      Math.random() > 0.7 ? true : false,
      Date.now() - 1000,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Mr. Lorem',
      'lorem@ipsum.com'
    ),
    _makeEmail(
      'Your Dropbox is lonely. Add some files!',
      'Add files to your Dropbox Once your files are in Dropbox, they’ll be waiting for you anywhere you install the app—like your computer, phone, or tablet. Your files will also be securely backed up and easy to share, no matter what type of files they are.',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Dropbox',
      'no-reply@dropbox.com'
    ),
    _makeEmail(
      'Important policy updates coming to Discord',
      'Hey there, Some important changes are coming to Discord: we’re updating our Terms of Service, Privacy Policy, and Community Guidelines. These changes will take effect on March 28, 2022. We’re letting you know ahead of time so you can learn what’s changing. Here are the main things to know:  How we use your information We’ve updated our Privacy Policy to provide better clarity on what information we collect and how we use and share it.How we describe our services As Discord has evolved, it has become clear that not all communities on Discord are the same. We want users to understand the difference between posting in public and private spaces on Discord and to choose the appropriate space, features, and settings for them and their messages. New and clearer rules for prohibited content Our Community Guidelines now officially prohibit misinformation and disinformation, malicious impersonation, and better define spam and platform manipulation. We encourage you to read the updated documents in full. We’ve also summarized some of the most important changes in a post on the Discord Blog.These policies will be in effect on March 28, 2022. Using Discord on or after that date means you agree to these changes. Thanks for helping us build a place where everyone can belong.Discord',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Discord ',
      'no-reply@dropbox.com'
    ),

    _makeEmail(
      'Hello!',
      'Hello there',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'world@universe.all',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Miss you!',
      'Would love to catch up sometimes',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Date.now(),
      'momo@momo.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'How are you?',
      'How are you doing',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'bob@gmail.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Check out new APIs on RapidAPI',
      "We're constantly adding new APIs to the RapidAPI Hub. Search the Hub and see what you're missing out on!",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Team RapidAPI',
      'support@rapidapi.com'
    ),
    _makeEmail(
      'There’s a podcast for everyone. Find yours.',
      "Want to know what's good when it comes to podcasts?",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Spotify ',
      'no-reply@spotify.com'
    ),
    _makeEmail(
      'Car Extended Warranty',
      "We've been trying to reach you concerning your vehicle's extended warranty",
      Math.random() > 0.7 ? true : false,
      Date.now(),
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Warranty Master',
      'warrantym@appsus.com'
    ),
    _makeEmail(
      'Lorem Ipsum',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      Math.random() > 0.7 ? true : false,
      Date.now() - 1000,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Mr. Lorem',
      'lorem@ipsum.com'
    ),
    _makeEmail(
      'Your Dropbox is lonely. Add some files!',
      'Add files to your Dropbox Once your files are in Dropbox, they’ll be waiting for you anywhere you install the app—like your computer, phone, or tablet. Your files will also be securely backed up and easy to share, no matter what type of files they are.',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Dropbox',
      'no-reply@dropbox.com'
    ),
    _makeEmail(
      'Important policy updates coming to Discord',
      'Hey there, Some important changes are coming to Discord: we’re updating our Terms of Service, Privacy Policy, and Community Guidelines. These changes will take effect on March 28, 2022. We’re letting you know ahead of time so you can learn what’s changing. Here are the main things to know:  How we use your information We’ve updated our Privacy Policy to provide better clarity on what information we collect and how we use and share it.How we describe our services As Discord has evolved, it has become clear that not all communities on Discord are the same. We want users to understand the difference between posting in public and private spaces on Discord and to choose the appropriate space, features, and settings for them and their messages. New and clearer rules for prohibited content Our Community Guidelines now officially prohibit misinformation and disinformation, malicious impersonation, and better define spam and platform manipulation. We encourage you to read the updated documents in full. We’ve also summarized some of the most important changes in a post on the Discord Blog.These policies will be in effect on March 28, 2022. Using Discord on or after that date means you agree to these changes. Thanks for helping us build a place where everyone can belong.Discord',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Discord ',
      'no-reply@dropbox.com'
    ),

    _makeEmail(
      'Hello!',
      'Hello there',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'world@universe.all',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Miss you!',
      'Would love to catch up sometimes',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'momo@momo.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'How are you?',
      'How are you doing',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'bob@gmail.com',
      loggedInUser.fullName,
      loggedInUser.email
    ),
    _makeEmail(
      'Check out new APIs on RapidAPI',
      "We're constantly adding new APIs to the RapidAPI Hub. Search the Hub and see what you're missing out on!",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Team RapidAPI',
      'support@rapidapi.com'
    ),
    _makeEmail(
      'There’s a podcast for everyone. Find yours.',
      "Want to know what's good when it comes to podcasts?",
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Spotify ',
      'no-reply@spotify.com'
    ),
    _makeEmail(
      'Car Extended Warranty',
      "We've been trying to reach you concerning your vehicle's extended warranty",
      Math.random() > 0.7 ? true : false,
      Date.now(),
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Warranty Master',
      'warrantym@appsus.com'
    ),
    _makeEmail(
      'Lorem Ipsum',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      Math.random() > 0.7 ? true : false,
      Date.now() - 1000,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Mr. Lorem',
      'lorem@ipsum.com'
    ),
    _makeEmail(
      'Your Dropbox is lonely. Add some files!',
      'Add files to your Dropbox Once your files are in Dropbox, they’ll be waiting for you anywhere you install the app—like your computer, phone, or tablet. Your files will also be securely backed up and easy to share, no matter what type of files they are.',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Dropbox',
      'no-reply@dropbox.com'
    ),
    _makeEmail(
      'Important policy updates coming to Discord',
      'Hey there, Some important changes are coming to Discord: we’re updating our Terms of Service, Privacy Policy, and Community Guidelines. These changes will take effect on March 28, 2022. We’re letting you know ahead of time so you can learn what’s changing. Here are the main things to know:  How we use your information We’ve updated our Privacy Policy to provide better clarity on what information we collect and how we use and share it.How we describe our services As Discord has evolved, it has become clear that not all communities on Discord are the same. We want users to understand the difference between posting in public and private spaces on Discord and to choose the appropriate space, features, and settings for them and their messages. New and clearer rules for prohibited content Our Community Guidelines now officially prohibit misinformation and disinformation, malicious impersonation, and better define spam and platform manipulation. We encourage you to read the updated documents in full. We’ve also summarized some of the most important changes in a post on the Discord Blog.These policies will be in effect on March 28, 2022. Using Discord on or after that date means you agree to these changes. Thanks for helping us build a place where everyone can belong.Discord',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      loggedInUser.email,
      'Discord ',
      'no-reply@dropbox.com'
    ),

    _makeEmail(
      'Hello!',
      'Hello there',
      Math.random() > 0.7 ? true : false,
      Math.random() > 0.7 ? Date.now() - 1000 : null,
      Math.random() > 0.7 ? true : false,
      Math.random() * Date.now(),
      'world@universe.all',
      loggedInUser.fullName,
      loggedInUser.email
    ),
  ]
}
