import { googleBooksService } from '../services/google-books.service.js'

export class BookAdd extends React.Component {

  state = {
    books: null,
  }

  handleChange = ({ target }) => {
    googleBooksService.fetchBooks(target.value)
      .then(books => this.setState({ books }))
  }


  render() {
    const { title, books, isFocused } = this.state
    return <section className="book-add">
      <input type="search" placeholder="Search for a book" onChange={this.handleChange} />
      {books && <BooksSuggestions books={books} onAddBook={this.props.onAddBook} />}
    </section>
  }
}

function BooksSuggestions({ books, onAddBook }) {
  return <div className="books-suggestions">
    <ul>
      {books.map(book => {
        return <li key={book.id}>
          <button onClick={() => onAddBook(book)}>+</button>
          {book.volumeInfo.title}
        </li>
      })}
    </ul>
  </div>
}