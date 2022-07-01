export class EmailSort extends React.Component {

  state = {
    sortBy: { date: true }
  }

  onSetSortBy = ({ target }) => {
    this.setState(({ sortBy }) => ({
      sortBy: { [target.name]: !sortBy[target.name] }
    }), () => this.props.onSetSort(this.state.sortBy))
  }

  render() {
    let dateTxt = this.state.sortBy.date ? 'Newest First' : 'Oldest First'
    if (this.state.sortBy.date === undefined) dateTxt = 'By Date'
    let titleTxt = this.state.sortBy.title ? 'Title ↓' : 'Title ↑'
    if (this.state.sortBy.title === undefined) titleTxt = 'Title'

    return <section className="email-sort">
      <button className="by-date" name="date" onClick={this.onSetSortBy}>{dateTxt}</button>
      <button className="by-title" name="title" onClick={this.onSetSortBy}>{titleTxt}</button>
    </section>
  }
}