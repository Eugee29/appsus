import { emailService } from '../services/email.service.js'
import { eventBusService } from '../../../services/event-bus-service.js'
import { EmailStar } from '../cmps/email-star.jsx'

const { Link } = ReactRouterDOM

export class EmailDetails extends React.Component {

  state = {
    email: null
  }

  componentDidMount() {
    this.loadEmail()
      .then(() => {
        const { email } = this.state
        emailService.changeReadStatus(email.id, true)
          .then(() => {
            eventBusService.emit('unread-count', emailService.getUnreadCount())
          })
      })
  }

  loadEmail = () => {
    const { emailId } = this.props.match.params
    return emailService.getById(emailId)
      .then(email => {
        if (!email) return this.props.history.push('/')
        this.setState({ email })
      })
  }

  onDeleteEmail = () => {

    emailService.deleteEmail(this.props.match.params.emailId)
      .then(() => {
        this.props.history.push(`/email/${this.props.match.params.folder}`)
      })
  }

  onStarEmail = (ev, emailId) => {
    ev.stopPropagation()
    emailService.toggleStar(emailId)
      .then(this.loadEmail)
  }


  render() {
    const { email } = this.state
    if (!email) return <h1>Loading...</h1>

    const date = new Date(email.sentAt).toDateString()
    const { folder } = this.props.match.params

    return <section className="email-details main-layout">
      <section className="btn-container">
        <Link className="back-btn" title="Back" to={`/email/${folder}`}></Link>
        <Link className="save-btn" title="Send to Keep" to={`/keep/all?title=${email.subject}&content=${email.body}`}></Link>
        <EmailStar email={email} onStarEmail={this.onStarEmail} />
        <button className="delete-btn" title="Delete" onClick={this.onDeleteEmail}></button>
      </section>
      <header>
        <h1 className="subject">{email.subject}</h1>
      </header>
      <div className="main-container">
        <div className="img-container">
          <img className="img-holder" src="./assets/img/profile.svg" alt="profile" />
        </div>
        <main className="main-content">
          <div className="author-info">
            <h2 className="author-name">{email.authorName}</h2>
            <h3 className="author-email">{email.authorEmail}</h3>
          </div>
          <h4 className="sent-at">{date}</h4>
          <pre className="body">{email.body}</pre>
        </main>
      </div>
    </section>
  }
}

