import { bookService } from '../services/book.service.js'
import { googleBooksService } from '../services/google-books.service.js'
import { eventBusService } from '../../../services/event-bus-service.js'

import { BookList } from '../cmps/book-list.jsx'
import { BookFilter } from '../cmps/book-filter.jsx'
import { BookAdd } from '../cmps/book-add.jsx'

const { Link } = ReactRouterDOM

export class BookApp extends React.Component {
  state = {
    books: [],
    filter: null,
  }

  componentDidMount() {
    this.loadBooks()
  }

  loadBooks = () => {
    const { filter } = this.state
    bookService.query(filter).then((books) => this.setState({ books }))
  }

  onSetFilter = (filter) => {
    this.setState({ filter }, this.loadBooks)
  }

  onAddBook = (book) => {
    googleBooksService.addBook(book)
      .then((book) => {
        this.loadBooks()
        return book
      })
      .then((book) => {
        eventBusService
          .emit('user-msg', { type: 'success', txt: <Link to={`book/${book.id}`}>Book added</Link > }
          )
      })
  }

  render() {
    const { books } = this.state

    return (
      <section className="book-app no-aside-layout">
        <BookAdd onAddBook={this.onAddBook} />
        <BookFilter onSetFilter={this.onSetFilter} />
        <BookList books={books} />
      </section>
    )
  }
}
