import { eventBusService } from '../../../services/event-bus-service.js'

export class UserMsg extends React.Component {

  state = {
    msg: null,
  }


  removeEvent
  timeoutId

  componentDidMount() {
    this.removeEvent = eventBusService.on('user-msg', (msg) => {
      this.setState({ msg }, () => {
        if (this.timeoutId) clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => this.setState({ msg: null }), 3000)
      })
    })
  }

  onCloseMsg = () => {
    this.setState({ msg: null })
    clearTimeout(this.timeoutId)
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId)
    this.removeEvent()
  }


  render() {
    const { msg } = this.state
    if (!msg) return <React.Fragment />
    return <div className={`user-msg ${msg.type}`}>
      <h1>{msg.txt}</h1>
      <button onClick={this.onCloseMsg}>X</button></div>
  }
}