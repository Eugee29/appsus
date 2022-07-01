import { eventBusService } from '../../../services/event-bus-service.js'

export class EmailFilter extends React.Component {

  state = {
    filter: {
      search: '',
      option: 'all',
    }
  }

  handleChange = ({ target }) => {
    this.setState(({ filter }) => ({
      filter: { ...filter, [target.name]: target.value }
    }), () => this.onFilter(this.state.filter))
  }

  onFilter = (filter) => {
    eventBusService.emit('email-filter', filter)
  }

  render() {
    return <section className="email-filter">
      <input name="search" type="Search" placeholder="Search Email" onChange={this.handleChange} />
      <select name="option" onChange={this.handleChange}>
        <option value="all">All</option>
        <option value="unread">Unread</option>
        <option value="read">Read</option>
      </select>
    </section>
  }
}