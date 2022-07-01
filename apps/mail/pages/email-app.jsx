import { emailService } from '../services/email.service.js'
import { eventBusService } from '../../../services/event-bus-service.js'

import { EmailSort } from '../cmps/email-sort.jsx'
import { EmailList } from '../cmps/email-list.jsx'

const { Route, Switch } = ReactRouterDOM

export class EmailApp extends React.Component {

  state = {
    emails: null,
    filter: null,
    folder: this.props.match.params.folder,
    sortBy: { date: true }
  }

  removeFilterEvent
  removeComposeEvent
  removeUpdateEvent

  componentDidMount() {

    this.loadEmails().then(() => eventBusService.emit('unread-count', emailService.getUnreadCount()))
    this.removeFilterEvent = eventBusService.on('email-filter', (filter) => {
      this.setState({ filter },
        this.loadEmails)

    })

    this.removeComposeEvent = eventBusService.on('send-email', (email) => {
      emailService.sendEmail(email).then(() => {
        eventBusService.emit('user-msg', { txt: 'Email Sent', type: 'success' })
      })
      this.loadEmails()
    })

    this.removeUpdateEvent = eventBusService.on('update-email', (email) => emailService.updateEmail(email).then(this.loadEmails))
  }

  componentDidUpdate({ match }) {
    if (match.params.folder !== this.props.match.params.folder) {
      this.setState({ folder: this.props.match.params.folder, sortBy: { date: true } }, this.loadEmails)
    }
  }

  componentWillUnmount() {
    this.removeFilterEvent()
    this.removeComposeEvent()
    this.removeUpdateEvent()
  }

  onSetSort = (sortBy) => {
    this.setState({ sortBy }, this.loadEmails)
  }

  onStarEmail = (ev, emailId) => {
    ev.stopPropagation()
    emailService.toggleStar(emailId)
      .then(this.loadEmails)
  }

  onDeleteEmail = (ev, emailId) => {
    ev.stopPropagation()
    emailService.deleteEmail(emailId)
      .then(this.loadEmails)
  }

  onReadEmail = (ev, emailId) => {
    ev.stopPropagation()
    emailService.changeReadStatus(emailId)
      .then(this.loadEmails)
  }

  loadEmails = () => {
    return emailService.query(this.state.folder, this.state.filter, this.state.sortBy)
      .then(emails => this.setState({ emails }))
  }

  render() {
    const { emails } = this.state

    if (!emails) return <h1>Loading...</h1>
    return <section className="email-app main-layout">
      <EmailSort onSetSort={this.onSetSort} />
      <EmailList emails={emails} onDeleteEmail={this.onDeleteEmail} onReadEmail={this.onReadEmail} onStarEmail={this.onStarEmail} />
    </section>

  }
}
