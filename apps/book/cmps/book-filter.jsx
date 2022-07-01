export class BookFilter extends React.Component {
  state = {
    filter: {
      title: '',
      price: 0
    }
  }

  setFilter = ({ target }) => {
    let { name: title, value, type } = target
    if (type === 'number') value = +value
    this.setState(({ filter }) => ({
      filter: { ...filter, [title]: value }
    }),
      () => this.props.onSetFilter(this.state.filter))
  }


  render() {
    return <form className="filter-by">
      <label htmlFor="by-title">Title</label>
      <input type="text" id="by-title" placeholder="Book title" name="title" onChange={this.setFilter} />

      <label htmlFor="by-price">Price</label>
      <input type="number" id="by-price" placeholder="Max price" name="price" onChange={this.setFilter} />

    </form>
  }
}