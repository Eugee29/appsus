import { eventBusService } from '../../../services/event-bus-service.js'
import { emailService } from '../services/email.service.js'

export class EmailCompose extends React.Component {
  state = {
    email: null,
  }

  draftIntervalId
  editDraftEvent

  componentDidMount() {
    this.editDraftEvent = eventBusService.on('edit-draft', ({ to, subject, body, id }) => this.setState({ email: { to, subject, body, id } }))
    if (!this.props.location.search) return
    const urlSrcPrm = new URLSearchParams(this.props.location.search)
    this.setState({ email: { to: '', subject: urlSrcPrm.get('subject'), body: urlSrcPrm.get('body') } }, this.makeDraft)
  }

  componentWillUnmount() {
    clearInterval(this.draftIntervalId)
    this.draftIntervalId = null
    this.editDraftEvent()
  }

  handleChange = ({ target }) => {
    this.setState(({ email }) => ({
      email: { ...email, [target.name]: target.value },
    }), () => {
      if (!this.draftIntervalId) this.draftIntervalId = setInterval(() => this.updateDraft(this.state.email), 5000)
    })
  }

  onStartComposing = () => {
    this.setState({ email: { to: '', subject: '', body: '' } }, this.makeDraft)
  }

  onStopComposing = () => {
    this.updateDraft(this.state.email)
    this.setState({ email: null })
    clearInterval(this.draftIntervalId)
    this.draftIntervalId = null
  }

  onSendMail = (ev) => {
    ev.preventDefault()
    eventBusService.emit('send-email', this.state.email)
    this.setState({ email: null })
    clearInterval(this.draftIntervalId)
    this.draftIntervalId = null
  }

  makeDraft = () => {
    emailService.addEmail(this.state.email)
      .then((newEmail) =>
        this.setState(({ email }) => ({ email: { ...email, id: newEmail.id } })))
  }

  updateDraft = (email) => {
    eventBusService.emit('update-email', email)
  }

  render() {
    const { email } = this.state

    return (
      <section className="email-compose" >
        <button className="compose-btn" onClick={this.onStartComposing}>
          <h1 className="plus"></h1>
          <h1>Compose</h1>
        </button>
        {email && (
          <form onSubmit={this.onSendMail}>
            <header className="form-header">
              <h1>New Message</h1>
              <button className="close-btn" type="button" onClick={this.onStopComposing}></button>
            </header>
            <main className="form-body">
              <input className="to" type="email" name="to" placeholder="Recipients" onChange={this.handleChange} value={email.to} autoFocus={true} />
              <input className="subject" type="text" name="subject" placeholder="Subject" onChange={this.handleChange} value={email.subject} />
              <textarea className="body" name="body" onChange={this.handleChange} value={email.body} />
              <section className="btn-container">
                <button className="send-btn">Send</button>
              </section>
            </main>
          </form>
        )}
      </section>
    )
  }
}
