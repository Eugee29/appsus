import { bookService } from './book.service.js'

export const googleBooksService = {
  fetchBooks,
  addBook,
}

function fetchBooks(title) {
  return fetch(`https://www.googleapis.com/books/v1/volumes?printType=books&q=${title}}`)
    .then(books => books.json()).then(books => books.items)
}

function addBook(book) {
  const { imageLinks } = book.volumeInfo
  let thumbnail
  if (!imageLinks) thumbnail = 'http://smartmobilestudio.com/wp-content/uploads/2012/06/leather-book-preview.png'
  else thumbnail = imageLinks.thumbnail
  const { authors, categories, language, pageCount,
    publishedDate, title } = book.volumeInfo

  return bookService
    .addBook(authors, categories, language, pageCount, +publishedDate, thumbnail, title)
}