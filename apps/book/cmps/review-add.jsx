import { utilService } from '../../../services/util.service.js'

export class ReviewAdd extends React.Component {

  state = {
    fullName: '',
    rate: 1,
    readAt: '',
    review: ''
  }

  dateRef = React.createRef()

  componentDidMount() {
    this.initDate()
  }

  initDate = () => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = utilService.padNum(today.getMonth() + 1)
    const dd = utilService.padNum(today.getDate())
    const date = `${yyyy}-${mm}-${dd}`
    this.dateRef.current.value = date
    this.setState({ readAt: date })
  }

  onAddReview = (ev) => {
    ev.preventDefault()
    this.props.onSaveReview(this.state)
    this.setState({
      fullName: '',
      rate: 1,
      readAt: null,
      review: ''
    })
  }

  handleChange = ({ target }) => {
    const field = target.name
    const value = (field === 'rate') ? +target.value : target.value
    this.setState({ [field]: value })
  }

  render() {

    const { fullName, ratedAt, review } = this.state

    return <section className="review-add">
      <form onSubmit={this.onAddReview}>
        <label htmlFor="full-name">Full name: </label>
        <input type="text" name="fullName" id="full-name" placeholder="Full name" value={fullName} onChange={this.handleChange} />

        <label htmlFor="rate">Rating: </label>
        <select name="rate" id="rate" onChange={this.handleChange}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

        <label htmlFor="read-at">Read at: </label>
        <input type="date" name="readAt" id="read-at" onChange={this.handleChange} ref={this.dateRef} value={ratedAt} />

        <label htmlFor="review">Review: </label>
        <textarea name="review" id="review" cols="30" rows="10" placeholder="Review" onChange={this.handleChange} value={review} />

        <button onClick={this.onAddReview}>Submit Review</button>
      </form>
    </section>
  }
}