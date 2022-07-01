import { bookService } from '../services/book.service.js'
import { eventBusService } from '../../../services/event-bus-service.js'
import { LongTxt } from '../../../cmps/long-txt.jsx'
import { ReviewAdd } from '../cmps/review-add.jsx'
import { BookReviews } from '../cmps/book-reviews.jsx'

const { Link } = ReactRouterDOM

export class BookDetails extends React.Component {
  state = {
    book: null,
  }

  componentDidMount() {
    this.loadBook()
  }

  componentDidUpdate(prevState) {
    if (this.props.match.params !== prevState.match.params) this.loadBook()
  }

  loadBook = () => {
    const { bookId } = this.props.match.params
    bookService
      .getById(bookId)
      .then((book) => this.setState({ book }))
      .catch((book) => this.setState({ book }))
  }

  onSaveReview = (review) => {
    const { bookId } = this.props.match.params
    bookService.addReview(bookId, review)
      .then(this.loadBook)
      .then(eventBusService.emit('user-msg', { type: 'success', txt: 'Review added' }))
  }

  onDeleteReview = (reviewId) => {
    bookService.deleteReview(this.state.book.id, reviewId)
      .then(this.loadBook)
      .then(eventBusService.emit('user-msg', { type: 'success', txt: 'Review deleted' }))
  }

  render() {
    const { book } = this.state

    if (!book) return <h1>Loading...</h1>
    if (book === '404') return <h1>404 Page not found</h1>

    const nextBookId = bookService.getNextBookId(book.id)
    const prevBookId = bookService.getPrevBookId(book.id)
    let { authors, categories, description, language, listPrice, pageCount, publishedDate, subtitle, thumbnail, title, reviews } = book
    const bookAge = Date.now() - publishedDate
    let priceRange = 'normal'
    if (listPrice.amount > 150) priceRange = 'expensive'
    else if (listPrice.amount < 20) priceRange = 'cheap'

    if (!authors) authors = ['Unknown']
    if (!categories) categories = ['Unknown']

    return (
      <section className="book-details no-aside-layout">

        <nav>
          <Link className="go-back" to="/book">« Back</Link>
          <Link to={`/book/${prevBookId}`}>Previous</Link>
          <Link to={`/book/${nextBookId}`}>Next</Link>
        </nav>
        {listPrice.isOnSale && <h1 className="sale"> SALE!</h1>}
        <img src={thumbnail} />
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
        <h3>By: {authors.join(', ')}</h3>
        <h4>Categories: {categories.join(', ')}</h4>
        <h5>Language: {language}</h5>
        <h6>Published: {publishedDate}</h6>
        {bookAge > 10 && <h6>Veteran Book</h6>}
        {bookAge < 1 && <h6>New!</h6>}
        <h6>Pages: {pageCount}</h6>
        {pageCount > 500 && <h6>Long Reading</h6>}
        {pageCount > 200 && pageCount < 500 && <h6>Decent Reading</h6>}
        {pageCount < 100 && <h6>Light Reading</h6>}
        <LongTxt text={description} />
        <h6 className={priceRange}>
          Price: {listPrice.amount} {listPrice.currencyCode}
        </h6>
        <ReviewAdd bookId={book.id} onSaveReview={this.onSaveReview} />
        {reviews && <BookReviews reviews={reviews} onDeleteReview={this.onDeleteReview} />}
      </section>
    )
  }
}
